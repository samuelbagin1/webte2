<?php 

class Athlete {

    private PDO $pdo;
    public function __construct(PDO $pDO)
    {
        $this->pdo = $pDO;
    }


    public function getAll(int $page, int $limit, string $sort = 'a.surname', string $order = 'ASC', ?int $year = null, ?int $discipline = null, ?string $type, ?string $placing): array {
        // sorting helper
        $allowedSorts = ['name' => 'a.name', 'surname' => 'a.surname', 'year' => 'o.year', 'discipline' => 'd.name', 'placing' => 'ar.placing', 'city' => 'o.city', 'type' => 'o.type'];
        $sortCol = $allowedSorts[$sort] ?? 'a.surname';
        $order = $order === 'DESC' ? 'DESC' : 'ASC';

        $where = "";
        $params = [];

        // filter by year, discipline, type LOH/ZOH, placing
        if ($year !== null) {
            $where .= !empty($where) ? ' AND o.year = :year' : 'o.year = :year';
            $params[':year'] = $year;
        }

        if ($discipline !== null) {
            $where .= !empty($where) ? ' AND d.id = :discipline' : 'd.id = :discipline';
            $params[':discipline'] = $discipline;
        }

        if ($type !== null) {
            $where .= !empty($where) ? ' AND o.type = :type' : 'o.type = :type';
            $params[':type'] = $type;
        }

        if ($placing !== null) {
            $where .= !empty($where) ? ' AND ar.placing = :placing' : 'ar.placing = :placing';
            $params[':placing'] = $placing;
        }

        $whereSQL = !empty($where) ? ' WHERE ' . $where : '';

        $baseQuery = "FROM athlete a
            JOIN athlete_record ar ON ar.athlete_id = a.id
            JOIN olympics o ON ar.olympics_id = o.id
            JOIN discipline d ON ar.discipline_id = d.id
            LEFT JOIN country c ON o.country_id = c.id
            $whereSQL";

        // count total
        $countStmt = $this->pdo->prepare("SELECT COUNT(*) $baseQuery");
        $countStmt->execute($params);
        $total = (int) $countStmt->fetchColumn();



        // fetch data
        $dataSQL = "SELECT a.id, a.name, a.surname, o.year, o.type, o.city, c.name AS country, d.name AS discipline, ar.placing $baseQuery ORDER BY $sortCol $order";

        // set limit and offset
        if ($limit > 0) {
            $offset = ($page - 1) * $limit;
            $dataSQL .= " LIMIT $limit OFFSET $offset";
        }

        $stmt = $this->pdo->prepare($dataSQL);
        $stmt->execute($params);
        $data = $stmt->fetchAll(PDO::FETCH_ASSOC);

        return ['data' => $data, 'total' => $total];
    }


    public function getById(int $id): ?array {
        $stmt = $this->pdo->prepare("
            SELECT a.id, a.name, a.surname, a.birth_date, a.birth_place,
                bc.name AS birth_country, a.death_date, a.death_place,
                dc.name AS death_country
            FROM athlete a
            LEFT JOIN country bc ON a.birth_country_id = bc.id
            LEFT JOIN country dc ON a.death_country_id = dc.id
            WHERE a.id = :id
        ");
        $stmt->execute([":id" => $id]);
        $athlete = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$athlete) return null;

        $stmt = $this->pdo->prepare("
            SELECT o.year, o.type, o.city, c.name AS host_country,
                d.name AS discipline, ar.placing
            FROM athlete_record ar
            JOIN olympics o ON ar.olympics_id = o.id
            JOIN country c ON o.country_id = c.id
            JOIN discipline d ON ar.discipline_id = d.id
            WHERE ar.athlete_id = :id
            ORDER BY o.year
        ");
        $stmt->execute([":id" => $id]);
        $athlete['records'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

        return $athlete;
    }


    public function getByName(string $name, string $surname): ?int {
        $stmt = $this->pdo->prepare("SELECT id FROM athlete WHERE name = :name AND surname = :surname LIMIT 1");
        $stmt->execute([":name" => $name, ':surname' => $surname]);
        $id = $stmt->fetchColumn();

        if ($id) return (int) $id;
        else return null;
    }


    public function getOrCreate(string $name, string $surname, DateTime $birthDate, string $birthPlace, string $birthCountryId, ?DateTime $deathDate = null, ?string $deathPlace = null, ?string $deathCountryId = null): int {
        $birthDateStr = $birthDate->format('Y-m-d');
        $deathDateStr = $deathDate ? $deathDate->format('Y-m-d') : null;

        $stmt = $this->pdo->prepare("SELECT id FROM athlete WHERE name = :name AND surname = :surname AND birth_date = :birth_date AND birth_place = :birth_place LIMIT 1");
        $stmt->execute([":name" => $name, ':surname' => $surname, ':birth_date' => $birthDateStr, ':birth_place' => $birthPlace]);
        $id = $stmt->fetchColumn();

        if ($id) return (int) $id;

        $stmt = $this->pdo->prepare("INSERT INTO athlete (name, surname, birth_date, birth_place, birth_country_id, death_date, death_place, death_country_id) VALUES (:name, :surname, :birth_date, :birth_place, :birth_country_id, :death_date, :death_place, :death_country_id)");
        $stmt->execute([':name' => $name, ':surname' => $surname, ':birth_date' => $birthDateStr, ':birth_place' => $birthPlace, ':birth_country_id' => $birthCountryId, ':death_date' => $deathDateStr, ':death_place' => $deathPlace, ':death_country_id' => $deathCountryId]);
        return (int) $this->pdo->lastInsertId();
    }


    public function update(int $id, string $name, string $surname, DateTime $birthDate, string $birthPlace, string $birthCountryId, ?DateTime $deathDate = null, ?string $deathPlace = null, ?string $deathCountryId = null): void {
        $stmt = $this->pdo->prepare("UPDATE athlete SET name = :name, surname = :surname, birth_date = :birth_date, birth_place = :birth_place, birth_country_id = :birth_country_id, death_date = :death_date, death_place = :death_place, death_country_id = :death_country_id WHERE id = :id");
        $stmt->execute([
            ":name" => $name,
            ":surname" => $surname,
            ":birth_date" => $birthDate,
            ":birth_place" => $birthPlace,
            ":birth_country_id" => $birthCountryId,
            ":death_date" => $deathDate,
            ":death_place" => $deathPlace,
            ":death_country_id" => $deathCountryId,
            "id" => $id
            ]);
    }


    public function delete(int $id): void {
        $stmt = $this->pdo->prepare("DELETE FROM athlete WHERE id = :id");
        $stmt->execute([":id" => $id]);
    }


    public function deleteAll(): void {
        $stmt = $this->pdo->prepare("DELETE FROM athlete");
        $stmt->execute();
    }
}

?>