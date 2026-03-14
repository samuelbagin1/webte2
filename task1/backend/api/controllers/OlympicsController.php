<?php 

class OlympicsController {

    // list all olympics events
    // GET /olympics
    // {} -> {}
    public function index() {

    }


    // get single olympics event
    // GET /olympics/{id}
    // {} -> {}
    public function show() {

    }


    // create olympics record
    // authenticate
    // POST /olympics
    // {} -> {}
    public function create() {

    }

    // import olympics data from csv
    // authenticate
    // POST /olympics/import
    // {} -> {}
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

        $imported = importOlympics($this->pdo, $data);
        Response::json(['message' => "Imported $imported olympics records"], 200);
    }

    // delete olympics record
    // authenticate
    // DELETE /olympics/{id}
    // {} -> {}
    public function delete() {

    }

}

?>