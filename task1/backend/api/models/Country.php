<?php 

class Country {
    private PDO $pdo;
    public function __construct(PDO $pDO)
    {
        $this->pdo = $pDO;
    }


    public function getOrCreate(string $name): int {
        $stmt = $this->pdo->prepare("SELECT id FROM country WHERE name = :name LIMIT 1");
        $stmt->execute([':name' => $name]);
        $id = $stmt->fetchColumn();

        if ($id) return (int) $id;

        $stmt = $this->pdo->prepare("INSERT INTO country (name) VALUES (:name)");
        $stmt->execute([
            ':name' => $name
        ]);

        return (int) $this->pdo->lastInsertId();
    }


    public function getAll(): array {
        $stmt = $this->pdo->query("SELECT id, name FROM country ORDER BY name");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}

?>