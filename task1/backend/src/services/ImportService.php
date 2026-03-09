<?php
function parseCsvToAssocArray(string $filePath, string $delimiter = ";"): array
{
    $result = [];

    if (!file_exists($filePath)) {
        throw new Exception("File does not exist!");
    }
    
    $handle = fopen($filePath, 'r');
    if ($handle === false) {
        throw new Exception('Could not open file!');
    }

    $headers = fgetcsv($handle, 0, $delimiter); // Nacitanie hlavicky - prveho riadku suboru. Nazvy v hlavicke sa pouziju ako kluce asoc. pola.
    if ($headers === false || empty($headers)) {
        fclose($handle);
        throw new Exception('Missing or empty header!');
    }

    // Parsovanie riadkov
    while (($row = fgetcsv($handle, 0, $delimiter)) !== false) {
        if (count($row) === count($headers)) {
            $data[] = array_combine($headers, $row);
        }
    }

    // Korektne ukoncenie prace so suborom a vratenie spracovanych dat.
    fclose($handle);
    return $data;
}

function parseExcelToAssocArray(string $filePath): array {
    if (!file_exists($filePath)) {
        throw new Exception("File does not exist: $filePath");
    }

    $spreadsheet = \PhpOffice\PhpSpreadsheet\IOFactory::load($filePath);
    $sheet = $spreadsheet->getActiveSheet();
    $rows = $sheet->toArray(null, true, true, false);

    if (empty($rows)) {
        throw new Exception('Empty spreadsheet!');
    }

    // Prvy riadok su hlavicky
    $headers = array_shift($rows);
    if (empty($headers)) {
        throw new Exception('Missing or empty header row!');
    }

    $data = [];
    foreach ($rows as $row) {
        if (count($row) === count($headers)) {
            $data[] = array_combine($headers, $row);
        }
    }

    return $data;
}

function importAthletes(PDO $pdo, array $data): int {
    $imported = 0;

    foreach ($data as $row) {
        // Povinne udaje sportovca
        $name = trim($row['name'] ?? '');
        $surname = trim($row['surname'] ?? '');
        $birthDate = trim($row['birth_date'] ?? '');
        $birthPlace = trim($row['birth_place'] ?? '');
        $birthCountry = trim($row['birth_country'] ?? '');

        if (empty($name) || empty($surname) || empty($birthDate) || empty($birthCountry)) continue;

        // Volitelne udaje o umrti
        $deathDate = !empty($row['death_date']) ? trim($row['death_date']) : null;
        $deathPlace = !empty($row['death_place']) ? trim($row['death_place']) : null;
        $deathCountry = !empty($row['death_country']) ? trim($row['death_country']) : null;

        // Vytvorenie alebo ziskanie sportovca
        $athleteId = getOrCreateAthlete(
            $pdo,
            $name,
            $surname,
            new DateTime($birthDate),
            $birthPlace,
            $birthCountry,
            $deathDate ? new DateTime($deathDate) : null,
            $deathPlace,
            $deathCountry
        );

        // Udaje o olympiade (ak su v riadku pritomne)
        $year = $row['year'] ?? $row['olympics_year'] ?? null;
        $type = $row['type'] ?? $row['olympics_type'] ?? null;
        $city = $row['city'] ?? $row['olympics_city'] ?? null;
        $olympicsCountry = $row['olympics_country'] ?? $row['country'] ?? null;

        if (!empty($year) && !empty($type) && !empty($city) && !empty($olympicsCountry)) {
            $olympicsCountryId = getOrCreateCountry($pdo, trim($olympicsCountry));
            $olympicsId = getOrCreateOlympics($pdo, (int)$year, trim($type), trim($city), $olympicsCountryId);

            // Disciplina a umiestnenie
            $discipline = $row['discipline'] ?? null;
            $placing = $row['placing'] ?? null;

            if (!empty($discipline) && !empty($placing)) {
                $disciplineId = getOrCreateDiscipline($pdo, trim($discipline));
                getOrCreateAthleteRecord($pdo, $athleteId, $olympicsId, $disciplineId, (int)$placing);
            }
        }

        $imported++;
    }

    return $imported;
}
?>