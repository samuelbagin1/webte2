<?php 

function getAllAthletes(PDO $pdo, int $page, int $limit, string $sort = 'a.surname', string $order = 'ASC', ?int $year = null, ?int $discipline = null): array {
    // sorting helper
    $allowedSorts = ['name' => 'a.name', 'surname' => 'a.surname', 'year' => 'o.year', 'discipline' => 'd.name', 'placing' => 'ar.placing', 'city' => 'o.city', 'type' => 'o.type'];
    $sortCol = $allowedSorts[$sort] ?? 'a.surname';
    $order = $order === 'DESC' ? 'DESC' : 'ASC';

    $where = "";
    $params = [];

    // filter by category and year
    if ($year !== null) {
        $where .= !empty($where) ? ' AND o.year = :year' : 'o.year = :year';
        $params[':year'] = $year;
    }

    if ($discipline !== null) {
        $where .= !empty($where) ? ' AND d.id = :discipline' : 'd.id = :discipline';
        $params[':discipline'] = $discipline;
    }

    $whereSQL = !empty($where) ? ' WHERE ' . $where : '';

    $baseQuery = "FROM athlete a
        JOIN athlete_record ar ON ar.athlete_id = a.id
        JOIN olympics o ON ar.olympics_id = o.id
        JOIN discipline d ON ar.discipline_id = d.id
        LEFT JOIN country c ON o.country_id = c.id
        $whereSQL";

    // count total
    $countStmt = $pdo->prepare("SELECT COUNT(*) $baseQuery");
    $countStmt->execute($params);
    $total = (int) $countStmt->fetchColumn();



    // fetch data
    $dataSQL = "SELECT a.id, a.name, a.surname, o.year, o.type, o.city, c.name AS country, d.name AS discipline, ar.placing $baseQuery ORDER BY $sortCol $order";

    // set limit and offset
    if ($limit > 0) {
        $offset = ($page - 1) * $limit;
        $dataSQL .= " LIMIT $limit OFFSET $offset";
    }

    $stmt = $pdo->prepare($dataSQL);
    $stmt->execute($params);
    $data = $stmt->fetchAll(PDO::FETCH_ASSOC);

    return ['data' => $data, 'total' => $total];
}

function getYearsOfOlympics(PDO $pdo): array {
    $stmt = $pdo->query("SELECT DISTINCT year FROM olympics ORDER BY year");
    return $stmt->fetchAll(PDO::FETCH_COLUMN);
}

function getDisciplines(PDO $pdo): array {
    $stmt = $pdo->query("SELECT id, name FROM discipline ORDER BY name");
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}

function deleteAllAthletes(PDO $pdo): void {
    $stmt = $pdo->prepare("DELETE FROM athlete");
    $stmt->execute();
}

function getAthleteById(PDO $pdo, int $id): ?array {
    $stmt = $pdo->prepare("
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

    $stmt = $pdo->prepare("
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

function getAthlete(PDO $pdo, string $name, string $surname): ?int {
    $stmt = $pdo->prepare("SELECT id FROM athlete WHERE name = :name AND surname = :surname LIMIT 1");
    $stmt->execute([":name" => $name, ':surname' => $surname]);
    $id = $stmt->fetchColumn();

    if ($id) return (int) $id;
    else return null;
}


function getOrCreateAthlete(PDO $pdo, string $name, string $surname, DateTime $birthDate, string $birthPlace, string $birthCountry, ?DateTime $deathDate = null, ?string $deathPlace = null, ?string $deathCountry = null): int {
    $birthDateStr = $birthDate->format('Y-m-d');
    $deathDateStr = $deathDate ? $deathDate->format('Y-m-d') : null;

    $stmt = $pdo->prepare("SELECT id FROM athlete WHERE name = :name AND surname = :surname AND birth_date = :birth_date AND birth_place = :birth_place LIMIT 1");
    $stmt->execute([":name" => $name, ':surname' => $surname, ':birth_date' => $birthDateStr, ':birth_place' => $birthPlace]);
    $id = $stmt->fetchColumn();

    if ($id) return (int) $id;

    $birthCountryId = getOrCreateCountry($pdo, $birthCountry);
    $deathCountryId = $deathCountry ? getOrCreateCountry($pdo, $deathCountry) : null;

    $stmt = $pdo->prepare("INSERT INTO athlete (name, surname, birth_date, birth_place, birth_country_id, death_date, death_place, death_country_id) VALUES (:name, :surname, :birth_date, :birth_place, :birth_country_id, :death_date, :death_place, :death_country_id)");
    $stmt->execute([':name' => $name, ':surname' => $surname, ':birth_date' => $birthDateStr, ':birth_place' => $birthPlace, ':birth_country_id' => $birthCountryId, ':death_date' => $deathDateStr, ':death_place' => $deathPlace, ':death_country_id' => $deathCountryId]);
    return (int) $pdo->lastInsertId();
}
?>