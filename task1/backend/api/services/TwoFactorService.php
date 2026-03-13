<?php 

// 2FA using totp

require_once __DIR__ . '/../../vendor/autoload.php';

use RobThree\Auth\Providers\Qr\BaconQrCodeProvider;
use RobThree\Auth\TwoFactorAuth;

class TwoFactorService {
    private TwoFactorAuth $tfa;

    public function __construct()
    {
        $this->tfa = new TwoFactorAuth(new BaconQrCodeProvider(4, '#ffffff', '#000000', 'svg'));
    }

    public function generateSecret(): string {
        return $this->tfa->createSecret();
    }

    public function getQRCodeDataUri(string $secret, string $label = 'Olympic Games APP'): string {
        return $this->tfa->getQRCodeImageAsDataUri($label, $secret);
    }

    public function verifyCode(string $secret, string $code, int $discrepancy = 2): bool {
        return $this->tfa->verifyCode($secret, $code, $discrepancy);
    }
}
?>