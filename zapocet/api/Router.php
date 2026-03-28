<?php

require_once __DIR__ . '/../config.php';

// Middleware
require_once __DIR__ . '/middleware/CorsMiddleware.php';

// Helpers
require_once __DIR__ . '/helpers/Response.php';

// Models
require_once __DIR__ . '/models/Mushroom.php';
require_once __DIR__ . '/models/Cave.php';


// Controllers
require_once __DIR__ . '/controllers/MushroomsController.php';
require_once __DIR__ . '/controllers/CavesController.php';





class Router {
    private $routes = [];

    public function add($method, $route, $handler) {
        $this->routes[] = [
            "method" => $method,
            "route" => $route,
            "handler" => $handler
        ];
    }


    public function get($route,$handler){ $this->add("GET",$route,$handler); }
    public function post($route,$handler){ $this->add("POST",$route,$handler); }
    public function put($route,$handler){ $this->add("PUT",$route,$handler); }
    public function delete($route,$handler){ $this->add("DELETE",$route,$handler); }



    public function run() {
        $method = $_SERVER["REQUEST_METHOD"];
        $uri = parse_url($_SERVER["REQUEST_URI"], PHP_URL_PATH);
        $uri = preg_replace("#^/api#", "", $uri);

        foreach($this->routes as $route) {
            if ($route['method'] !== $method) {
                continue;
            }

            $pattern = preg_replace("#\{[a-zA-Z]+\}#", "([^/]+)", $route['route']);
            $pattern = "#^".$pattern."$#";

            if (preg_match($pattern, $uri, $matches)) {
                array_shift($matches);
                $handler = $route["handler"];

                if (is_callable($handler) && !is_array($handler)) {
                    return call_user_func_array($handler, $matches);
                }

                [$class, $function] = $handler;
                $controller = new $class;
                return call_user_func_array([$controller, $function], $matches);
            }
        }


        Response::json(["error" => "Not Found"], 404);
    }
}
?>