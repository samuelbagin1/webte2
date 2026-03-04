<?php
require_once __DIR__ . '/../config.php';

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$uri = rtrim($uri, '/');
$method = $_SERVER['REQUEST_METHOD'];

echo json_encode(['status' => 'ok', 'message' => 'API is runnung']);



$data = []; // Definicia premennej pre ukladanie obsahu csv

// Ak bol odoslany formular, a vo formulari sa nachadza subor s klucom csv_file, spracujeme ho.
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_FILES['csv_file'])) {

    $file = $_FILES['csv_file'];  // Ziskame subor zo superglobal pola
    $ext = pathinfo($file['name'], PATHINFO_EXTENSION);  // Zistime pripomu suboru...

    if (strtolower($ext) !== 'csv') {  // ...a skontrolujeme, ci ide o csv subor.
        die("Povolené sú iba CSV súbory.");  // Ak nie, skript sa ukonci.
    }

    if ($file['error'] === 0) {  // Ak bol subor nacitany bez chyby...
        $data = parseCsvToAssocArray($file['tmp_name'], ";");  // ...spracujeme ho pomocou funkcie.
    }
}
?>

<!DOCTYPE html>
<html lang="sk">
<head>
    <meta charset="UTF-8">
    <title>CSV Upload</title>
</head>
<body>

<form method="POST" enctype="multipart/form-data">
    <input type="file" name="csv_file" accept=".csv" required>
    <br><br>
    <button type="submit">Nahrať a spracovať</button>
</form>

<?php if (!empty($data)): ?>
    <h3>Obsah súboru:</h3>
    <pre><?php print_r($data); ?></pre>
<?php endif; ?>

</body>
</html>