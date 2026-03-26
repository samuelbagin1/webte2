<?php 
function validateRegistration(string $email, string $password, string $passwordRepeat,
        string $firstName, string $lastName): array {

        if (empty($firstName)) {
            return ['valid' => false, 'message' => 'First name is required'];
        }

        if (empty($lastName)) {
            return ['valid' => false, 'message' => 'Last name is required'];
        }

        if (strlen($firstName) > 100 || strlen($lastName) > 100) {
            return ['valid' => false, 'message' => 'Name must not exceed 100 characters'];
        }

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            return ['valid' => false, 'message' => 'Invalid email format'];
        }

        if (strlen($password) < 8) {
            return ['valid' => false, 'message' => 'Password must be at least 8 characters'];
        }

        if (!preg_match('/[A-Z]/', $password) || !preg_match('/[0-9]/', $password)) {
            return ['valid' => false, 'message' => 'Password must contain uppercase letter and number'];
        }

        if ($password !== $passwordRepeat) {
            return ['valid' => false, 'message' => 'Passwords do not match'];
        }
        
        return ['valid' => true];
    }
?>