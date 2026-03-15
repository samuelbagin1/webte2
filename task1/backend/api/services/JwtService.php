<?php
require_once __DIR__ . '/../../vendor/autoload.php';

use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Firebase\JWT\ExpiredException;
use Firebase\JWT\SignatureInvalidException;

class JwtService {
    private string $secretKey;

    private const ACCESS_TOKEN_EXPIRY = 3600;       // 1 hour
    private const REFRESH_TOKEN_EXPIRY = 604800;    // 7 days

    public function __construct() {
        $env = parse_ini_file(__DIR__ . '/../../.env');
        $this->secretKey = $env['jwt_secret'] ?? '';
        if (empty($this->secretKey)) {
            throw new Exception('JWT secret key is not configured in .env');
        }
    }

    public function generateAccessToken(array $user): string {
        $now = time();
        $payload = [
            'sub'   => $user['id'],
            'email' => $user['email'],
            'iat'   => $now,
            'exp'   => $now + self::ACCESS_TOKEN_EXPIRY,
        ];
        return JWT::encode($payload, $this->secretKey, 'HS256');
    }

    public function generateRefreshToken(array $user): string {
        $now = time();
        $payload = [
            'sub'  => $user['id'],
            'type' => 'refresh',
            'iat'  => $now,
            'exp'  => $now + self::REFRESH_TOKEN_EXPIRY,
        ];
        return JWT::encode($payload, $this->secretKey, 'HS256');
    }

    public function decode(string $token): ?array {
        try {
            $decoded = JWT::decode($token, new Key($this->secretKey, 'HS256'));
            return (array) $decoded;
        } catch (Exception $e) {
            return null;
        }
    }

    public function isExpired(string $token): bool {
        try {
            JWT::decode($token, new Key($this->secretKey, 'HS256'));
            return false;
        } catch (ExpiredException $e) {
            return true;
        } catch (Exception $e) {
            return true;
        }
    }
}
