<?php
function detectCsvDelimiter(string $filePath): string
{
    $handle = fopen($filePath, 'r');
    if ($handle === false) return ',';

    $firstLine = fgets($handle);
    fclose($handle);

    if ($firstLine === false) return ',';

    // Pocitanie vyskytov beznych delimiterov v hlavicke
    $delimiters = [',' => 0, ';' => 0, "\t" => 0];
    foreach ($delimiters as $d => &$count) {
        $count = substr_count($firstLine, $d);
    }

    // Vrat delimiter s najvacsim poctom vyskytov
    arsort($delimiters);
    return array_key_first($delimiters);
}

function parseCsvToAssocArray(string $filePath, ?string $delimiter = null): array
{
    if (!file_exists($filePath)) {
        throw new Exception("File does not exist!");
    }

    if ($delimiter === null) {
        $delimiter = detectCsvDelimiter($filePath);
    }

    $handle = fopen($filePath, 'r');
    if ($handle === false) {
        throw new Exception('Could not open file!');
    }

    $headers = fgetcsv($handle, 0, $delimiter);
    if ($headers === false || empty($headers)) {
        fclose($handle);
        throw new Exception('Missing or empty header!');
    }

    // Odstranenie BOM z prveho headeru a trim
    $headers = array_map('trim', $headers);
    $headers[0] = preg_replace('/^\xEF\xBB\xBF/', '', $headers[0]);
    // Odstranenie prazdnych stlpcov z hlavicky
    $validCount = count(array_filter($headers, fn($h) => $h !== ''));

    $data = [];
    while (($row = fgetcsv($handle, 0, $delimiter)) !== false) {
        // Pouzijeme len validny pocet stlpcov (ignorovanie trailing commas)
        $row = array_slice($row, 0, $validCount);
        $trimmedHeaders = array_slice($headers, 0, $validCount);

        if (count($row) === count($trimmedHeaders)) {
            $data[] = array_combine($trimmedHeaders, array_map('trim', $row));
        }
    }

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

function parseDate(string $dateStr): ?DateTime {
    $dateStr = trim($dateStr);
    if (empty($dateStr)) return null;

    // Skus d/m/Y format (napr. 27/8/1928)
    $dt = DateTime::createFromFormat('d/m/Y', $dateStr);
    if ($dt !== false) return $dt;

    // Skus d/m/y format (napr. 7/3/22)
    $dt = DateTime::createFromFormat('d/m/y', $dateStr);
    if ($dt !== false) return $dt;

    // Fallback na standardny PHP parser (Y-m-d, atd.)
    try {
        return new DateTime($dateStr);
    } catch (Exception $e) {
        return null;
    }
}

function importAthletes(PDO $pdo, array $data): int {
    $imported = 0;

    foreach ($data as $row) {
        // Povinne udaje sportovca (podporuje alt nazvy stlpcov z people.csv)
        $name = trim($row['name'] ?? '');
        $surname = trim($row['surname'] ?? '');
        $birthDate = trim($row['birth_date'] ?? $row['birth_day'] ?? '');
        $birthPlace = trim($row['birth_place'] ?? '');
        $birthCountry = trim($row['birth_country'] ?? '');

        $parsedBirthDate = parseDate($birthDate);
        if (empty($name) || empty($surname) || $parsedBirthDate === null || empty($birthCountry)) continue;

        // Volitelne udaje o umrti (podporuje alt nazvy stlpcov)
        $deathDateStr = trim($row['death_date'] ?? $row['death_day'] ?? '');
        $deathPlace = !empty($row['death_place']) ? trim($row['death_place']) : null;
        $deathCountry = !empty($row['death_country']) ? trim($row['death_country']) : null;

        // Vytvorenie alebo ziskanie sportovca
        $athleteId = getOrCreateAthlete(
            $pdo,
            $name,
            $surname,
            $parsedBirthDate,
            $birthPlace,
            $birthCountry,
            !empty($deathDateStr) ? parseDate($deathDateStr) : null,
            $deathPlace,
            $deathCountry
        );

        // Udaje o olympiade (ak su v riadku pritomne)
        $year = $row['year'] ?? $row['olympics_year'] ?? $row['oh_year'] ?? null;
        $type = $row['type'] ?? $row['olympics_type'] ?? $row['oh_type'] ?? null;
        $city = $row['city'] ?? $row['olympics_city'] ?? $row['oh_city'] ?? null;
        $olympicsCountry = $row['olympics_country'] ?? $row['country'] ?? $row['oh_country'] ?? null;

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
function importOlympics(PDO $pdo, array $data): int {
    $imported = 0;

    foreach ($data as $row) {
        $type = trim($row['type'] ?? '');
        $year = trim($row['year'] ?? '');
        $city = trim($row['city'] ?? '');
        $country = trim($row['country'] ?? '');
        $code = trim($row['code'] ?? '');

        if (empty($type) || empty($year) || empty($city) || empty($country)) continue;

        $countryId = getOrCreateCountry($pdo, $country);
        getOrCreateOlympics($pdo, (int)$year, $type, $city, $countryId, $code ?: null);

        $imported++;
    }

    return $imported;
}
?>