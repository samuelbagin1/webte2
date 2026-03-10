<?php
session_start();

require_once __DIR__ . '/../config.php';

// Middleware
require_once __DIR__ . '/../src/middleware/CorsMiddleware.php';
require_once __DIR__ . '/../src/middleware/AuthMiddleware.php';

// Helpers
require_once __DIR__ . '/../src/helpers/Response.php';
require_once __DIR__ . '/../src/helpers/Sanitizer.php';

// Models
require_once __DIR__ . '/../src/models/user.php';
require_once __DIR__ . '/../src/models/athlete.php';
require_once __DIR__ . '/../src/models/insert.php';
require_once __DIR__ . '/../src/models/loginHistory.php';

// Services
require_once __DIR__ . '/../src/services/authenticate.php';
require_once __DIR__ . '/../src/services/validate.php';
require_once __DIR__ . '/../src/services/importService.php';
require_once __DIR__ . '/../src/services/GoogleOAuthService.php';
require_once __DIR__ . '/../src/services/TwoFactorService.php';

// Controllers
require_once __DIR__ . '/../src/controllers/AuthController.php';
require_once __DIR__ . '/../src/controllers/AthleteController.php';
require_once __DIR__ . '/../src/controllers/UserController.php';
require_once __DIR__ . '/../src/controllers/OAuthController.php';
require_once __DIR__ . '/../src/controllers/ImportController.php';



CorsMiddleware::handle();
$pdo = connectDatabase($hostname, $database, $username, $password);


$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$method = $_SERVER['REQUEST_METHOD'];


// AUH routes
if ($uri === '/api/auth/login' && $method === 'POST') {
    $controller = new AuthController($pdo);
    $controller->login();
    exit;
}

if ($uri === '/api/auth/register' && $method === 'POST'){
    $controller = new AuthController($pdo);
    $controller->register();
    exit;
}

if ($uri === '/api/auth/logout' && $method === 'POST'){
    AuthMiddleware::verify();
    $controller = new AuthController($pdo);
    $controller->logout();
    exit;
}


// OAUTH routes
if ($uri === '/api/auth/google' && $method === 'GET') {
    $controller = new OAuthController($pdo);
    $controller->redirectToGoogle();
    exit;
}

if ($uri === '/api/auth/google/callback' && $method === 'GET') {
    $controller = new OAuthController($pdo);
    $controller->handleCallback();
    exit;
}


// ATHLETE routes
if ($uri === '/api/athletes' && $method === 'GET') {
    AuthMiddleware::verify();
    $controller = new AthleteController($pdo);
    $controller->index();
    exit;
}

if (preg_match('#^/api/athletes/(\d+)$#', $uri, $matches) && $method === 'GET') {
    AuthMiddleware::verify();
    $controller = new AthleteController($pdo);
    $controller->show((int) $matches[1]);
    exit;
}

if ($uri === '/api/athletes' && $method === 'POST') {
    AuthMiddleware::verify();
    $controller = new AthleteController($pdo);
    $controller->store();
    exit;
}


// USER routes
if ($uri === '/api/user/profile' && $method === 'GET') {
    AuthMiddleware::verify();
    $controller = new UserController($pdo);
    $controller->profile();
    exit;
}

if ($uri === '/api/user/2fa' && $method === 'POST') {
    AuthMiddleware::verify();
    $controller = new UserController($pdo);
    $controller->setup2FA();
    exit;
}


// IMPORT routes
if ($uri === '/api/import' && $method === 'POST') {
    AuthMiddleware::verify();
    $controller = new ImportController($pdo);
    $controller->import();
    exit;
}

if ($uri === '/api/import' && $method === 'DELETE') {
    AuthMiddleware::verify();
    $controller = new ImportController($pdo);
    $controller->delete();
    exit;
}

// 404 fallback
http_response_code(404);
echo json_encode(['error' => 'Not Found']);
?>