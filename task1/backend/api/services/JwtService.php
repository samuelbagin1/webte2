<?php 
class JwtService {
    private string $secretKey;  // from .env or config

    
    public function generateAccessToken(array $user): string {

    }


    public function generateRefreshToken(array $user): string {

    }


    public function decode(string $token): ?array {// returns claims or null

    }


    public function isExpired(string $token): bool {

    }
}
?>