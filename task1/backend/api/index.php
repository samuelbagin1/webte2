<?php
session_start();
CorsMiddleware::handle();

$router = new Router();



// AUH routes
$router->post("/auth/login", [AuthController::class, "login"]);
$router->post("/auth/logout", [AuthController::class, "logout"]);
$router->get("/auth/profile", [AuthController::class, "profile"]);


// OAUTH routes
$router->get("/auth/google", [OAuthController::class, "redirectToGoogle"]);
$router->get("/auth/google/callback", [OAuthController::class, "handleCallback"]);



// ATHLETE routes
$router->get("/athletes", [AthleteController::class, "index"]);
$router->get("/athletes/{id}", [AthleteController::class, "show"]);
$router->delete("/athletes/{id}", [AthleteController::class, "delete"]);
$router->delete("/athletes", [AthleteController::class, "delete"]);
$router->post("/athletes", [AthleteController::class, "importFile"]);
$router->post("/athletes/{id}", [AthleteController::class, "importFile"]);   // TODO
$router->post("/olympics", [AthleteController::class, "importOlympicsFile"]); 
$router->post("/olympics/{id}", [AthleteController::class, "importOlympicsFile"]);   // TODO


// USER routes
$router->post("/users", [UserController::class, "create"]);
$router->get("/users", [UserController::class, "index"]);
$router->put("/users/{id}/profile", [UserController::class, "updateProfile"]);  // old: /api/user/profile
$router->put("/users/{id}/password", [UserController::class, "updatePassword"]); 
$router->get("/users/{id}/login-history", [UserController::class, "loginHistory"]); 
$router->post("/users/{id}/2fa", [UserController::class, "setup2FA"]); 



// FILTER routes
if ($uri === '/api/filters/years' && $method === 'GET') {
    $data = getYearsOfOlympics($pdo);
    Response::json($data, 200);
    exit;
}

if ($uri === '/api/filters/disciplines' && $method === 'GET') {
    $data = getDisciplines($pdo);
    Response::json($data, 200);
    exit;
}

$router->run();

?>