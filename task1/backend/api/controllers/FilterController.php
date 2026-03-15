<?php 

class FilterController {
    private Olympics $olympicsModel;
    private Discipline $disciplineModel;
    public function __construct()
    {
        global $hostname, $database, $username, $password;
        $pdo = connectDatabase($hostname, $database, $username, $password);
        $this->olympicsModel = new Olympics($pdo);
        $this->disciplineModel = new Discipline($pdo);
    }

    // get distinct olympic years
    // GET /filters/years
    // {} -> {[year]}
    public function years() {
        $data = $this->olympicsModel->getYears();
        if (!$data) { Response::json(['error' => 'Could not fetch years from database'], 500); return; }
        Response::json($data, 200);
    }

    // get all disciplines
    // GET /filters/disciplines
    // {} -> {[name]}
    public function disciplines() {
        $data = $this->disciplineModel->getAll();
        if (!$data) { Response::json(['error' => 'Could not fetch disciplines from database'], 500); return; }
        Response::json($data, 200);
    }
}

?>