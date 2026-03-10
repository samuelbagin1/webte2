<?php 
// handles csv/exce; file uploads and imports data into db

class ImportController {
    private PDO $pdo;

    public function __construct(PDO $pdo)
    {
        $this->pdo = $pdo;
    }

    public function import(): void {
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
        
    }
}
?>