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


    public function update(int $id, string $name): void {
        $stmt = $this->pdo->prepare("UPDATE country SET name = :name WHERE id = :id");
        $stmt->execute([
            ':id' => $id,
            ':name' => $name
        ]);
    }


    public function getById(int $id): ?array {
        $stmt = $this->pdo->prepare("SELECT * FROM country WHERE id = :id");
        $stmt->execute([':id' => $id]);
        return $stmt->fetch(PDO::FETCH_ASSOC) ?: null;
    }


    public function getAll(): array {
        $stmt = $this->pdo->query("SELECT id, name FROM country ORDER BY name");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }


    public function delete(int $id): void {
        $stmt = $this->pdo->prepare("DELETE FROM country WHERE id = :id");
        $stmt->execute([':id' => $id]);
    }


    public function deleteAll(): void {
        $stmt = $this->pdo->prepare("DELETE FROM country");
        $stmt->execute();
    }
}

?>