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

    // POST /api/auth/login
    // {email, password, totp} -> {message, user}
    public function login(): void {
        $data = json_decode(file_get_contents('php://input'), true);
        $email = Sanitizer::sanitizeEmail($data['email'] ?? '');
        $password = $data['password'] ?? '';
        $totp = $data['totp'] ?? '';

        $result = authenticate($this->pdo, $email, $password, $totp);

        // if successful, store user and start session, and record login
        if ($result['success']) {
            if (session_status() === PHP_SESSION_NONE) { session_start(); }
            $_SESSION['loggedin'] = true;
            $_SESSION['user_id'] = $result['user']['id'];
            $_SESSION['full_name'] = $result['user']['first_name'] . ' ' . $result['user']['last_name'];
            $_SESSION['email'] = $result['user']['email'];

            recordLogin($this->pdo, $result['user']['id'], 'LOCAL');

            Response::json(['message' => 'Login successful', 'user' => [
                'full_name' => $_SESSION['full_name'],
                'email' => $_SESSION['email']
            ]], 200);


        } else {
            Response::json(['error' => $result['message']], 401);
        }
    }


    // POST /api/auth/register
    // {first_name, last_name, email, password, password_repeat} -> {message, tfa_secret, qr_code}
    public function register(): void {
        $data = json_decode(file_get_contents('php://input'), true);
        $firstName = Sanitizer::sanitizeString($data['first_name'] ?? '');
        $lastName = Sanitizer::sanitizeString($data['last_name'] ?? '');
        $email = Sanitizer::sanitizeEmail($data['email'] ?? '');
        $password = $data['password'] ?? '';
        $passwordRepeat = $data['password_repeat'] ?? '';

        // validation of inputs
        $validation = validateRegistration($email, $password, $passwordRepeat, $firstName, $lastName);
        if (!$validation['valid']) {
            Response::json(['error' => $validation['message']], 400);
            return;
        }

        // check if user already exists
        if (findUserByEmail($this->pdo, $email) !== null) {
            Response::json(['error' => 'User with this email already exists.'], 409);
            return;
        }

        $passwordHash = hashPassword($password);
        $tfa = new TwoFactorAuth(new BaconQrCodeProvider(4, '#ffffff', '#000000', 'svg'));
        $tfaSecret = $tfa->createSecret();
        $qrCode = $tfa->getQRCodeImageAsDataUri('Olympic Games APP', $tfaSecret);

        $userId = getOrCreateUser($this->pdo, $firstName, $lastName, $email, $passwordHash, $tfaSecret);

        Response::json(['message' => 'User created.', 'id' => $userId,
            'tfa_secret' => $tfaSecret, 'qr_code' => $qrCode], 201);
    }


    // POST /api/auth/logout
    // {} -> {message}
    function logout(): void {
        session_start();
        $_SESSION = array();
        session_destroy();
        Response::json(['message' => 'Logged out.'], 200);
    }
}
?>