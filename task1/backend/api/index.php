<?php
require_once __DIR__ . '/Router.php';
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
$router->get("/athletes/records", [AthleteController::class, "indexRecord"]);
$router->get("/athletes/records/{id}", [AthleteController::class, "showRecord"]);
$router->delete("/athletes/records/{id}", [AthleteController::class, "deleteRecord"]);
$router->put("/athletes/records/{id}", [AthleteController::class, "updateRecord"]);  
$router->get("/athletes", [AthleteController::class, "index"]);
$router->get("/athletes/{id}", [AthleteController::class, "show"]);
$router->post("/athletes", [AthleteController::class, "create"]);
$router->post("/athletes/batch", [AthleteController::class, "createBatch"]);
$router->post("/athletes/{id}/records", [AthleteController::class, "createRecord"]);
$router->post("/athletes/batch/records", [AthleteController::class, "createBatchRecord"]);
$router->post("/athletes/import", [AthleteController::class, "import"]); 
$router->put("/athletes/{id}", [AthleteController::class, "update"]);  
$router->delete("/athletes/{id}", [AthleteController::class, "delete"]);
$router->delete("/athletes", [AthleteController::class, "deleteAll"]);


// OLYMPICS routes
$router->get("/olympics", [OlympicsController::class, "index"]);
$router->get("/olympics/{id}", [OlympicsController::class, "show"]);
$router->post("/olympics", [OlympicsController::class, "create"]);
$router->post("/olympics/import", [OlympicsController::class, "import"]);
$router->delete("/olympics/{id}", [OlympicsController::class, "delete"]);


// USER routes
$router->post("/users", [UserController::class, "create"]);
$router->get("/users", [UserController::class, "index"]);
$router->get("/users/{id}", [UserController::class, "show"]);
$router->put("/users/{id}", [UserController::class, "update"]);  // old: /api/user/profile
$router->put("/users/{id}/password", [UserController::class, "updatePassword"]); 
$router->delete("/users/{id}", [UserController::class, "delete"]); 
$router->get("/users/{id}/login-history", [UserController::class, "loginHistory"]); 
$router->post("/users/{id}/2fa", [UserController::class, "setup2FA"]); 



// FILTER routes
$router->get("/filters/years", [FilterController::class, "years"]); // getYearsOfOlympics($pdo)
$router->get("/filters/disciplines", [FilterController::class, "disciplines"]);   // getDisciplines($pdo)


// API docs
$router->get("/docs", function () {
    header('Content-Type: text/html');
    readfile(__DIR__ . '/docs.html');
    exit;
});

$router->run();

?>