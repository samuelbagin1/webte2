<?php 
// handling user authentication: login, logout, registration

require_once __DIR__ . '/../../vendor/autoload.php';

use RobThree\Auth\Providers\Qr\BaconQrCodeProvider;
use RobThree\Auth\TwoFactorAuth;

class AuthController {
    private PDO $pdo;

    public function __construct(PDO $pdo)
    {
        $this->pdo = $pdo;
    }

    public function login(): void {
        $data = json_decode(file_get_contents('php://input'), true);
        $email = Sanitizer::sanitizeEmail($data['email'] ?? '');
        $password = $data['password'] ?? '';
        $totp = $data['totp'] ?? '';

        $authService = new AuthService($this->pdo);
        $result = $authService->authenticate($email, $password, $totp);

        // if successful, store user and start session, and record login
        if ($result['success']) {
            session_start();
            $_SESSION['loggedin'] = true;
            $_SESSION['user_id'] = $result['user']['id'];
            $_SESSION['full_name'] = $result['user']['first_name'] . ' ' . $result['user']['last_name'];

            $loginHistory = new LoginHistory($this->pdo);
            $loginHistory->record($result['user']['id'], 'LOCAL');

            Response::json(['message' => 'Login successful', 'user' => [
                'full_name' => $_SESSION['full_name'],
                'email' => $_SESSION['email']
            ]], 200);


        } else {
            Response::json(['error' => $result['message']], 401);
        }
    }
}
?>