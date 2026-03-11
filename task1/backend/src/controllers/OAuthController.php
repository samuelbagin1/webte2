<?php 
// handles google oauth2 login flow
require_once __DIR__ . '/../../vendor/autoload.php';

use Google\Client;
use Google\Service\Oauth2;

class OAuthController {
    private PDO $pdo;

    public function __construct(PDO $pdo)
    {
        $this->pdo = $pdo;
    }

    // generate Google OAuth consent URL with CSRF state, return URL as JSON for React to redirect
    // GET /api/auth/google
    // -> {url}
    // in frontend: window.location.href = url
    public function redirectToGoogle(): void {
        $client = new Client();
        $client->setAuthConfig(__DIR__ . '/../../client_secret.json');
        $client->setRedirectUri('http://localhost:8080/api/auth/google/callback');
        $client->addScope(['email', 'profile']);
        $client->setIncludeGrantedScopes(true);
        $client->setAccessType('offline');

        // CSRF (Cross-Site Request Forgery) protection via state
        $state = bin2hex(random_bytes(16));
        $client->setState($state);
        $_SESSION['oauth_state'] = $state;

        $authUrl = $client->createAuthUrl();
        Response::json(['url' => $authUrl], 200);
    }

    // process Google's callback (code + state), exchange for tokens, create/find user, start session, redirect to React app
    // Google redirects to /api/auth/google/callback?code=...&state=... → backend processes, starts session, redirects to React app (e.g., /dashboard)
    public function handleCallback(): void {
        // verify state
        if (!isset($_GET['state']) || $_GET['state'] !== ($_SESSION['oauth_state'] ?? '')) {
            Response::json(['error' => 'State mismatch.'], 400);
            return;
        }

        if (isset($_GET['error'])) {
            Response::json(['error' => $_GET['error']], 400);
            return;
        }

        $code = $_GET['code'] ?? '';

        $client = new Client();
        $client->setAuthConfig(__DIR__ . '/../../client_secret.json');
        $client->setRedirectUri('http://localhost:8080/api/auth/google/callback');

        // exchange auth code for access
        $token = $client->fetchAccessTokenWithAuthCode($code);
        $client->setAccessToken($token);

        // fetch user info from google
        $oauth = new OAuth2($client);
        $accountInfo = $oauth->userinfo->get();

        // find or create user in database
        $existingUser = findUserByEmail($this->pdo, $accountInfo->email);
        if (!$existingUser) {
            $names = explode(' ', $accountInfo->name, 2);
            getOrCreateUser($this->pdo, $names[0] ?? '', $names[1] ?? '', $accountInfo->email, null, null);
            $existingUser = findUserByEmail($this->pdo, $accountInfo->email);
        }

        // start session
        $_SESSION['loggedin'] = true;
        $_SESSION['user_id'] = $existingUser['id'];
        $_SESSION['full_name'] = $existingUser['first_name'] . ' ' . $existingUser['last_name'];
        $_SESSION['email'] = $existingUser['email'];
        $_SESSION['access_token'] = $token;
        $_SESSION['gid'] = $accountInfo->id;

        // record login
        recordLogin($this->pdo, $existingUser['id'], 'OAUTH');

        // readirect
        header('Location: ' . filter_var('http://localhost:5173/dashboard', FILTER_SANITIZE_URL));
        exit;
    }
}
?>