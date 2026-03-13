<?php 
// input sanitization to prevent XSS (Cross-Site Scripting) and injection attacks

class Sanitizer {
    public static function sanitizeString(string $input): string {
        return htmlspecialchars(strip_tags(trim($input)), ENT_QUOTES, 'UTF-8');
    }

    public static function sanitizeEmail(string $input): string {
        $email = filter_var(trim($input), FILTER_SANITIZE_EMAIL);
        return filter_var($email, FILTER_VALIDATE_EMAIL) ? $email :  '';
    }

    public static function sanitizeInt($input): int {
        return (int) filter_var($input, FILTER_SANITIZE_NUMBER_INT);
    }
}
?>