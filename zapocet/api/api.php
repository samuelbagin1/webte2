<?php
require_once __DIR__ . '/Router.php';
session_start();
CorsMiddleware::handle();

$router = new Router();


$router->get("/caves", [CavesController::class, "index"]);
$router->post("/caves", [CavesController::class, "create"]);

$router->get("/mushrooms/types", [MushroomsController::class, "getDistinctTypes"]);
$router->post("/mushrooms", [MushroomsController::class, "create"]);
$router->delete("/mushrooms/{id}", [MushroomsController::class, "delete"]);



$router->run();

?>