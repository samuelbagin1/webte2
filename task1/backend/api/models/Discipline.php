<?php 

class Discipline {
    private PDO $pdo;
    public function __construct(PDO $pDO)
    {
        $this->pdo = $pDO;
    }


    public function getOrCreate(string $name): int {
        $stmt = $this->pdo->prepare("SELECT id FROM discipline WHERE name = :name LIMIT 1");
        $stmt->execute([':name' => $name]);
        $id = $stmt->fetchColumn();

        if ($id) return (int) $id;

        $stmt = $this->pdo->prepare("INSERT INTO discipline (name) VALUES (:name)");
        $stmt->execute([
            ':name' => $name
        ]);

        return (int) $this->pdo->lastInsertId();
    }


    public function getAll(): array {
        $stmt = $this->pdo->query("SELECT id, name FROM discipline ORDER BY name");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}

?>