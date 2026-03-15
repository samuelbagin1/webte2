<?php 
// CRUD operations for athletes and their records

class AthleteController {
    private Athlete $athleteModel;
    private Olympics $olympicsModel;
    private Country $countryModel;
    private Discipline $disciplineModel;
    private AthleteRecord $athleteRecordModel;

    public function __construct()
    {
        global $hostname, $database, $username, $password;
        $pdo = connectDatabase($hostname, $database, $username, $password);
        $this->athleteModel = new Athlete($pdo);
        $this->olympicsModel = new Olympics($pdo);
        $this->countryModel = new Country($pdo);
        $this->disciplineModel = new Discipline($pdo);
        $this->athleteRecordModel = new AthleteRecord($pdo);
    }


    // return all athlete records by (paginated, filterable, sortable)
    // GET /athletes/records
    // {?page, ?limit, ?sort, ?order, ?type, ?year, ?placing, ?discipline} -> {data[{id, name, surname, year, type, city, country, discipline, placing}], total}
    public function indexRecord(): void {
        $page = isset($_GET['page']) ? (int) $_GET['page'] : 1;
        $limit = isset($_GET['limit']) ? (int) $_GET['limit'] : 10;
        $sort = $_GET['sort'] ?? 'surname';
        $order = $_GET['order'] ?? 'ASC';
        $type = isset($_GET['type']) ? $_GET['type'] : null;
        $year = isset($_GET['year']) ? (int) $_GET['year'] : null;
        $placing = isset($_GET['placing']) ? (int) $_GET['placing'] : null;
        $disciplineId = isset($_GET['discipline']) ? (int) $this->disciplineModel->getByName($_GET['discipline']) : null;

        $result = $this->athleteRecordModel->getAll($page, $limit, $sort, $order, $type, $year, $placing, $disciplineId);
        Response::json($result, 200);
    }


    // get single athlete record with all records by id
    // GET /athletes/records/{id}
    // {id} -> {name, surname, placing, type, year, city, host_country, discipline}
    public function showRecord(int $id): void {
        $data = $this->athleteRecordModel->getById($id);
        if (!$data) {
            Response::json(['error' => 'Athlete not found.'], 404);
            return;
        }

        Response::json($data, 200);
    }


    // return all athletes by (paginated, filterable, sortable)
    // GET /athletes
    // {?page, ?limit, ?sort, ?order, ?year, ?discipline} -> {data[{id, name, surname, year, type, city, country, discipline, placing}], total}
    public function index(): void {
        $page = isset($_GET['page']) ? (int) $_GET['page'] : 1;
        $limit = isset($_GET['limit']) ? (int) $_GET['limit'] : 10;
        $sort = $_GET['sort'] ?? 'surname';
        $order = $_GET['order'] ?? 'ASC';
        $year = isset($_GET['year']) ? (int) $_GET['year'] : null;
        $discipline = isset($_GET['discipline']) ? (int) $_GET['discipline'] : null;

        $result = $this->athleteModel->getAll($page, $limit, $sort, $order, $year, $discipline);
        Response::json($result, 200);
    }


    // get single athlete with all records by id
    // GET /athletes/{id}
    // {id} -> {id, name, surname, birth_date, birth_place, birth_country, death_date, death_place, death_country, records[{year, type, city, host_country, discipline, placing}]}
    public function show(int $id): void {
        $data = $this->athleteModel->getById($id);
        if (!$data) {
            Response::json(['error' => 'Athlete not found.'], 404);
            return;
        }

        Response::json($data, 200);
    }


    // add single athlete with all info and records
    // authenticate
    // POST /athletes
    // {name, surname, birth_date, birth_place, birth_country, ?death_date, ?death_place, ?death_country} -> {message}
    public function create(): void {
        AuthMiddleware::verify();

        $data = json_decode(file_get_contents('php://input'), true);
        try {
            $this->importAthlete($data);
        } catch (Exception $e) {
            Response::json(['error' => $e->getMessage()], 400);
        }

        Response::json(['message' => "Imported athlete."], 200);
    }


