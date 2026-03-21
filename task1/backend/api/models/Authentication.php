<?php 
// core authentication logic
// 1. find email
// 2. verify password
// 3. verify totp 2fa

require_once __DIR__ .  '/../../vendor/autoload.php';

use RobThree\Auth\Providers\Qr\BaconQrCodeProvider;
use RobThree\Auth\TwoFactorAuth;

class Authentication {
    public function authenticate(User $user, string $email, string $password, string $totp = ''): array {
        $userData = $user->getByEmail($email);

        if (!$userData) {
            return ['success' => false, 'message' => 'invalid credentials'];
        }   

        if (empty($userData['password_hash']) || !password_verify($password, $userData['password_hash'])) {
            return ['success' => false, 'message' => 'invalid credentials'];
        }

        if (!empty($userData['totp_secret'])) {
            $tfa = new TwoFactorAuth(new BaconQrCodeProvider());

            if (!$tfa->verifyCode($userData['totp_secret'], $totp, 2)) {
                return ['success' => false, 'message' => 'invalid credentials'];
            }
        }


        // all clear
        return ['success' => true, 'user' => $userData];
    }

    public function hashPassword(string $password): string {
        return password_hash($password, PASSWORD_ARGON2ID);
    }
}
?>