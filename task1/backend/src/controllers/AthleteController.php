<?php 
// CRUD operations for athletes and their records

class AthleteController {
    private PDO $pdo;

    public function __construct(PDO $pdo)
    {
        $this->pdo = $pdo;
    }

    public function index(): void {
        $page = (int) $_GET['page'] ?? 1;
        $limit = (int) $_GET['limit'] ?? 10;
        $search = Sanitizer::sanitizeString($_GET['search'] ?? '');
        $sort = $_GET['sort'] ?? 'name';
        $order = $_GET['order'] ?? 'ASC';

        $data = getAllAthletes($this->pdo, $page, $limit, $search, $sort, $order);
        Response::json($data, 200);
    }

    public function show(int $id): void {
        $data = getAthleteById($this->pdo, $id);
        if (!$data) {
            Response::json(['error' => 'Athlete not found.'], 401);
            return;
        }

        Response::json($data, 200);
    }

    public function importFile(): void {
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

    public function delete(): void {
        deleteAllAthletes($this->pdo);
        Response::json(['message' => "Deleted all data"], 200);
    }

    // public function update(): void {
        
    // }

    // public function delete(): void {
        
    // }
}
?>