    // add multiple athletes from JSON
    // authenticate
    // POST /athletes/batch
    // {file(.json)} -> {message, imported}
    public function createBatch(): void {
        AuthMiddleware::verify();

        if (!isset($_FILES['file'])) {
            Response::json(['error' => 'No file uploaded.'], 400);
            return;
        }

        $file = $_FILES['file'];
        $extension = pathinfo($file['name'], PATHINFO_EXTENSION);

        if ($extension !== 'json') {
            Response::json(['error' => 'File is not .json!'], 400);
        }

        $data = parseJsonToAssocArray($file['tmp_name']);

        $imported = 0;
        foreach ($data as $row) {
            try {
                $athleteId = $this->importAthlete($row);
                $this->importRecord($row, $athleteId);
                $imported++;

            } catch (Exception $e) {
                continue;
            }
        }

        Response::json(['message' => "Imported $imported records"], 200);
    }


    // add single athlete record
    // authenticate
    // POST /athletes/{id}/record
    // {id, year, type, city, olympics_country, discipline, placing} -> {message}
    public function createRecord($id): void {
        AuthMiddleware::verify();

        $data = json_decode(file_get_contents('php://input'), true);
        
        try {
            $this->importRecord($data, $id);
        } catch (Exception $e) {
            Response::json(['error' => $e->getMessage()], 400);
        }
    }


    // add multiple records from JSON
    // authenticate
    // POST /athletes/batch/record
    // {file(.json)[{id, year, type, city, olympics_country, discipline, placing}]} -> {message, imported}
    public function createBatchRecord(): void {
        AuthMiddleware::verify();

        if (!isset($_FILES['file'])) {
            Response::json(['error' => 'No file uploaded.'], 400);
            return;
        }

        $file = $_FILES['file'];
        $extension = pathinfo($file['name'], PATHINFO_EXTENSION);

        if ($extension !== 'json') {
            Response::json(['error' => 'File is not .json!'], 400);
        }

        $data = parseJsonToAssocArray($file['tmp_name']);

        $imported = 0;
        foreach ($data as $row) {
            $this->importRecord($row, (int) $row['athlete_id']);
            $imported++;
        }

        Response::json(['message' => "Imported $imported records"], 200);
    }


    // import athletes from csv file upload
    // authenticate
    // POST /athletes/import
    // {file(.csv/.xlsx/.xls)} -> {message, imported}
    public function import(): void {
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
        Response::json(['message' => "Imported $imported records"], 200);
    }

    
    // modify any data about an athlete
    // authenticate
    // PUT /athletes/{id}
    // {id, name, surname, birth_day, birth_place, birth_country, ?death_day, ?death_place, ?death_country} -> {message}
    public function update($id): void {
        AuthMiddleware::verify();

        $data = json_decode(file_get_contents('php://input'), true);
        $name = Sanitizer::sanitizeString($data['name']);
        $surname = Sanitizer::sanitizeString($data['surname']);
        $birthDate = parseDate($data['birth_day']);
        $birthPlace = trim($data['birth_place']);
        $birthCountryId = $this->countryModel->getOrCreate(trim($data['birth_country']));
        $deathDate = $data['death_day'] !== null ? parseDate($data['death_day']) : null;
        $deathPlace = trim($data['death_place']) ?: null;
        $deathCountryId = $data['death_country'] !== null ? $this->countryModel->getOrCreate(trim($data['death_country'])) : null;

        $this->athleteModel->update($id, $name, $surname, $birthDate, $birthPlace, $birthCountryId,
                    $deathDate, $deathPlace, $deathCountryId);

        Response::json(['message' => 'Successfullu updated athlete info'], 200);
    }


