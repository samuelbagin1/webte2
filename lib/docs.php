<?php
// Load database connection
require_once __DIR__ . '/../config.php';

// Set JSON response headers
header("Content-Type: application/json; charset=UTF-8");
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');


// Handle preflight OPTIONS request (CORS)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// Get PDO connection
// connect in config.php and then use global $pdo
$pdo = connectDatabase();

// Get the request method
$method = $_SERVER['REQUEST_METHOD'];

// Parse the REQUEST_URI to extract resource and ID
// Nginx passes: /api/athletes → resource="athletes", id=null
//               /api/athletes/5 → resource="athletes", id=5
$requestUri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);


// $uri = "/api/athletes/5";
// $segments = explode('/', trim($uri, '/'));
// $resource = $segments[1];
// $id = $segments[2];

// // Result: ["api", "athletes", "5"]
// // $segments[0] = "api"
// // $segments[1] = "athletes"
// // $segments[2] = "5"


// Match pattern: /api/{resource}/{id?}
$resource = null;
$id = null;
 
if (preg_match('#^/api/(\w+)(?:/(\d+))?$#', $requestUri, $matches)) {
    $resource = $matches[1];           // e.g. "athletes"
    $id = isset($matches[2]) ? (int)$matches[2] : null;  // e.g. 5 or null
}
 
// Validate resource
if ($resource !== 'athletes') {
    http_response_code(404);
    echo json_encode(['error' => 'Unknown resource: ' . $resource]);
    exit;
}


switch ($method) {

    // ========== GET ATHLETES (all or by ID) ==========
    case 'GET':
        try {
            if ($id) {
                // GET /api/5 → single athlete
                $stmt = $pdo->prepare('SELECT * FROM athletes WHERE id = :id');
                $stmt->execute([':id' => $id]);
                $athlete = $stmt->fetch(PDO::FETCH_ASSOC);
 
                if (!$athlete) {
                    http_response_code(404);
                    echo json_encode(['error' => 'Athlete not found']);
                } else {
                    // http_response_code(200);
                    echo json_encode($athlete);
                }

            } else {
                // GET /api → all athletes
                $stmt = $pdo->query('SELECT * FROM athletes ORDER BY id ASC');
                $athletes = $stmt->fetchAll(PDO::FETCH_ASSOC);
                // http_response_code(200);
                echo json_encode($athletes);
            }

        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
        break;



    // ========== CREATE NEW ATHLETE ==========
    case 'POST':
        try {
            // Read JSON body
            $data = json_decode(file_get_contents('php://input'), true);

            // Validate required fields
            if (empty($data['name']) || empty($data['last_name']) || empty($data['sport'])) {
                http_response_code(400);
                echo json_encode(['error' => 'Missing required fields: name, last_name, sport']);
                break;
            }

            $stmt = $pdo->prepare('INSERT INTO athletes (name, last_name, sport) VALUES (:name, :last_name, :sport)');
            $stmt->execute([
                ':name' => $data['name'],
                ':last_name' => $data['last_name'],
                ':sport' => $data['sport']
            ]);

            http_response_code(201);
            echo json_encode([
                'message' => 'Athlete created',
                'id'      => $pdo->lastInsertId(),
            ]);

        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
        break;



    // ========== DELETE ATHLETE BY ID ==========
    case 'DELETE':
        try {
            if (!$id) {
                http_response_code(400);
                echo json_encode(['error' => 'Missing athlete ID in URL']);
                break;
            }

            $stmt = $pdo->prepare('DELETE FROM athletes WHERE id = :id');
            $stmt->execute([':id' => $id]);

            if ($stmt->rowCount() === 0) {
                http_response_code(404);
                echo json_encode(['error' => 'Athlete not found']);
            } else {
                echo json_encode(['message' => 'Athlete deleted', 'id' => $id]);
            }

        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
        break;


        
    default:
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
        break;
}
?>