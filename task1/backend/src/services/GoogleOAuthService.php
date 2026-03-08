<?php 
// google oaut2 integration
// handles redirect url generation, token exchange, user info retrieval

require_once __DIR__ . '/../../vendor/autoload.php';

use Google\Client;
use Google\Service\Oauth2;

class GoogleOAuthService {
    private string $redirectUri;

    public function __construct()
    {
        $this->redirectUri = 'CALLBACK_URI';
    }

    public function getClient(): Client {
        $client = new Client();
        $client->setAuthConfig(__DIR__ . '/../../client_secret.json');
        $client->setRedirectUri($this->redirectUri);
        $client->addScope(['email', 'profile']);
        $client->setIncludeGrantedScopes(true);
        $client->setAccessType('offline');

        return $client;
    }

    public function getAuthUrl(string $state): string {
        $client = $this->getClient();
        $client->setState($state);

        return $client->createAuthUrl();
    }

    public function getUserFromCode(string $code): array {
        $client = $this->getClient();
        $token = $client->fetchAccessTokenWithAuthCode($code);
        $client->setAccessToken($token);

        $oauth = new Oauth2($client);
        $userInfo = $oauth->userinfo->get();

        return [
            'email' => $userInfo->email,
            'name' => $userInfo->name,
            'id' => $userInfo->id,
            'access_token' => $token,
            'refresh_token' => $client->getRefreshToken()
        ];
    }
}
?>