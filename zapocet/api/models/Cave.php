<?php 

class Cave {
    private PDO $pdo;
    public function __construct(PDO $pDO)
    {
        $this->pdo = $pDO;
    }


    public function getOrCreate(string $name, DateTime $found): int {
        $foundDateStr = $found->format('Y-m-d');

        $stmt = $this->pdo->prepare("SELECT id FROM cave WHERE name = :name AND found = :found LIMIT 1");
        $stmt->execute([':name' => $name, ':found' => $foundDateStr]);
        $id = $stmt->fetchColumn();

        if ($id) return (int) $id;

        $stmt = $this->pdo->prepare("INSERT INTO cave (name, found) VALUES (:name, :found)");
        $stmt->execute([
            ':name' => $name,
            ':found' => $foundDateStr
        ]);

        return (int) $this->pdo->lastInsertId();
    }


    public function getAll(): array {
        $stmt = $this->pdo->query("SELECT id, name, found FROM cave");
        $data = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $ret = [];

        foreach ($data as $row) {
            $stmt = $this->pdo->prepare("SELECT id, type, cave_id FROM mushroom WHERE cave_id = :cid");
            $stmt->execute([':cid' => $row['id']]);
            $d = $stmt->fetchAll(PDO::FETCH_ASSOC);

            $res = $row;
            $res['mushrooms'] = $d;
            $ret[] = $res;
        }

        return $ret;
    }

    public function getById($id): array {
        $stmt = $this->pdo->prepare("SELECT id, name, found FROM cave WHERE id = :id LIMIT 1");
        $stmt->execute([':id' => $id]);
        $data = $stmt->fetch(PDO::FETCH_ASSOC);

        $stmt = $this->pdo->prepare("SELECT id, type, cave_id FROM mushroom WHERE cave_id = :cid");
        $stmt->execute([':cid' => $data['id']]);
        $d = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $res = $data;
        $res['mushrooms'] = $d;

        return $res;
    }
}

?>