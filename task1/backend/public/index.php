<?php
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../src/middleware/CorsMiddleware.php';
require_once __DIR__ . '/../src/middleware/AuthMiddleware.php';

CorsMiddleware::handle();



$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$method = $_SERVER['REQUEST_METHOD'];

if ($uri === '/api/auth/login' && $method === 'POST') {
    $controller = new AuthController($pdo);
    $controller->login();
}

if ($uri === '/api/athletes' && $method === 'GET') {
    AuthMiddleware::verify();
    $controller = new AthleteController($pdo);
    $controller->index();
}

echo json_encode(['status' => 'ok', 'message' => 'API is running']);
?>