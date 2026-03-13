<?php 
class AuthMiddleware {
    public static function verify(): void {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }

        if (!isset($_SESSION['loggedin']) || $_SESSION['loggedin'] !== true) {
            Response::json(['error' => 'Unauthorized'], 401);
            exit;
        }
    }

    public static function getUserId(): int {
        return $_SESSION['user_id'];
    }
}
?>