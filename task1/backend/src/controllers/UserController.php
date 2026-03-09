<?php 
// user profile management for logged-in users

require_once __DIR__ . '/../../vendor/autoload.php';

use RobThree\Auth\Providers\Qr\BaconQrCodeProvider;
use RobThree\Auth\TwoFactorAuth;

class UserController {
    private PDO $pdo;

    public function __construct(PDO $pdo)
    {
        $this->pdo = $pdo;
    }

    // GET /api/user/profile
    // {} -> {full_name, email, created_at, login_type}
    // get current user profile from session
    public function profile(): void {
        session_start();
        if (!isset($_SESSION['loggedin']) || $_SESSION['loggedin'] !== true) {
            Response::json(['error' => 'Unauthorized'], 401);
            return;
        }

        $data = findUserById($this->pdo, $_SESSION['user_id']);
        unset($data['password_hash']); // do not return password hash
        unset($data['tfa_secret']); // do not return 2fa secret

        $data['login_type'] = isset($_SESSION['gid']) ? 'OAUTH' : 'LOCAL';
        $data['google_id'] = $_SESSION['gid'] ?? null;

        Response::json($data, 200);
    }

    // update user info
    public function updateProfile(): void {

    }

    // POST /api/user/profile
    // {} -> {secret, qr_code}
    // generate 2fa secrete and QR code
    public function setup2FA(): void {
        session_start();
        if (!isset($_SESSION['loggedin']) || $_SESSION['loggedin'] !== true) {
            Response::json(['error' => 'Unauthorized'], 401);
            return;
        }

        $tfa = new TwoFactorAuth(new BaconQrCodeProvider(4, '#ffffff', '#000000', 'svg'));
        $secret = $tfa->createSecret();
        $qrCode = $tfa->getQRCodeImageAsDataUri('Olympic Games APP', $secret);
        set2FASecretUser($this->pdo, $_SESSION['user_id'], $secret);

        Response::json(['secret' => $secret, 'qr_code' => $qrCode], 200);
    }

    // verify and enable 2fa
    public function verify2FA(): void {

    }
}
?>