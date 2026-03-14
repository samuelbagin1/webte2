<?php
// user profile management for logged-in users

require_once __DIR__ . '/../../vendor/autoload.php';
require_once __DIR__.'/../../../config.php';
require_once __DIR__.'/../models/User.php';
require_once __DIR__.'/../helper/Response.php';

use RobThree\Auth\Providers\Qr\BaconQrCodeProvider;
use RobThree\Auth\TwoFactorAuth;

class UserController {
    private PDO $pdo;
    private User $userModel;

    public function __construct()
    {
        global $hostname, $database, $username, $password;
        $pdo = connectDatabase($hostname, $database, $username, $password);
        $this->pdo = $pdo;
    }

    // return all users
    public function index() {

    }

    // return user by id
    public function show(int $id) {
        
    }

    // POST /api/users
    // {first_name, last_name, email, password, password_repeat} -> {message, tfa_secret, qr_code}
    public function create() {
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

    // update users profile
    public function update() {
        
    }

    // delete user
    public function delete() {
        
    }

    
    public function profile(): void {
        
    }

    // update user info
    public function updateProfile(): void {
        AuthMiddleware::verify();
        $input = json_decode(file_get_contents('php://input'), true);
        $firstName = Sanitizer::sanitizeString($input['first_name'] ?? '');
        $lastName = Sanitizer::sanitizeString($input['last_name'] ?? '');

        if (empty($firstName) || empty($lastName)) {
            Response::json(['error' => 'Meno a priezvisko sú povinné'], 400);
            return;
        }

        updateUserProfile($this->pdo, $_SESSION['user_id'], $firstName, $lastName);

        Response::json(['message' => 'Uspesne aktualizovane'], 200);
    }

    public function updatePassword(): void {
        AuthMiddleware::verify();
        $input = json_decode(file_get_contents('php://input'), true);
        $currentPassword = $input['current_password'];
        $newPassword = $input['new_password'];
        $newPasswordRepeat = $input['new_password_repeat'];

        if ($newPassword !== $newPasswordRepeat) {
            Response::json(['error' => 'Not matching passwords'], 401);
            return;
        }

        $user = findUserById($this->pdo, $_SESSION['user_id']);
        if (!password_verify($currentPassword, $user['password_hash'])) {
            Response::json(['error' => 'Nesprávne aktuálne heslo'], 401);
            return;
        }

        $passwordHash = hashPassword($newPassword);
        updateUserPassword($this->pdo, $_SESSION['user_id'], $passwordHash);
        Response::json(['message' => 'Uspesne aktualizovane'], 200);
    }

    // POST /api/user/2fa
    // {} -> {secret, qr_code}
    // generate 2fa secret and QR code
    public function setup2FA(): void {
        AuthMiddleware::verify();
        $tfa = new TwoFactorAuth(new BaconQrCodeProvider(4, '#ffffff', '#000000', 'svg'));
        $secret = $tfa->createSecret();
        $qrCode = $tfa->getQRCodeImageAsDataUri('Olympic Games APP', $secret);
        set2FASecretUser($this->pdo, $_SESSION['user_id'], $secret);

        Response::json(['secret' => $secret, 'qr_code' => $qrCode], 200);
    }

    // verify and enable 2fa
    public function verify2FA(): void {

    }

    public function loginHistory(): void {
        AuthMiddleware::verify();
        $data = getHistoryByUserId($this->pdo, $_SESSION['user_id']);
        Response::json($data, 200);
    }
}
?>