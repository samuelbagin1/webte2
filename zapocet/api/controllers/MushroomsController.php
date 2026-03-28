<?php
// CRUD operations for Olympics events

class MushroomsController {
    private Mushroom $mushroomModel;
    private Cave $caveModel;
    public function __construct()
    {
        global $hostname, $database, $username, $password;
        $pdo = connectDatabase($hostname, $database, $username, $password);
        $this->mushroomModel = new Mushroom($pdo);
        $this->caveModel = new Cave($pdo);
    }

    // Returns a list of distinct mushroom types found in all caves
    // GET /olympics
    public function getDistinctTypes() {
        $data = $this->mushroomModel->getTypes();
        Response::json($data, 200);
    }



    // Creates a new mushroom in a specified cave
    // POST /mushrooms
    public function create() {

        $data = json_decode(file_get_contents('php://input'), true);
        if (!$data) {
            Response::json(['error' => 'Bad data'], 400);
            return;
        }

        if (empty($data['type']) || empty($data['cave_id'])) {
            Response::json(['error' => 'Bad data'], 400);
            return;
        }

        $type = $data['type'];
        $cave_id = $data['cave_id'];

        try {
            $cave = $this->caveModel->getById($cave_id);
        } catch (Exception $e) {
            Response::json(['error' => 'Cave not found'], 404);
            return;
        }

        if (!$cave) {
            Response::json(['error' => 'Cave not found'], 404);
            return;
        }

        try {
            $mushroomId = $this->mushroomModel->getOrCreate($type, $cave_id);
            $data = $this->mushroomModel->getById($mushroomId);
        } catch (Exception $e) {
            Response::json(['error' => 'Bad data'], 400);
            return;
        }

        Response::json($data, 201);

    }

    // Deletes a specific mushroom by its numeric Id
    // DELETE /olympics/{id}
    public function delete($id) {
        $mushroom = $this->mushroomModel->getById((int) $id);
        if (!$mushroom) {
            Response::json(['error' => 'Mushroom not found'], 404);
            return;
        }

        $this->mushroomModel->delete((int) $id);
        http_response_code(204);
    }
}

?>