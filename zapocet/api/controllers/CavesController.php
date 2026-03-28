<?php
// CRUD operations for Olympics events

class CavesController {
    private Cave $caveModel;
    public function __construct()
    {
        global $hostname, $database, $username, $password;
        $pdo = connectDatabase($hostname, $database, $username, $password);
        $this->caveModel = new Cave($pdo);
    }

    // GET /caves
    // Returns a list of all caves with their associated mushrooms
    public function index() {
        $data = $this->caveModel->getAll();
        Response::json($data, 200);
    }




    // Creates a new cave with the provided data
    // POST /caves
    public function create() {
        $data = json_decode(file_get_contents('php://input'), true);
        if (!$data) {
            Response::json(['error' => 'Bad data'], 400);
            return;
        }

        if (empty($data['name']) || empty($data['found'])) {
            Response::json(['error' => 'Bad data'], 400);
            return;
        }

        $name = trim($data['name']);
        $found = new DateTime($data['found']);

        try {
            $caveId = $this->caveModel->getOrCreate($name, $found);
            $data = $this->caveModel->getById($caveId);

        } catch (Exception $e) {
            Response::json(['error' => 'Bad data'], 400);
            return;
        }

        Response::json($data, 201);

    }
}

?>