<?php 

class User {
    private PDO $pdo;
    public function __construct(PDO $pdo)
    {
        $this->pdo = $pdo;
    }

    public function getOrCreate(string $firstName, string $lastName, string $email, ?string $passwordHash, ?string $totp_secret): int {
        $stmt = $this->pdo->prepare("SELECT id FROM users WHERE first_name = :first_name AND last_name = :last_name AND email = :email LIMIT 1");
        $stmt->execute([':first_name' => $firstName, ':last_name' => $lastName, ':email' => $email]);
        $id = $stmt->fetchColumn();

        if ($id) return (int) $id;

        $stmt = $this->pdo->prepare("INSERT INTO users (first_name, last_name, email, password_hash, totp_secret) VALUES (:first_name, :last_name, :email, :password_hash, :totp_secret)");
        $stmt->execute([
            ':first_name' => $firstName,
            ':last_name' => $lastName,
            ':email' => $email,
            ':password_hash' => $passwordHash,
            ':totp_secret' => $totp_secret
        ]);

        return (int) $this->pdo->lastInsertId();
    }

    public function getByEmail(string $email): ?array {
        $stmt = $this->pdo->prepare("SELECT * FROM users WHERE email = :email");
        $stmt->execute([':email' => $email]);

        return $stmt->fetch(PDO::FETCH_ASSOC) ?: null;
    }

    public function getById(int $id): ?array {
        $stmt = $this->pdo->prepare("SELECT * FROM users WHERE id = :id");
        $stmt->execute([':id' => $id]);
        return $stmt->fetch(PDO::FETCH_ASSOC) ?: null;
    }

    public function getAll(): array {
        $stmt = $this->pdo->prepare("SELECT * FROM users");
        $stmt->execute();

        return $stmt->fetch(PDO::FETCH_ASSOC) ?: null;
    }

    public function update(int $id, string $firstName, string $lastName): void {
        $stmt = $this->pdo->prepare("UPDATE users SET first_name = :first_name, last_name = :last_name WHERE id = :id");
        $stmt->execute([':first_name' => $firstName, ':last_name' => $lastName, ':id' => $id]);
    }

    public function updatePassword(int $id, string $passwordHash): void {
        $stmt = $this->pdo->prepare("UPDATE users SET password_hash = :password_hash WHERE id = :id");
        $stmt->execute([':password_hash' => $passwordHash, ':id' => $id]);
    }
        
    public function set2FASecret(int $userId, string $secret): void {
        $stmt = $this->pdo->prepare("UPDATE users SET totp_secret = :secret WHERE id = :id");
        $stmt->execute([':secret' => $secret, ':id' => $userId]);
    }

    public function delete(int $id): void {
        $stmt = $this->pdo->prepare("DELETE FROM users WHERE id = :id");
        $stmt->execute([':id' => $id]);
    }
}

?>