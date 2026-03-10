<?php 


function recordLogin(PDO $pdo, int $userId, string $loginType): void {
    if ($loginType !== 'LOCAL' && $loginType !== 'OAUTH') {
        throw new Exception('loginType must be of LOCAL or OAUTH');
    }

    $stmt = $pdo->prepare("INSERT INTO login_history (user_id, method) VALUES (:uid, :method)");
    $stmt->execute([
        'uid' => $userId,
        'method' => $loginType
    ]);
}

function getHistoryByUserId(PDO $pdo, int $userId): array {
    $stmt = $pdo->prepare("SELECT id, method AS login_type, login_at AS created_at FROM login_history WHERE user_id = :uid ORDER BY login_at DESC");
    $stmt->execute(['uid' => $userId]);
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}
?>