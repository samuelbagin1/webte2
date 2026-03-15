<?php 
// handling user authentication: login, logout, registration

require_once __DIR__ . '/../../vendor/autoload.php';

use RobThree\Auth\Providers\Qr\BaconQrCodeProvider;
use RobThree\Auth\TwoFactorAuth;

class AuthController {
    private User $userModel;
    private LoginHistory $loginHistoryModel;

    public function __construct()
    {
        global $hostname, $database, $username, $password;
        $pdo = connectDatabase($hostname, $database, $username, $password);
        $this->userModel = new User($pdo);
        $this->loginHistoryModel = new LoginHistory($pdo);
    }


    // get current user profile
    // authenticate
    // GET /auth/profile
    // {} -> {full_name. login_tupe. google_id}
    public function profile() {
        AuthMiddleware::verify();
        $data = $this->userModel->getById($_SESSION['user_id']);
        unset($data['password_hash']); // do not return password hash
        unset($data['tfa_secret']); // do not return 2fa secret

        $data['full_name'] = $data['first_name'] . ' ' . $data['last_name'];
        $data['login_type'] = isset($_SESSION['gid']) ? 'OAUTH' : 'LOCAL';
        $data['google_id'] = $_SESSION['gid'] ?? null;

        Response::json($data, 200);
    }

    // POST /auth/login
    // {email, password, totp} -> {message, user}
    public function login(): void {
        $data = json_decode(file_get_contents('php://input'), true);
        $email = Sanitizer::sanitizeEmail($data['email'] ?? '');
        $password = $data['password'] ?? '';
        $totp = $data['totp'] ?? '';

        $auth = new Authentication();
        $result = $auth->authenticate($this->userModel, $email, $password, $totp);

        // if successful, store user and start session, and record login
        if ($result['success']) {
            if (session_status() === PHP_SESSION_NONE) { session_start(); }
            $_SESSION['loggedin'] = true;
            $_SESSION['user_id'] = $result['user']['id'];
            $_SESSION['full_name'] = $result['user']['first_name'] . ' ' . $result['user']['last_name'];
            $_SESSION['email'] = $result['user']['email'];

            $this->loginHistoryModel->record($result['user']['id'], 'LOCAL');

            Response::json(['message' => 'Login successful', 'user' => [
                'full_name' => $_SESSION['full_name'],
                'email' => $_SESSION['email']
            ]], 200);


        } else {
            Response::json(['error' => $result['message']], 401);
        }
    }


    // authenticate
    // POST /auth/logout
    // {} -> {message}
    function logout(): void {
        AuthMiddleware::verify();
        session_start();
        $_SESSION = array();
        session_destroy();
        Response::json(['message' => 'Logged out.'], 200);
    }
}
?>