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
?>