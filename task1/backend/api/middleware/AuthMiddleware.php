<?php 
class AuthMiddleware {
    public static function verify(): int {
        $header = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
        if (!preg_match('/Bearer\s+(.+)/', $header, $matches)) {
            Response::json(["error" => "No token provided"], 401);
            exit;
        }
        $jwt = new JwtService();
        $claims = $jwt->decode($matches[1]);
        if (!$claims) {
            Response::json(["error" => "Invalid or expired token"], 401);
            exit;
        }
        return $claims['sub']; // returns user_id
    }

    public static function getUserId(): int {
        return $_SESSION['user_id'];
    }
}
?>