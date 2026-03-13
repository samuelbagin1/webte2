<?php 
function getOrCreateUser(PDO $pdo, string $firstName, string $lastName, string $email, ?string $passwordHash, ?string $totp_secret): int {
    $stmt = $pdo->prepare("SELECT id FROM users WHERE first_name = :first_name AND last_name = :last_name AND email = :email LIMIT 1");
    $stmt->execute([':first_name' => $firstName, ':last_name' => $lastName, ':email' => $email]);
    $id = $stmt->fetchColumn();

    if ($id) return (int) $id;

    $stmt = $pdo->prepare("INSERT INTO users (first_name, last_name, email, password_hash, totp_secret) VALUES (:first_name, :last_name, :email, :password_hash, :totp_secret)");
    $stmt->execute([
        ':first_name' => $firstName,
        ':last_name' => $lastName,
        ':email' => $email,
        ':password_hash' => $passwordHash,
        ':totp_secret' => $totp_secret
    ]);

    return (int) $pdo->lastInsertId();
}

function findUserByEmail(PDO $pdo, string $email): ?array {
    $stmt = $pdo->prepare("SELECT * FROM users WHERE email = :email");
    $stmt->execute([':email' => $email]);

    return $stmt->fetch(PDO::FETCH_ASSOC) ?: null;
}

function findUserById(PDO $pdo, int $id): ?array {
    $stmt = $pdo->prepare("SELECT * FROM users WHERE id = :id");
    $stmt->execute([':id' => $id]);
    return $stmt->fetch(PDO::FETCH_ASSOC) ?: null;
}
    
function set2FASecretUser(PDO $pdo, int $userId, string $secret): void {
    $stmt = $pdo->prepare("UPDATE users SET totp_secret = :secret WHERE id = :id");
    $stmt->execute([':secret' => $secret, ':id' => $userId]);
}

function updateUserProfile(PDO $pdo, int $id, string $firstName, string $lastName): void {
    $stmt = $pdo->prepare("UPDATE users SET first_name = :first_name, last_name = :last_name WHERE id = :id");
    $stmt->execute([':first_name' => $firstName, ':last_name' => $lastName, ':id' => $id]);
}

function updateUserPassword(PDO $pdo, int $id, string $passwordHash): void {
    $stmt = $pdo->prepare("UPDATE users SET password_hash = :password_hash WHERE id = :id");
    $stmt->execute([':password_hash' => $passwordHash, ':id' => $id]);
}
?>