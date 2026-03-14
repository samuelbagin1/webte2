<?php 

class Olympics {
    private PDO $pdo;
    public function __construct(PDO $pDO)
    {
        $this->pdo = $pDO;
    }


    public function getOrCreate(string $type, int $year, string $city, int $countryId, ?string $code): int {
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


    public function getYears(): array {
        $stmt = $this->pdo->query("SELECT DISTINCT year FROM olympics ORDER BY year");
        return $stmt->fetchAll(PDO::FETCH_COLUMN);
    }
}

?>