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


function parseJsonToAssocArray(string $filePath): array {
    $array = [];

    return $array;
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




?>