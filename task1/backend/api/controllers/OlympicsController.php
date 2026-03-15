<?php 

class OlympicsController {
    private Olympics $olympicsModel;
    private Country $countryModel;
    public function __construct()
    {
        global $hostname, $database, $username, $password;
        $pdo = connectDatabase($hostname, $database, $username, $password);
        $this->olympicsModel = new Olympics($pdo);
        $this->countryModel = new Country($pdo);
    }

    // list all olympics events
    // GET /olympics
    // {} -> {[{id, type, year, city, host_country, code}]}
    public function index() {
        $data = $this->olympicsModel->getAll();
        
        if (!$data) Response::json(['error' => 'Could not fetch data from database!'], 400);
        Response::json($data, 200);
    }


    // get single olympics event
    // GET /olympics/{id}
    // {id} -> {id, type, year, city, country_id, code}
    public function show($id) {
        $data = $this->olympicsModel->getById($id);
        
        if (!$data) Response::json(['error' => 'Could not fetch data from database!'], 400);
        Response::json($data, 200);
    }


    // create olympics record
    // authenticate
    // POST /olympics
    // {host_country, type, year, city, code} -> {message}
    public function create() {
        AuthMiddleware::verify();

        $data = json_decode(file_get_contents('php://input'), true);

        $name = trim($data['host_country']);
        $type = $data['type'];
        $year = (int) $data['year'];
        $city = trim($data['city']);
        $code = trim($data['code']);

        try {
            $countryId = $this->countryModel->getOrCreate($name);
            $olympicsId = $this->olympicsModel->getOrCreate($type, $year, $city, $countryId, $code);

        } catch (Exception $e) {
            Response::json(['error' => $e], 400);
        }

        Response::json(['message' => 'Successfully created olympics.'], 200);

    }

    // import olympics data from csv
    // authenticate
    // POST /olympics/import
    // {file(.csv/.xlsx/.xls)} -> {message, imported}
    public function import() {
        AuthMiddleware::verify();

        if (!isset($_FILES['file'])) {
            Response::json(['error' => 'No file uploaded.'], 400);
            return;
        }

        $file = $_FILES['file'];
        $extension = pathinfo($file['name'], PATHINFO_EXTENSION);

        if ($extension === 'csv') {
            $data = parseCsvToAssocArray($file['tmp_name']);
        } elseif (in_array($extension, ['xlsx', 'xls'])) {
            $data = parseExcelToAssocArray($file['tmp_name']);
        } else {
            Response::json(['error' => 'Unsupported file type.'], 400);
            return;
        }

        $imported = $this->importData($data);
        Response::json(['message' => "Imported $imported olympics records"], 200);
    }

    // delete olympics record
    // authenticate
    // DELETE /olympics/{id}
    // {id} -> {message}
    public function delete($id) {
        AuthMiddleware::verify();
        $this->olympicsModel->delete($id);
        Response::json(['message' => 'Successfully deleted olympics!'], 200);

    }


    private function importData(array $data): int {
        $imported = 0;

        foreach ($data as $row) {
            $type = trim($row['type'] ?? '');
            $year = trim($row['year'] ?? '');
            $city = trim($row['city'] ?? '');
            $country = trim($row['country'] ?? '');
            $code = trim($row['code'] ?? '');

            if (empty($type) || empty($year) || empty($city) || empty($country)) continue;

            $countryId = $this->countryModel->getOrCreate($country);
            $this->olympicsModel->getOrCreate((int)$year, $type, $city, $countryId, $code ?: null);

            $imported++;
        }

        return $imported;
    }
}

?>