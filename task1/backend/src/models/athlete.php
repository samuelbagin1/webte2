<?php 

function getAllAthletes(PDO $pdo, int $page, int $limit, string $search, string $sort = 'name', string $order = 'ASC'): array {
    $offset = ($page - 1)*$limit;
    $allowedSorts = ['name', 'surname', 'birth_date'];
    $sort = in_array($sort, $allowedSorts) ? $sort : 'name';
    $order = $order === 'DESC' ? 'DESC' : 'ASC';

    $stmt = $pdo->prepare("SELECT * FROM athlete WHERE name LIKE :search OR surname LIKE :search ORDER BY $sort $order LIMIT :limit OFFSET :offset");
    $stmt->execute([':search' => "%$search%", ':limit' => $limit, ':offset' => $offset]);

    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}

function deleteAllAthletes(PDO $pdo): void {
    $stmt = $pdo->prepare("DELETE FROM athlete");
    $stmt->execute();
}

function getAthleteById(PDO $pdo, int $id): array {
    $stmt = $pdo->prepare("SELECT * FROM athlete WHERE id = :id");
    $stmt->execute([":id" => $id]);
    return $stmt->fetchAll(PDO::FETCH_ASSOC); 
}

function getAthlete(PDO $pdo, string $name, string $surname): ?int {
    $stmt = $pdo->prepare("SELECT id FROM athlete WHERE name = :name AND surname = :surname LIMIT 1");
    $stmt->execute([":name" => $name, ':surname' => $surname]);
    $id = $stmt->fetchColumn();

    if ($id) return (int) $id;
    else return null;
}


function getOrCreateAthlete(PDO $pdo, string $name, string $surname, DateTime $birthDate, string $birthPlace, string $birthCountry, ?DateTime $deathDate = null, ?string $deathPlace = null, ?string $deathCountry = null): int {
    $stmt = $pdo->prepare("SELECT id FROM athlete WHERE name = :name AND surname = :surname AND birth_date = :birth_date AND birth_place = :birth_place LIMIT 1");
    $stmt->execute([":name" => $name, ':surname' => $surname, ':birth_date' => $birthDate, ':birth_place' => $birthPlace]);
    $id = $stmt->fetchColumn();

    if ($id) return (int) $id;

    $birthCountryId = getOrCreateCountry($pdo, $birthCountry);
    $deathCountryId = getOrCreateCountry($pdo, $deathCountry);

    $stmt = $pdo->prepare("INSERT INTO athlete (name, surname, birth_date, birth_place, birth_country_id, death_date, death_place, death_country_id) VALUES (:name, :surname, :birth_date, :birth_place, :birth_country_id, :death_date, :death_place, :death_country_id)");
    $stmt->execute([':name' => $name, ':surname' => $surname, ':birth_date' => $birthDate, ':birth_place' => $birthPlace, ':birth_country_id' => $birthCountryId, ':death_date' => $deathDate, ':death_place' => $deathPlace, ':death_country_id' => $deathCountryId]);
    return (int) $pdo->lastInsertId();
}
?>