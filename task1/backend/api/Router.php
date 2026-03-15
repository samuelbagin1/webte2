<?php

require_once __DIR__ . '/../config.php';

// Middleware
require_once __DIR__ . '/middleware/CorsMiddleware.php';
require_once __DIR__ . '/middleware/AuthMiddleware.php';

// Helpers
require_once __DIR__ . '/helpers/Response.php';
require_once __DIR__ . '/helpers/Sanitizer.php';

// Models
require_once __DIR__ . '/models/user.php';
require_once __DIR__ . '/models/athlete.php';
require_once __DIR__ . '/models/insert.php';
require_once __DIR__ . '/models/loginHistory.php';

// Services
require_once __DIR__ . '/services/authenticate.php';
require_once __DIR__ . '/services/validate.php';
require_once __DIR__ . '/services/importService.php';
require_once __DIR__ . '/services/TwoFactorService.php';

// Controllers
require_once __DIR__ . '/controllers/AuthController.php';
require_once __DIR__ . '/controllers/AthleteController.php';
require_once __DIR__ . '/controllers/UserController.php';
require_once __DIR__ . '/controllers/OAuthController.php';





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


        Response::json(["error" => "Not Found"], 401);
    }
}
?>