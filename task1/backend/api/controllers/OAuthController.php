<?php 
// handles google oauth2 login flow
require_once __DIR__ . '/../../vendor/autoload.php';

use Google\Client;
use Google\Service\Oauth2;

class OAuthController {
    private User $userModel;
    private LoginHistory $loginHistoryModel;

    public function __construct()
    {
        global $hostname, $database, $username, $password;
        $pdo = connectDatabase($hostname, $database, $username, $password);
        $this->userModel = new User($pdo);
        $this->loginHistoryModel = new LoginHistory($pdo);
    }


    // generate Google OAuth consent URL with CSRF state, return URL as JSON for React to redirect
    // GET /auth/google
    // {} -> {url}
    // in frontend: window.location.href = url
    public function redirectToGoogle(): void {
        $client = new Client();
        $client->setAuthConfig(__DIR__ . '/../../client_secret.json');
        global $callbackRedirectUri;
        $client->setRedirectUri($callbackRedirectUri);
        $client->addScope(['email', 'profile']);
        $client->setIncludeGrantedScopes(true);
        $client->setAccessType('offline');

        // CSRF protection via HMAC-signed state (stateless — no session needed)
        $jwt = new JwtService();
        $nonce = bin2hex(random_bytes(16));
        $state = $nonce . '.' . hash_hmac('sha256', $nonce, $jwt->getSecretKey());
        $client->setState($state);

        $authUrl = $client->createAuthUrl();
        Response::json(['url' => $authUrl], 200);
    }


    // process Google's callback (code + state), exchange for tokens, create/find user, start session, redirect to React app
    // Google redirects to /api/auth/google/callback?code=...&state=... → backend processes, starts session, redirects to React app (e.g., /dashboard)
    // GET /auth/google/callback
    // {code, state} -> redirect to /dashboard
    public function handleCallback(): void {
        // verify HMAC-signed state
        $state = $_GET['state'] ?? '';
        $parts = explode('.', $state, 2);
        if (count($parts) !== 2) {
            Response::json(['error' => 'State mismatch.'], 400);
            return;
        }
        $jwt = new JwtService();
        $expectedSig = hash_hmac('sha256', $parts[0], $jwt->getSecretKey());
        if (!hash_equals($expectedSig, $parts[1])) {
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
        global $callbackRedirectUri;
        $client->setRedirectUri($callbackRedirectUri);

        // exchange auth code for access
        $token = $client->fetchAccessTokenWithAuthCode($code);
        $client->setAccessToken($token);

        // fetch user info from google
        $oauth = new OAuth2($client);
        $accountInfo = $oauth->userinfo->get();

        // find or create user in database
        $existingUser = $this->userModel->getByEmail($accountInfo->email);
        if (!$existingUser) {
            $names = explode(' ', $accountInfo->name, 2);
            $this->userModel->getOrCreate($names[0] ?? '', $names[1] ?? '', $accountInfo->email, null, null);
            $existingUser = $this->userModel->getByEmail($accountInfo->email);
        }

        // ensure google_id is set
        if (empty($existingUser['google_id'])) {
            $this->userModel->setGoogleId($existingUser['id'], $accountInfo->id);
        }

        // start session
        $_SESSION['loggedin'] = true;
        $_SESSION['user_id'] = $existingUser['id'];
        $_SESSION['full_name'] = $existingUser['first_name'] . ' ' . $existingUser['last_name'];
        $_SESSION['email'] = $existingUser['email'];
        $_SESSION['access_token'] = $token;
        $_SESSION['gid'] = $accountInfo->id;

        // record login
        $this->loginHistoryModel->record($existingUser['id'], 'OAUTH');

        // generate JWT tokens
        $jwt = new JwtService();
        $accessToken = $jwt->generateAccessToken($existingUser);

        // redirect with token
        global $redirectToDashboard;
        $redirectUrl = $redirectToDashboard . '?token=' . urlencode($accessToken);
        header('Location: ' . filter_var($redirectUrl, FILTER_SANITIZE_URL));
        exit;
    }
}
?>