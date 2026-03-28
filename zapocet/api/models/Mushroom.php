<?php 

class Mushroom {
    private PDO $pdo;
    public function __construct(PDO $pDO)
    {
        $this->pdo = $pDO;
    }

    public function getTypes(): array {
        $stmt = $this->pdo->query("SELECT DISTINCT type FROM mushroom");
        return $stmt->fetchAll(PDO::FETCH_COLUMN);
    }


    public function getOrCreate(string $type, int $cave_id): int {
        $stmt = $this->pdo->prepare("SELECT id FROM mushroom WHERE cave_id = :cave_id LIMIT 1");
        $stmt->execute([':cave_id' => $cave_id]);
        $id = $stmt->fetchColumn();

        if ($id) return (int) $id;

        $stmt = $this->pdo->prepare("INSERT INTO mushroom (cave_id, type) VALUES (:cave_id, :type)");
        $stmt->execute([
            ':cave_id' => $cave_id,
            ':type' => $type
        ]);

        return (int) $this->pdo->lastInsertId();
    }


    public function getById(int $id): ?array {
        $stmt = $this->pdo->prepare("SELECT * FROM mushroom WHERE id = :id LIMIT 1");
        $stmt->execute([':id' => $id]);
        return $stmt->fetch(PDO::FETCH_ASSOC) ?: null;
    }


    public function delete(int $id): void {
        $stmt = $this->pdo->prepare("DELETE FROM mushroom WHERE id = :id");
        $stmt->execute([':id' => $id]);
    }
}

?>