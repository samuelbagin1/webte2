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
}

?>