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

    public function store(): void {
        $data = json_decode(file_get_contents('php://input'), true);

        $name = Sanitizer::sanitizeString($data['name'] ?? '');
        $surname = Sanitizer::sanitizeString($data['surname'] ?? '');
        $birthDate = $data['birth_date'] ?? '';
        $birthPlace = Sanitizer::sanitizeString($data['birth_place'] ?? '');
        $birthCountry = Sanitizer::sanitizeString($data['birth_country'] ?? '');
        $deathDate = !empty($data['death_date']) ? $data['death_date'] : null;
        $deathPlace = !empty($data['death_place']) ? Sanitizer::sanitizeString($data['death_place']) : null;
        $deathCountry = !empty($data['death_country']) ? Sanitizer::sanitizeString($data['death_country']) : null;

        if (empty($name) || empty($surname) || empty($birthDate) || empty($birthPlace) || empty($birthCountry)) {
            Response::json(['error' => 'Missing required fields: name, surname, birth_date, birth_place, birth_country'], 400);
            return;
        }

        $id = getOrCreateAthlete(
            $this->pdo,
            $name,
            $surname,
            new DateTime($birthDate),
            $birthPlace,
            $birthCountry,
            $deathDate ? new DateTime($deathDate) : null,
            $deathPlace,
            $deathCountry
        );

        Response::json(['message' => 'Athlete created', 'id' => $id], 201);
    }

    // public function update(): void {
        
    // }

    // public function delete(): void {
        
    // }
}
?>