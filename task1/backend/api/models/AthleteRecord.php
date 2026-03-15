<?php 

class AthleteRecord {
    private PDO $pdo;
    public function __construct(PDO $pDO)
    {
        $this->pdo = $pDO;
    }


    public function getOrCreate(int $athleteId, int $olympicsId, int $disciplineId, int $placing): int {
        $stmt = $this->pdo->prepare("SELECT id FROM athlete_record WHERE athlete_id = :athlete_id AND olympics_id = :olympics_id AND discipline_id = :discipline_id LIMIT 1");
        $stmt->execute([
            ':athlete_id' => $athleteId,
            ':olympics_id' => $olympicsId,
            ':discipline_id' => $disciplineId
            ]);
        $id = $stmt->fetchColumn();

        if ($id) return (int) $id;

        $stmt = $this->pdo->prepare("INSERT INTO athlete_record (athlete_id, olympics_id, discipline_id, placing) VALUES (:athlete_id, :olympics_id, :discipline_id, :placing)");
        $stmt->execute([
            ':athlete_id' => $athleteId,
            ':olympics_id' => $olympicsId,
            ':discipline_id' => $disciplineId,
            ':placing' => $placing,
            ]);

        return (int) $this->pdo->lastInsertId();
    }


    public function getAll(): array {
        $stmt = $this->pdo->query("SELECT * FROM athlete_record ORDER BY athlete_id");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }


    public function getById(int $id): ?array {
        $stmt = $this->pdo->prepare("
            SELECT a.name, a.surname, ar.placing
                o.type, o.year, o.city, c.name AS host_country
                d.name AS discipline
            FROM athlete_record ar
            JOIN athlete a ON ar.athlete_id = a.id
            JOIN olympics o ON ar.olympics_id = o.id
            JOIN country c ON o.country_id = c.id
            JOIN discipline d ON ar.discipline = d.id
            WHERE ar.id = :id
            ORDER BY o.year
        ");
        $stmt->execute([":id" => $id]);
        $athleteRecord = $stmt->fetch(PDO::FETCH_ASSOC);

        return $athleteRecord;
    }


    public function update(int $id, int $olympicsId, int $disciplineId, int $placing): void {
        $stmt = $this->pdo->prepare("UPDATE athlete_record SET olympics_id = :olympics_id, discipline_id = :discipline_id, placing = :placing WHERE id = :id");
        $stmt->execute([
            ":olympics_id" => $olympicsId,
            ":discipline_id" => $disciplineId,
            ":placing" => $placing,
            "id" => $id
            ]);
    }


    public function delete(int $id): void {
        $stmt = $this->pdo->prepare("DELETE FROM athlete_record WHERE id = :id");
        $stmt->execute([":id" => $id]);
    }


    public function deleteAllByAthlete(int $id): void {
        $stmt = $this->pdo->prepare("DELETE FROM athlete_record WHERE athlete_id = :id");
        $stmt->execute([":id" => $id]);
    }


    public function deleteAll(): void {
        $stmt = $this->pdo->prepare("DELETE FROM athlete_record");
        $stmt->execute();
    }
}

?>