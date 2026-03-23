<?php 

class DisciplineController {
    private Discipline $disciplineModel;
    public function __construct()
    {
        global $hostname, $database, $username, $password;
        $pdo = connectDatabase($hostname, $database, $username, $password);
        $this->disciplineModel = new Discipline($pdo);
    }

    // list all olympics events
    // GET /olympics
    // {} -> {[{id, type, year, city, host_country, code}]}
    public function index() {
        $data = $this->disciplineModel->getAll();
        
        Response::json($data, 200);
    }


    // get single discipline
    // GET /disciplines/{id}
    // {id} -> {id, name}
    public function show($id) {
        $data = $this->disciplineModel->getById($id);

        if (!$data) { Response::json(['error' => 'Discipline not found!'], 404); return; }
        Response::json($data, 200);
    }


    // create olympics record
    // authenticate
    // POST /olympics
    // {host_country, type, year, city, code} -> {message}
    public function create() {
        AuthMiddleware::verify();

        $data = json_decode(file_get_contents('php://input'), true);

        $name = trim($data['name']);

        try {
            $disciplineId = $this->disciplineModel->getOrCreate($name);

        } catch (Exception $e) {
            Response::json(['error' => $e->getMessage()], 400);
            return;
        }

        Response::json(['message' => 'Successfully created discipline.', 'id' => $disciplineId, 'name' => $name], 200);

    }

    // delete olympics record
    // authenticate
    // DELETE /olympics/{id}
    // {id} -> {message}
    public function delete($id) {
        AuthMiddleware::verify();
        $this->disciplineModel->delete($id);
        Response::json(['message' => 'Successfully deleted olympics!'], 200);

    }
}

?>