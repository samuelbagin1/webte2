<?php
// user profile management for logged-in users

require_once __DIR__ . '/../../vendor/autoload.php';
require_once __DIR__.'/../../../config.php';
require_once __DIR__.'/../models/User.php';
require_once __DIR__.'/../helper/Response.php';

use RobThree\Auth\Providers\Qr\BaconQrCodeProvider;
use RobThree\Auth\TwoFactorAuth;

class UserController {
    private User $userModel;
    private LoginHistory $loginHistoryModel;

    public function __construct()
    {
        global $hostname, $database, $username, $password;
        $pdo = connectDatabase($hostname, $database, $username, $password);
        $this->userModel = new User($pdo);
        $this->loginHistoryModel = new LoginHistory($pdo);
    }


    // return all users
    // authenticate
    // GET /users
    // {} -> {[{id, first_name, last_name, email, password_hash, totp_secret}]}
    public function index() {
        $data = $this->userModel->getAll();
        if (!$data) Response::json(['error' => 'Error at the server'], 400);

        Response::json($data, 200);
    }


    // return user by id
    // authenticate
    // GET /users/{id}
    // {id} -> {id, first_name, last_name, email, password_hash, totp_secret}
    public function show(int $id) {
        $data = $this->userModel->getById($id);
        if (!$data) Response::json(['error' => 'Error at the server'], 400);

        Response::json($data, 200);
    }


    // register user
    // POST /users
    // {first_name, last_name, email, password, password_repeat} -> {message, id, tfa_secret, qr_code}
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
        if ($this->userModel->getByEmail($email) !== null) {
            Response::json(['error' => 'User with this email already exists.'], 409);
            return;
        }

        $auth = new Authentication();
        $passwordHash = $auth->hashPassword($password);
        $tfa = new TwoFactorAuth(new BaconQrCodeProvider(4, '#ffffff', '#000000', 'svg'));
        $tfaSecret = $tfa->createSecret();
        $qrCode = $tfa->getQRCodeImageAsDataUri('Olympic Games APP', $tfaSecret);

        $userId = $this->userModel->getOrCreate($firstName, $lastName, $email, $passwordHash, $tfaSecret);

        Response::json(['message' => 'User created.', 'id' => $userId,
            'tfa_secret' => $tfaSecret, 'qr_code' => $qrCode], 201);
    }


    // update name and surname
    // authenticate
    // PUT /users/{id}
    // {id, first_name, last_name} -> {message}
    public function update(int $id) {
        AuthMiddleware::verify();
        $input = json_decode(file_get_contents('php://input'), true);
        $firstName = Sanitizer::sanitizeString($input['first_name'] ?? '');
        $lastName = Sanitizer::sanitizeString($input['last_name'] ?? '');

        if (empty($firstName) || empty($lastName)) {
            Response::json(['error' => 'Meno a priezvisko sú povinné'], 400);
            return;
        }

        $this->userModel->update($id, $firstName, $lastName);

        Response::json(['message' => 'Uspesne aktualizovane'], 200);
    }


    // update users password
    // authenticate
    // PUT /users/{id}/password
    // {id, current_password, new_password, new_password_repeat} -> {message}
    public function updatePassword($id): void {
        AuthMiddleware::verify();
        $input = json_decode(file_get_contents('php://input'), true);
        $currentPassword = $input['current_password'];
        $newPassword = $input['new_password'];
        $newPasswordRepeat = $input['new_password_repeat'];

        if ($newPassword !== $newPasswordRepeat) {
            Response::json(['error' => 'Not matching passwords'], 401);
            return;
        }

        $user = $this->userModel->getById($id);
        if (!password_verify($currentPassword, $user['password_hash'])) {
            Response::json(['error' => 'Nesprávne aktuálne heslo'], 401);
            return;
        }

        $auth = new Authentication();
        $passwordHash = $auth->hashPassword($newPassword);
        $this->userModel->updatePassword($id, $passwordHash);
        Response::json(['message' => 'Uspesne aktualizovane'], 200);
    }


    // delete user
    // authenticate
    // DELETE /users/{id}
    // {id} -> {message}
    public function delete($id) {
        AuthMiddleware::verify();
        $this->userModel->delete($id);
        Response::json(['message' => 'Successfully deleted user!'], 200);
    }

    
    // generate 2fa secret and QR code
    // authenticate
    // POST /users/{id}/2fa
    // {} -> {secret, qr_code}
    public function setup2FA(): void {
        AuthMiddleware::verify();
        $tfa = new TwoFactorAuth(new BaconQrCodeProvider(4, '#ffffff', '#000000', 'svg'));
        $secret = $tfa->createSecret();
        $qrCode = $tfa->getQRCodeImageAsDataUri('Olympic Games APP', $secret);
        $this->userModel->set2FASecret($_SESSION['user_id'], $secret);

        Response::json(['secret' => $secret, 'qr_code' => $qrCode], 200);
    }


    // get users login history
    // authenticate
    // GET /users/{id}/login-history
    // {id} -> {[{id, login_type, created_at}]}
    public function loginHistory(): void {
        AuthMiddleware::verify();
        $data = $this->loginHistoryModel->getById($_SESSION['user_id']);
        Response::json($data, 200);
    }
}
?>