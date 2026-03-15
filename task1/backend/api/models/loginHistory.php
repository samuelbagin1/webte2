<?php 

class LoginHistory {

    private PDO $pdo;
    public function __construct(PDO $pDO)
    {
        $this->pdo = $pDO;
    }


    public function record(int $userId, string $loginType): void {
        if ($loginType !== 'LOCAL' && $loginType !== 'OAUTH') {
            throw new Exception('loginType must be of LOCAL or OAUTH');
        }

        $stmt = $this->pdo->prepare("INSERT INTO login_history (user_id, method) VALUES (:uid, :method)");
        $stmt->execute([
            'uid' => $userId,
            'method' => $loginType
        ]);
    }


    public function getById(int $userId): array {
        $stmt = $this->pdo->prepare("SELECT id, method AS login_type, login_at AS created_at FROM login_history WHERE user_id = :uid ORDER BY login_at DESC");
        $stmt->execute(['uid' => $userId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}

?>