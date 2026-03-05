<?php 
function getOrCreateCountry(PDO $pdo, string $name): int {
    // Najprv najdi, ci krajina s danym nazvom uz existuje.
    $stmt = $pdo->prepare("SELECT id FROM country WHERE name = :name LIMIT 1");
    $stmt->execute([':name' => $name]);
    $id = $stmt->fetchColumn();

    // Ak existuje, vrat jej ID
    if ($id) {
        return (int) $id;
    }

    // Ak neexistuje, vloz novy zaznam a vrat jeho ID.
    $stmt = $pdo->prepare("INSERT INTO country (name) VALUES (:name)");
    $stmt->execute([':name' => $name]);
    return (int) $pdo->lastInsertId();
}


function getOrCreateDiscipline(PDO $pdo, string $name): int {
    $stmt = $pdo->prepare("SELECT id FROM discipline WHERE name = :name LIMIT 1");
    $stmt->execute([':name' => $name]);
    $id = $stmt->fetchColumn();

    if ($id) return (int) $id;

    $stmt = $pdo->prepare("INSERT INTO discipline (name) VALUES (:name)");
    $stmt->execute([':name' => $name]);
    return (int) $pdo->lastInsertId();
}


function getAthlete(PDO $pdo, string $name, string $surname): ?int {
    $stmt = $pdo->prepare("SELECT id FROM athlete WHERE name = :name AND surname = :surname LIMIT 1");
    $stmt->execute([":name" => $name, ':surname' => $surname]);
    $id = $stmt->fetchColumn();

    if ($id) return (int) $id;
    else return null;
}


function getOrCreateAthlete(PDO $pdo, string $name, string $surname, DateTime $birthDate, string $birthPlace, string $birthCountry, ?DateTime $deathDate = null, ?string $deathPlace = null, ?string $deathCountry = null): int {

    $birthCountryId = getOrCreateCountry($pdo, $birthCountry);
    $deathCountryId = getOrCreateCountry($pdo, $deathCountry);

    $stmt = $pdo->prepare("INSERT INTO athlete (name, surname, birth_date, birth_place, birth_country_id, death_date, death_place, death_country_id) VALUES (:name, :surname, :birth_date, :birth_place, :birth_country_id, :death_date, :death_place, :death_country_id)");
    $stmt->execute([':name' => $name, ':surname' => $surname, ':birth_date' => $birthDate, ':birth_place' => $birthPlace, ':birth_country_id' => $birthCountryId, ':death_date' => $deathDate, ':death_place' => $deathPlace, ':death_country_id' => $deathCountryId]);
    return (int) $pdo->lastInsertId();
}


function getOrCreateOlympics(PDO $pdo, int $year, string $type, string $city, int $countryId): int {
    // Najdi OH, podla roku konania a typu - kedze sme ich definovali ako UNIQUE
    $stmt = $pdo->prepare("SELECT id FROM olympics WHERE year = :year AND type = :type LIMIT 1");
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
    if (!$type === 'LOH' && !$type === 'ZOH') throw new BadFunctionCallException('type is not from ENUM: LOH or ZOH');

    // Ak neexistuje, vytvor novy zaznam.
    $stmt = $pdo->prepare("INSERT INTO olympics (year, type, city, country_id) VALUES (:year, :type, :city, :country_id)");
    $stmt->execute([
        ':year' => $year,
        ':type' => $type,
        ':city' => $city,
        ':country_id' => $countryId
    ]);

    // Vrat ID novovytvoreneho zaznamu.
    return (int) $pdo->lastInsertId();
}


function getOrCreateAthleteRecord(PDO $pdo, int $athleteId, int $olympicsId, int $disciplineId, int $placing): int {
    $stmt = $pdo->prepare("SELECT id FROM athlete_record WHERE athlete_id = :athlete_id AND olympics_id = :olympics_id AND discipline_id = :discipline_id LIMIT 1");
    $stmt->execute([
        ':athlete_id' => $athleteId,
        ':olympics_id' => $olympicsId,
        ':discipline_id' => $disciplineId
    ]);
    $id = $stmt->fetchColumn();

    if ($id) {
        return (int) $id;
    }

    // Ak neexistuje, vytvor novy zaznam.
    $stmt = $pdo->prepare("INSERT INTO athlete_record (athlete_id, olympics_id, discipline_id, placing) VALUES (:athlete_id, :olympics_id, :discipline_id, :placing)");
    $stmt->execute([
        ':athlete_id' => $athleteId,
        ':olympics_id' => $olympicsId,
        ':discipline_id' => $disciplineId,
        ':placing' => $placing
    ]);

    // Vrat ID novovytvoreneho zaznamu.
    return (int) $pdo->lastInsertId();
}
?>