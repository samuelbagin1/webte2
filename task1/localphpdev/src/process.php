<?php
function parseCsvToAssocArray(string $filePath, string $delimiter = ";"): array
{
    $result = [];
    // TODO: kontrola, ci subor na danej ceste existuje.
    $handle = fopen($filePath, 'r');
    // TODO: kontrola, ci sa subor podarilo otvorit.
    $headers = fgetcsv($handle, 0, $delimiter); // Nacitanie hlavicky - prveho riadku suboru. Nazvy v hlavicke sa pouziju ako kluce asoc. pola.
    // TODO: kontrola, ak hlavicka neexistuje.

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