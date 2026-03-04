<?php 
function getOrCreateCountry(PDO $pdo, string $name): int {
    // Najprv najdi, ci krajina s danym nazvom uz existuje.
    $stmt = $pdo->prepare("SELECT id FROM countries WHERE name = :name LIMIT 1");
    $stmt->execute([':name' => $name]);
    $id = $stmt->fetchColumn();

    // Ak existuje, vrat jej ID
    if ($id) {
        return (int) $id;
    }

    // Ak neexistuje, vloz novy zaznam a vrat jeho ID.
    $stmt = $pdo->prepare("INSERT INTO countries (name, code) VALUES (:name, NULL)");
    $stmt->execute([':name' => $name]);
    return (int) $pdo->lastInsertId();
}

function getOrCreateGames(PDO $pdo, int $year, string $type, string $city, int $countryId): int {
    // Najdi OH, podla roku konania a typu - kedze sme ich definovali ako UNIQUE
    $stmt = $pdo->prepare("SELECT id FROM olympic_games WHERE year = :year AND type = :type LIMIT 1");
    $stmt->execute([
        ':year' => $year,
        ':type' => $type
    ]);
    $id = $stmt->fetchColumn();

    // Ak existuje, vrat ID.
    if ($id) {
        return (int) $id;
    }

    // TODO: kontrola, ci argument type splna podmienky ENUM typu (LOH,ZOH)

    // Ak neexistuje, vytvor novy zaznam.
    $stmt = $pdo->prepare("INSERT INTO olympic_games (year, type, city, country_id) VALUES (:year, :type, :city, :country_id)");
    $stmt->execute([
        ':year' => $year,
        ':type' => $type,
        ':city' => $city,
        ':country_id' => $countryId
    ]);

    // Vrat ID novovytvoreneho zaznamu.
    return (int) $pdo->lastInsertId();
}
?>