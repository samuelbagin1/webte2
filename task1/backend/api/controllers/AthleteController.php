<?php 
// CRUD operations for athletes and their records

class AthleteController {
    private PDO $pdo;

    public function __construct(PDO $pdo)
    {
        $this->pdo = $pdo;
    }


    // return all athletes by (paginated, fiilterable, sortable)
    // GET /athletes
    // {} -> {}
    public function index(): void {
        $page = isset($_GET['page']) ? (int) $_GET['page'] : 1;
        $limit = isset($_GET['limit']) ? (int) $_GET['limit'] : 10;
        $sort = $_GET['sort'] ?? 'surname';
        $order = $_GET['order'] ?? 'ASC';
        $year = isset($_GET['year']) ? (int) $_GET['year'] : null;
        $discipline = isset($_GET['discipline']) ? (int) $_GET['discipline'] : null;

        $result = getAllAthletes($this->pdo, $page, $limit, $sort, $order, $year, $discipline);
        Response::json($result, 200);
    }


    // get single athlete with all recors by id
    // GET /athletes/{id}
    // {} -> {}
    public function show(int $id): void {
        $data = getAthleteById($this->pdo, $id);
        if (!$data) {
            Response::json(['error' => 'Athlete not found.'], 404);
            return;
        }

        Response::json($data, 200);
    }


    // add single olympian with all info
    // authenticate
    // POST /athletes
    // {name, surname, birth, recors} -> {}
    public function create(): void {

    }


    // add multiple olympians from JSON
    // authenticate
    // POST /athletes/batch
    // {} -> {}
    public function createBatch(): void {

    }


    // import athletes from csv file upload
    // authenticate
    // POST /athletes/import
    // {} -> {}
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

        $imported = importAthletes($this->pdo, $data);
        Response::json(['message' => "Imported $imported records"], 200);
    }

    
    // modify any data about an athlete
    // authenticate
    // PUT /athletes/{id}
    // {} -> {}
    public function update(): void {
        
    }


    // delete single athlete + cascade all records
    // authenticate
    // DELETE /athletes/{id}
    // {} -> {}
    public function delete(): void {
        AuthMiddleware::verify();
        deleteAllAthletes($this->pdo);
        Response::json(['message' => "Deleted all data"], 200);
    }


    // delete all athletes + cascade all records
    // authenticate
    // DELETE /athletes
    // {} -> {}
    public function deleteAll(): void {
        AuthMiddleware::verify();
        deleteAllAthletes($this->pdo);
        Response::json(['message' => "Deleted all data"], 200);
    }
}
?>