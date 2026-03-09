<?php 
// core authentication logic
// 1. find email
// 2. verify password
// 3. verify totp 2fa

require_once __DIR__ .  '/../../vendor/autoload.php';

use RobThree\Auth\Providers\Qr\BaconQrCodeProvider;
use Robthree\Auth\TwoFactorAuth;

function authenticate(PDO $pdo, string $email, string $password, string $totp = ''): array {
    $userData = findUserByEmail($pdo, $email);

    if (!$userData) {
        return ['success' => false, 'message' => 'invalid credentials'];
    }   

    if (!password_verify($password, $userData['password_hash'])) {
        return ['success' => false, 'message' => 'invalid credentials'];
    }

    if (!empty($userData['tfa_secret'])) {
        $tfa = new TwoFactorAuth(new BaconQrCodeProvider());

        if (!$tfa->verifyCode($userData['tfa_secret'], $totp, 2)) {
            return ['success' => false, 'message' => 'invalid credentials'];
        }
    }


    // all clear
    return ['success' => true, 'user' => $userData];
}

function hashPassword(string $password): string {
    return password_hash($password, PASSWORD_ARGON2ID);
}
?>