    // modify any record data about an athlete
    // authenticate
    // PUT /athletes/{id}/record
    // {id, olympics_id, discipline_id, placing} -> {message}
    public function updateRecord($id): void {
        AuthMiddleware::verify();

        $data = json_decode(file_get_contents('php://input'), true);
        $this->athleteRecordModel->update($id, $data['olympics_id'], $data['discipline_id'], $data['placing']);

        Response::json(['message' => 'Successfullu updated athlete info'], 200);
    }


    // delete single athlete + cascade all records
    // authenticate
    // DELETE /athletes/{id}
    // {id} -> {message}
    public function delete(int $id): void {
        AuthMiddleware::verify();
        $this->athleteModel->delete($id);
        Response::json(['message' => "Deleted all data"], 200);
    }


    // delete all athletes + cascade all records
    // authenticate
    // DELETE /athletes
    // {} -> {message}
    public function deleteAll(): void {
        AuthMiddleware::verify();
        $this->athleteModel->deleteAll();
        Response::json(['message' => "Deleted all data"], 200);
    }




    // ======== private function ========
    private function importData(array $data): int {
        $imported = 0;

        foreach ($data as $row) {
            try {
                $athleteId = $this->importAthlete($row);
                $this->importRecord($row, $athleteId);
                $imported++;

            } catch (Exception $e) {
                continue;
            }
        }

        return $imported;
    }


    private function importAthlete(array $data): int {
        // povinne udaje sportovca (podporuje alt nazvy stlpcov z people.csv)
        $name = trim($data['name'] ?? '');
        $surname = trim($data['surname'] ?? '');
        $birthDate = trim($data['birth_date'] ?? $data['birth_day'] ?? '');
        $birthPlace = trim($data['birth_place'] ?? '');
        $birthCountry = trim($data['birth_country'] ?? '');

        $parsedBirthDate = parseDate($birthDate);

        if (empty($name) || empty($surname) || $parsedBirthDate === null || empty($birthCountry) || empty($birthPlace)) throw new Exception("Missing data!");

        // volitelne udaje o umrti (podporuje alt nazvy stlpcov)
        $deathDateStr = trim($data['death_date'] ?? $data['death_day'] ?? '');
        $deathPlace = !empty($data['death_place']) ? trim($data['death_place']) : null;
        $deathCountry = !empty($data['death_country']) ? trim($data['death_country']) : null;

        // vytvorenie alebo ziskanie sportovca
        $athleteId = $this->athleteModel->getOrCreate(
            $name,
            $surname,
            $parsedBirthDate,
            $birthPlace,
            $birthCountry,
            !empty($deathDateStr) ? parseDate($deathDateStr) : null,
            $deathPlace,
            $deathCountry
        );

        return $athleteId;
    }


    private function importRecord(array $data, int $athleteId): int {
        // udaje o olympiade (ak su v riadku pritomne)
        $year = $data['year'] ?? $data['olympics_year'] ?? $data['oh_year'] ?? null;
        $type = $data['type'] ?? $data['olympics_type'] ?? $data['oh_type'] ?? null;
        $city = $data['city'] ?? $data['olympics_city'] ?? $data['oh_city'] ?? null;
        $country = $data['olympics_country'] ?? $data['country'] ?? $data['oh_country'] ?? $data['host_country'] ?? null;

        if (!empty($year) && !empty($type) && !empty($city) && !empty($country)) {
            $countryId = $this->countryModel->getOrCreate(trim($country));
            $olympicsId = $this->olympicsModel->getOrCreate(trim($type), (int) $year, trim($city), $countryId);

            // disciplina a umiestnenie
            $discipline = $data['discipline'] ?? null;
            $placing = $data['placing'] ?? null;

            if (!empty($discipline) && !empty($placing)) {
                $disciplineId = $this->disciplineModel->getOrCreate(trim($discipline));
                $athleteRecordId = $this->athleteRecordModel->getOrCreate($athleteId, $olympicsId, $disciplineId, (int)$placing);

                return $athleteRecordId;

            } else {
                throw new Exception("Discipline or placing is empty!");
            }

        } else {
            throw new Exception("Year, type, city or country is empty!");
        }
    }
}
?>