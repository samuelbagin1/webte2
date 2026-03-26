<?php 

class Olympics {
    private PDO $pdo;
    public function __construct(PDO $pDO)
    {
        $this->pdo = $pDO;
    }


    public function getOrCreate(string $type, int $year, string $city, int $countryId, ?string $code = null): int {
        $stmt = $this->pdo->prepare("SELECT id FROM olympics WHERE type = :type AND year = :year AND country_id = :country_id LIMIT 1");
        $stmt->execute([':type' => $type, ':year' => $year, ':country_id' => $countryId]);
        $id = $stmt->fetchColumn();

        if ($id) return (int) $id;

        if ($type !== 'LOH' && $type !== 'ZOH') throw new Exception('type is not from ENUM: LOH or ZOH');

        $stmt = $this->pdo->prepare("INSERT INTO olympics (type, year, city, country_id, code) VALUES (:type, :year, :city, :country_id, :code)");
        $stmt->execute([
            ':type' => $type,
            ':year' => $year,
            ':city' => $city,
            ':country_id' => $countryId,
            ':code' => $code
        ]);

        return (int) $this->pdo->lastInsertId();
    }


    public function getById(int $id): ?array {
        $stmt = $this->pdo->prepare("SELECT * FROM olympics WHERE id = :id");
        $stmt->execute([':id' => $id]);
        return $stmt->fetch(PDO::FETCH_ASSOC) ?: null;
    }


    public function getAll(): array {
        $stmt = $this->pdo->prepare("SELECT o.id, o.type, o.year, o.city, c.name AS host_country, o.code
            FROM olympics o
            JOIN country c ON o.country_id = c.id
            ORDER BY o.year"
        );
        $stmt->execute();

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }


    public function update(int $id, string $type, int $year, string $city, int $countryId, string $code): void {
        $stmt = $this->pdo->prepare("UPDATE olympics SET type = :type, year = :year, city = :city, country_id = :country_id, code = :code WHERE id = :id");
        $stmt->execute([
            ':id' => $id,
            ':type' => $type,
            ':year' => $year,
            ':city' => $city,
            ':country_id' => $countryId,
            ':code' => $code
        ]);
    }


    public function getYears(): array {
        $stmt = $this->pdo->query("SELECT DISTINCT year FROM olympics ORDER BY year");
        return $stmt->fetchAll(PDO::FETCH_COLUMN);
    }


    public function delete(int $id): void {
        $stmt = $this->pdo->prepare("DELETE FROM olympics WHERE id = :id");
        $stmt->execute([':id' => $id]);
    }


    public function deleteAll(): void {
        $stmt = $this->pdo->prepare("DELETE FROM olympics");
        $stmt->execute();
    }
}

?>