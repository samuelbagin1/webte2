<?php 


function recordLogin(PDO $pdo, int $userId, string $loginType): void {
    if ($loginType !== 'LOCAL' && $loginType !== 'OAUTH') {
        throw new Exception('loginType must be of LOCAL or OAUTH');
    }

    $stmt = $pdo->prepare("INSERT INTO login_history (user_id, login_type) VALUES (:uid, :login_type)");
    $stmt->execute([
        'uid' => $userId,
        'login_type' => $loginType
    ]);
}

function getHistoryByUserId(PDO $pdo, int $userId): array {
    $stmt = $pdo->prepare("SELECT id, login_type, created_at FROM login_history WHERE user_id = :uid ORDER BY created_at DESC");
    $stmt->execute(['uid' => $userId]);
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}
?>