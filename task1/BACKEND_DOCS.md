# Backend File Documentation

## Project Structure Overview

This backend is a PHP REST API for an Olympics athletes database with authentication, CSV/Excel import, and Google OAuth.

---

## `config.php`

**Purpose:** Database configuration and PDO connection factory.

**What it does:**
- Stores DB credentials (host, database, username, password)
- Provides `connectDatabase()` function that returns a PDO instance

**Example:**
```php
// config.php
$hostname = "db";
$database = "app_db";
$username = "app_user";
$password = "app_pass";

function connectDatabase($hostname, $database, $username, $password): ?PDO {
    try {
        $pdo = new PDO("mysql:host=$hostname;dbname=$database", $username, $password);
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        return $pdo;
    } catch (PDOException $e) {
        echo "Connection failed: " . $e->getMessage();
        return null;
    }
}
```

---

## `composer.json`

**Purpose:** PHP dependency management.

**Dependencies:**
- `phpoffice/phpspreadsheet` — read/write Excel files
- `robthree/twofactorauth` — TOTP two-factor authentication (uses BaconQrCode internally for QR generation)
- `bacon/bacon-qr-code` ^2 — QR code generation for 2FA setup
- `google/apiclient` — Google API client library for OAuth2 login

**Optimized `composer.json` example** (limits Google API packages to only OAuth2):
```json
{
    "require": {
        "phpoffice/phpspreadsheet": "^1.29",
        "robthree/twofactorauth": "^3.0",
        "bacon/bacon-qr-code": "^2.0",
        "google/apiclient": "^2.19"
    },
    "scripts": {
        "pre-autoload-dump": "Google\\Task\\Composer::cleanup"
    },
    "extra": {
        "google/apiclient-services": [
            "Oauth2"
        ]
    }
}
```

> Run `composer update` after modifying `composer.json` to clean up unused Google API packages.
> The `vendor/` directory must NOT be committed or included in ZIP submissions. Only `composer.json` must be included.

---

## `public/index.php`

**Purpose:** API entry point and router. All HTTP requests go through this file (via nginx rewrite).

**What it should do:**
- Set JSON content-type and CORS headers
- Parse the request URI and HTTP method
- Route requests to the appropriate controller
- Handle OPTIONS preflight requests

**Example:**
```php
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../src/middleware/CorsMiddleware.php';
require_once __DIR__ . '/../src/middleware/AuthMiddleware.php';

CorsMiddleware::handle();

$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$method = $_SERVER['REQUEST_METHOD'];

// Public routes
if ($uri === '/api/auth/login' && $method === 'POST') {
    $controller = new AuthController($pdo);
    $controller->login();
}

// Protected routes
if ($uri === '/api/athletes' && $method === 'GET') {
    AuthMiddleware::verify();
    $controller = new AthleteController($pdo);
    $controller->index();
}
```

---

## Controllers

### `src/controllers/AuthController.php`

**Purpose:** Handles user authentication — login, logout, registration.

**Methods:**
- `login()` — validate credentials (email + password + TOTP code), start session, return user data as JSON
- `register()` — create new user account with 2FA secret, return QR code data URI for authenticator app setup
- `logout()` — destroy session, return JSON confirmation

**Frontend (React) usage:**
- **Register:** `POST /api/auth/register` with JSON `{ first_name, last_name, email, password, password_repeat }` → returns `{ message, tfa_secret, qr_code }` (display QR code as `<img src={qr_code} />`)
- **Login:** `POST /api/auth/login` with JSON `{ email, password, totp }` → returns `{ message, user }` on success
- **Logout:** `POST /api/auth/logout` → returns `{ message }`, clears session

**Example:**
```php
require_once __DIR__ . '/../../vendor/autoload.php';

use RobThree\Auth\Providers\Qr\BaconQrCodeProvider;
use RobThree\Auth\TwoFactorAuth;

class AuthController {
    private PDO $pdo;

    public function __construct(PDO $pdo) {
        $this->pdo = $pdo;
    }

    public function login(): void {
        $data = json_decode(file_get_contents('php://input'), true);
        $email = Sanitizer::sanitizeEmail($data['email'] ?? '');
        $password = $data['password'] ?? '';
        $totp = $data['totp'] ?? '';

        $authService = new AuthService($this->pdo);
        $result = $authService->authenticate($email, $password, $totp);

        if ($result['success']) {
            // Start session and store user info
            session_start();
            $_SESSION['loggedin'] = true;
            $_SESSION['user_id'] = $result['user']['id'];
            $_SESSION['full_name'] = $result['user']['first_name'] . ' ' . $result['user']['last_name'];
            $_SESSION['email'] = $result['user']['email'];

            // Record login history (type: LOCAL)
            $loginHistory = new LoginHistory($this->pdo);
            $loginHistory->record($result['user']['id'], 'LOCAL');

            Response::json(['message' => 'Login successful', 'user' => [
                'full_name' => $_SESSION['full_name'],
                'email' => $_SESSION['email']
            ]], 200);
        } else {
            Response::json(['error' => $result['message']], 401);
        }
    }

    public function register(): void {
        $data = json_decode(file_get_contents('php://input'), true);
        $firstName = Sanitizer::sanitizeString($data['first_name'] ?? '');
        $lastName = Sanitizer::sanitizeString($data['last_name'] ?? '');
        $email = Sanitizer::sanitizeEmail($data['email'] ?? '');
        $password = $data['password'] ?? '';
        $passwordRepeat = $data['password_repeat'] ?? '';

        // Validate inputs
        $validation = ValidationService::validateRegistration($email, $password, $passwordRepeat, $firstName, $lastName);
        if (!$validation['valid']) {
            Response::json(['error' => $validation['message']], 400);
            return;
        }

        // Check if user already exists
        $user = new User($this->pdo);
        if ($user->findByEmail($email)) {
            Response::json(['error' => 'User with this email already exists'], 409);
            return;
        }

        // Hash password with Argon2ID
        $pwHash = password_hash($password, PASSWORD_ARGON2ID);

        // Generate 2FA secret and QR code
        $tfa = new TwoFactorAuth(new BaconQrCodeProvider(4, '#ffffff', '#000000', 'svg'));
        $tfaSecret = $tfa->createSecret();
        $qrCode = $tfa->getQRCodeImageAsDataUri('Olympic Games APP', $tfaSecret);

        $userId = $user->create($firstName, $lastName, $email, $pwHash, $tfaSecret);

        Response::json([
            'message' => 'User created',
            'id' => $userId,
            'tfa_secret' => $tfaSecret,
            'qr_code' => $qrCode  // data URI — display as <img src={qr_code} /> in React
        ], 201);
    }

    public function logout(): void {
        session_start();
        $_SESSION = array();
        session_destroy();
        Response::json(['message' => 'Logged out'], 200);
    }
}
```

---

### `src/controllers/OAuthController.php`

**Purpose:** Handles Google OAuth2 login flow using `google/apiclient` library.

**Methods:**
- `redirectToGoogle()` — generate Google OAuth consent URL with CSRF state, return URL as JSON for React to redirect
- `handleCallback()` — process Google's callback (code + state), exchange for tokens, create/find user, start session, redirect to React app

**Frontend (React) usage:**
- **Initiate OAuth:** `GET /api/auth/google` → returns `{ url }`, then `window.location.href = url` to redirect user to Google
- **Callback:** Google redirects to `/api/auth/google/callback?code=...&state=...` → backend processes, starts session, redirects to React app (e.g., `/dashboard`)
- **Login page:** Add a "Login with Google" button that fetches the URL and redirects

**Example:**
```php
require_once __DIR__ . '/../../vendor/autoload.php';

use Google\Client;
use Google\Service\Oauth2;

class OAuthController {
    private PDO $pdo;

    public function __construct(PDO $pdo) {
        $this->pdo = $pdo;
    }

    public function redirectToGoogle(): void {
        session_start();

        $client = new Client();
        $client->setAuthConfig(__DIR__ . '/../../client_secret.json');
        $client->setRedirectUri('YOUR_CALLBACK_URI'); // must match Google Cloud Console
        $client->addScope(['email', 'profile']);
        $client->setIncludeGrantedScopes(true);
        $client->setAccessType('offline');

        // CSRF protection via state parameter
        $state = bin2hex(random_bytes(16));
        $client->setState($state);
        $_SESSION['oauth_state'] = $state;

        $authUrl = $client->createAuthUrl();
        Response::json(['url' => $authUrl], 200);
    }

    public function handleCallback(): void {
        session_start();

        // Verify CSRF state
        if (!isset($_GET['state']) || $_GET['state'] !== ($_SESSION['oauth_state'] ?? '')) {
            Response::json(['error' => 'State mismatch. Possible CSRF attack.'], 403);
            return;
        }

        if (isset($_GET['error'])) {
            Response::json(['error' => $_GET['error']], 400);
            return;
        }

        $code = $_GET['code'] ?? '';

        $client = new Client();
        $client->setAuthConfig(__DIR__ . '/../../client_secret.json');
        $client->setRedirectUri('YOUR_CALLBACK_URI');

        // Exchange auth code for access + refresh tokens
        $token = $client->fetchAccessTokenWithAuthCode($code);
        $client->setAccessToken($token);

        // Fetch user info from Google
        $oauth = new Oauth2($client);
        $accountInfo = $oauth->userinfo->get();

        // Find or create user in DB
        $user = new User($this->pdo);
        $existingUser = $user->findByEmail($accountInfo->email);

        if (!$existingUser) {
            $names = explode(' ', $accountInfo->name, 2);
            $user->create($names[0] ?? '', $names[1] ?? '', $accountInfo->email, null, null);
            $existingUser = $user->findByEmail($accountInfo->email);
        }

        // Start session
        $_SESSION['loggedin'] = true;
        $_SESSION['user_id'] = $existingUser['id'];
        $_SESSION['full_name'] = $existingUser['first_name'] . ' ' . $existingUser['last_name'];
        $_SESSION['email'] = $existingUser['email'];
        $_SESSION['access_token'] = $token;
        $_SESSION['gid'] = $accountInfo->id;

        // Record login history (type: OAUTH)
        $loginHistory = new LoginHistory($this->pdo);
        $loginHistory->record($existingUser['id'], 'OAUTH');

        // Redirect to React frontend
        header('Location: ' . filter_var('YOUR_FRONTEND_URL/dashboard', FILTER_SANITIZE_URL));
        exit;
    }
}
```

---

### `src/controllers/AthleteController.php`

**Purpose:** CRUD operations for athletes and their Olympic records.

**Methods:**
- `index()` — list athletes with pagination, filtering, sorting
- `show($id)` — get single athlete with their records
- `store()` — create new athlete
- `update($id)` — update athlete data
- `delete($id)` — delete athlete

**Example:**
```php
class AthleteController {
    private PDO $pdo;

    public function __construct(PDO $pdo) {
        $this->pdo = $pdo;
    }

    public function index(): void {
        $page = (int)($_GET['page'] ?? 1);
        $limit = (int)($_GET['limit'] ?? 10);
        $search = Sanitizer::sanitizeString($_GET['search'] ?? '');
        $sort = $_GET['sort'] ?? 'name';
        $order = $_GET['order'] ?? 'ASC';

        $athlete = new Athlete($this->pdo);
        $results = $athlete->getAll($page, $limit, $search, $sort, $order);

        Response::json($results, 200);
    }

    public function show(int $id): void {
        $athlete = new Athlete($this->pdo);
        $data = $athlete->getById($id);

        if (!$data) {
            Response::json(['error' => 'Athlete not found'], 404);
            return;
        }
        Response::json($data, 200);
    }
}
```

---

### `src/controllers/ImportController.php`

**Purpose:** Handles CSV/Excel file uploads and imports data into the database.

**Methods:**
- `import()` — accept uploaded file, parse it, insert records into DB

**Example:**
```php
class ImportController {
    private PDO $pdo;

    public function __construct(PDO $pdo) {
        $this->pdo = $pdo;
    }

    public function import(): void {
        if (!isset($_FILES['file'])) {
            Response::json(['error' => 'No file uploaded'], 400);
            return;
        }

        $file = $_FILES['file'];
        $extension = pathinfo($file['name'], PATHINFO_EXTENSION);

        $importService = new ImportService($this->pdo);

        if ($extension === 'csv') {
            $data = $importService->parseCsvToAssocArray($file['tmp_name']);
        } elseif (in_array($extension, ['xlsx', 'xls'])) {
            $data = $importService->parseExcel($file['tmp_name']);
        } else {
            Response::json(['error' => 'Unsupported file type'], 400);
            return;
        }

        $imported = $importService->importAthletes($data);
        Response::json(['message' => "Imported $imported records"], 200);
    }
}
```

---

### `src/controllers/UserController.php`

**Purpose:** User profile management (for logged-in users).

**Methods:**
- `profile()` — get current user profile from session
- `updateProfile()` — update user info
- `setup2FA()` — generate 2FA secret and QR code using RobThree/TwoFactorAuth
- `verify2FA()` — verify and enable 2FA

**Frontend (React) usage:**
- **Profile:** `GET /api/user/profile` → returns `{ full_name, email, created_at, login_type }` (checks session, returns 401 if not logged in)
- **Setup 2FA:** `POST /api/user/2fa/setup` → returns `{ secret, qr_code }` — display QR as `<img src={qr_code} />`

**Example:**
```php
require_once __DIR__ . '/../../vendor/autoload.php';

use RobThree\Auth\Providers\Qr\BaconQrCodeProvider;
use RobThree\Auth\TwoFactorAuth;

class UserController {
    private PDO $pdo;

    public function __construct(PDO $pdo) {
        $this->pdo = $pdo;
    }

    public function profile(): void {
        session_start();
        if (!isset($_SESSION['loggedin']) || $_SESSION['loggedin'] !== true) {
            Response::json(['error' => 'Unauthorized'], 401);
            return;
        }

        $user = new User($this->pdo);
        $data = $user->findById($_SESSION['user_id']);
        unset($data['password_hash']); // never return password hash
        unset($data['tfa_secret']);     // never return 2FA secret

        // Add login type info (local vs Google)
        $data['login_type'] = isset($_SESSION['gid']) ? 'OAUTH' : 'LOCAL';
        $data['google_id'] = $_SESSION['gid'] ?? null;

        Response::json($data, 200);
    }

    public function setup2FA(): void {
        session_start();
        if (!isset($_SESSION['loggedin']) || $_SESSION['loggedin'] !== true) {
            Response::json(['error' => 'Unauthorized'], 401);
            return;
        }

        $tfa = new TwoFactorAuth(new BaconQrCodeProvider(4, '#ffffff', '#000000', 'svg'));
        $secret = $tfa->createSecret();
        $qrCode = $tfa->getQRCodeImageAsDataUri('Olympic Games APP', $secret);

        $user = new User($this->pdo);
        $user->set2FASecret($_SESSION['user_id'], $secret);

        // Return as JSON — React displays QR code via <img src={qr_code} />
        Response::json(['secret' => $secret, 'qr_code' => $qrCode], 200);
    }
}
```

---

## Models

### `src/models/User.php`

**Purpose:** Database operations for the `user_accounts` table.

**DB Table Schema:**
```sql
CREATE TABLE user_accounts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255),          -- NULL for OAuth-only users
    tfa_secret VARCHAR(255),             -- 2FA TOTP secret
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Methods:**
- `create($firstName, $lastName, $email, $passwordHash, $tfaSecret)` — insert new user
- `findByEmail($email)` — find user by email (unique identifier)
- `findById($id)` — find user by ID
- `set2FASecret($userId, $secret)` — store 2FA secret
- `updatePassword($userId, $hash)` — update password hash

**Example:**
```php
class User {
    private PDO $pdo;

    public function __construct(PDO $pdo) {
        $this->pdo = $pdo;
    }

    public function create(string $firstName, string $lastName, string $email, ?string $passwordHash, ?string $tfaSecret): int {
        $stmt = $this->pdo->prepare(
            "INSERT INTO user_accounts (first_name, last_name, email, password_hash, tfa_secret)
             VALUES (:first_name, :last_name, :email, :password_hash, :tfa_secret)"
        );
        $stmt->execute([
            'first_name' => $firstName,
            'last_name' => $lastName,
            'email' => $email,
            'password_hash' => $passwordHash,
            'tfa_secret' => $tfaSecret
        ]);
        return (int)$this->pdo->lastInsertId();
    }

    public function findByEmail(string $email): ?array {
        $stmt = $this->pdo->prepare("SELECT * FROM user_accounts WHERE email = :email");
        $stmt->execute(['email' => $email]);
        return $stmt->fetch(PDO::FETCH_ASSOC) ?: null;
    }

    public function findById(int $id): ?array {
        $stmt = $this->pdo->prepare("SELECT * FROM user_accounts WHERE id = :id");
        $stmt->execute(['id' => $id]);
        return $stmt->fetch(PDO::FETCH_ASSOC) ?: null;
    }

    public function set2FASecret(int $userId, string $secret): void {
        $stmt = $this->pdo->prepare("UPDATE user_accounts SET tfa_secret = :secret WHERE id = :id");
        $stmt->execute(['secret' => $secret, 'id' => $userId]);
    }
}
```

---

### `src/models/Athlete.php`

**Purpose:** Database operations for the `athletes` table.

**Methods:**
- `getAll($page, $limit, $search, $sort, $order)` — paginated list with search/sort
- `getById($id)` — single athlete with joined records
- `create($data)` — insert athlete
- `update($id, $data)` — update athlete
- `delete($id)` — delete athlete

**Example:**
```php
class Athlete {
    private PDO $pdo;

    public function __construct(PDO $pdo) {
        $this->pdo = $pdo;
    }

    public function getAll(int $page, int $limit, string $search, string $sort, string $order): array {
        $offset = ($page - 1) * $limit;
        $allowedSorts = ['name', 'surname', 'birth_date'];
        $sort = in_array($sort, $allowedSorts) ? $sort : 'name';
        $order = $order === 'DESC' ? 'DESC' : 'ASC';

        $sql = "SELECT * FROM athletes WHERE name LIKE :search OR surname LIKE :search
                ORDER BY $sort $order LIMIT :limit OFFSET :offset";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute(['search' => "%$search%", 'limit' => $limit, 'offset' => $offset]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}
```

---

### `src/models/Country.php`

**Purpose:** Database operations for the `countries` table.

**Methods:**
- `getOrCreate($name)` — find country by name or insert it, return ID
- `getById($id)` — find country by ID

**Example:**
```php
class Country {
    private PDO $pdo;

    public function __construct(PDO $pdo) {
        $this->pdo = $pdo;
    }

    public function getOrCreate(string $name): int {
        $stmt = $this->pdo->prepare("SELECT id FROM countries WHERE name = :name");
        $stmt->execute(['name' => $name]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($row) return (int)$row['id'];

        $stmt = $this->pdo->prepare("INSERT INTO countries (name) VALUES (:name)");
        $stmt->execute(['name' => $name]);
        return (int)$this->pdo->lastInsertId();
    }
}
```

---

### `src/models/Olympics.php`

**Purpose:** Database operations for the `olympics` table.

**Methods:**
- `getOrCreate($year, $type, $city, $countryId)` — find or create Olympics event
- `getAll()` — list all Olympics events

**Example:**
```php
class Olympics {
    private PDO $pdo;

    public function __construct(PDO $pdo) {
        $this->pdo = $pdo;
    }

    public function getOrCreate(int $year, string $type, string $city, int $countryId): int {
        $stmt = $this->pdo->prepare(
            "SELECT id FROM olympics WHERE year = :year AND type = :type"
        );
        $stmt->execute(['year' => $year, 'type' => $type]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($row) return (int)$row['id'];

        $stmt = $this->pdo->prepare(
            "INSERT INTO olympics (year, type, city, country_id) VALUES (:year, :type, :city, :country_id)"
        );
        $stmt->execute(['year' => $year, 'type' => $type, 'city' => $city, 'country_id' => $countryId]);
        return (int)$this->pdo->lastInsertId();
    }
}
```

---

### `src/models/Discipline.php`

**Purpose:** Database operations for the `disciplines` table.

**Methods:**
- `getOrCreate($name)` — find discipline by name or insert it, return ID
- `getAll()` — list all disciplines

**Example:**
```php
class Discipline {
    private PDO $pdo;

    public function __construct(PDO $pdo) {
        $this->pdo = $pdo;
    }

    public function getOrCreate(string $name): int {
        $stmt = $this->pdo->prepare("SELECT id FROM disciplines WHERE name = :name");
        $stmt->execute(['name' => $name]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($row) return (int)$row['id'];

        $stmt = $this->pdo->prepare("INSERT INTO disciplines (name) VALUES (:name)");
        $stmt->execute(['name' => $name]);
        return (int)$this->pdo->lastInsertId();
    }
}
```

---

### `src/models/AthleteRecord.php`

**Purpose:** Database operations for the `athlete_records` table (linking athletes to Olympics results).

**Methods:**
- `getOrCreate($athleteId, $olympicsId, $disciplineId, $placing)` — find or create record
- `getByAthleteId($athleteId)` — get all records for an athlete

**Example:**
```php
class AthleteRecord {
    private PDO $pdo;

    public function __construct(PDO $pdo) {
        $this->pdo = $pdo;
    }

    public function getOrCreate(int $athleteId, int $olympicsId, int $disciplineId, int $placing): int {
        $stmt = $this->pdo->prepare(
            "SELECT id FROM athlete_records
             WHERE athlete_id = :aid AND olympics_id = :oid AND discipline_id = :did"
        );
        $stmt->execute(['aid' => $athleteId, 'oid' => $olympicsId, 'did' => $disciplineId]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($row) return (int)$row['id'];

        $stmt = $this->pdo->prepare(
            "INSERT INTO athlete_records (athlete_id, olympics_id, discipline_id, placing)
             VALUES (:aid, :oid, :did, :placing)"
        );
        $stmt->execute([
            'aid' => $athleteId, 'oid' => $olympicsId,
            'did' => $disciplineId, 'placing' => $placing
        ]);
        return (int)$this->pdo->lastInsertId();
    }
}
```

---

### `src/models/LoginHistory.php`

**Purpose:** Tracks user login history with login type (LOCAL or OAUTH).

**DB Table Schema:**
```sql
CREATE TABLE login_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    login_type ENUM('LOCAL', 'OAUTH') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user_accounts(id) ON DELETE CASCADE
);
```

**Methods:**
- `record($userId, $loginType)` — log a login event (login_type is 'LOCAL' or 'OAUTH', created_at auto-fills)
- `getByUserId($userId)` — get login history for a user

**Frontend (React) usage:**
- `GET /api/user/login-history` → returns array of `{ id, login_type, created_at }` entries

**Example:**
```php
class LoginHistory {
    private PDO $pdo;

    public function __construct(PDO $pdo) {
        $this->pdo = $pdo;
    }

    public function record(int $userId, string $loginType): void {
        $stmt = $this->pdo->prepare(
            "INSERT INTO login_history (user_id, login_type) VALUES (:uid, :login_type)"
        );
        $stmt->execute([
            'uid' => $userId,
            'login_type' => $loginType  // 'LOCAL' or 'OAUTH'
        ]);
    }

    public function getByUserId(int $userId): array {
        $stmt = $this->pdo->prepare(
            "SELECT id, login_type, created_at FROM login_history WHERE user_id = :uid ORDER BY created_at DESC LIMIT 50"
        );
        $stmt->execute(['uid' => $userId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}
```

---

## Services

### `src/services/AuthService.php`

**Purpose:** Core authentication logic — password verification with Argon2ID, 2FA TOTP verification.

**Authentication flow:**
1. Find user by email. If not found → "Invalid credentials" (don't reveal that user doesn't exist)
2. Verify password with `password_verify()` against Argon2ID hash. If wrong → "Invalid credentials" (don't reveal that specifically the password is wrong)
3. Verify TOTP 2FA code if `tfa_secret` is set. If wrong → "Invalid credentials"
4. If all checks pass → user is authenticated

**Methods:**
- `authenticate($email, $password, $totp)` — verify credentials + 2FA, return user data on success
- `hashPassword($password)` — hash with PASSWORD_ARGON2ID

**Example:**
```php
require_once __DIR__ . '/../../vendor/autoload.php';

use RobThree\Auth\Providers\Qr\BaconQrCodeProvider;
use RobThree\Auth\TwoFactorAuth;

class AuthService {
    private PDO $pdo;

    public function __construct(PDO $pdo) {
        $this->pdo = $pdo;
    }

    public function authenticate(string $email, string $password, string $totp = ''): array {
        $user = new User($this->pdo);
        $userData = $user->findByEmail($email);

        // Step 1: Check if user exists
        if (!$userData) {
            return ['success' => false, 'message' => 'Invalid credentials'];
        }

        // Step 2: Verify password (hashed with Argon2ID)
        if (!password_verify($password, $userData['password_hash'])) {
            return ['success' => false, 'message' => 'Invalid credentials'];
        }

        // Step 3: Verify 2FA TOTP code if enabled
        if (!empty($userData['tfa_secret'])) {
            $tfa = new TwoFactorAuth(new BaconQrCodeProvider());
            // discrepancy=2 means code is valid for 60 seconds (2 × 30s intervals)
            if (!$tfa->verifyCode($userData['tfa_secret'], $totp, 2)) {
                return ['success' => false, 'message' => 'Invalid credentials'];
            }
        }

        // All checks passed
        return ['success' => true, 'user' => $userData];
    }

    public static function hashPassword(string $password): string {
        return password_hash($password, PASSWORD_ARGON2ID);
    }
}
```

---

### `src/services/TwoFactorService.php`

**Purpose:** Two-factor authentication using TOTP via `robthree/twofactorauth` library with `BaconQrCodeProvider` for QR generation.

**Methods:**
- `generateSecret()` — create a new TOTP secret key
- `getQRCodeDataUri($secret, $label)` — generate QR code as data URI (can be used directly in `<img src="...">` in React)
- `verifyCode($secret, $code, $discrepancy)` — validate a 6-digit TOTP code (discrepancy=2 means valid for 60s)

**Frontend (React) usage:**
- The `qr_code` returned is a data URI string — use it directly: `<img src={qrCode} alt="2FA QR Code" />`
- The `secret` can also be displayed as text for manual entry into authenticator apps

**Example:**
```php
require_once __DIR__ . '/../../vendor/autoload.php';

use RobThree\Auth\Providers\Qr\BaconQrCodeProvider;
use RobThree\Auth\TwoFactorAuth;

class TwoFactorService {
    private TwoFactorAuth $tfa;

    public function __construct() {
        $this->tfa = new TwoFactorAuth(new BaconQrCodeProvider(4, '#ffffff', '#000000', 'svg'));
    }

    public function generateSecret(): string {
        return $this->tfa->createSecret();
    }

    public function getQRCodeDataUri(string $secret, string $label = 'Olympic Games APP'): string {
        // Returns a data URI (e.g., "data:image/svg+xml;base64,...")
        // Can be used directly as <img src="..." /> in React
        return $this->tfa->getQRCodeImageAsDataUri($label, $secret);
    }

    public function verifyCode(string $secret, string $code, int $discrepancy = 2): bool {
        // discrepancy=2 means the code is valid for 2 × 30s = 60 seconds
        return $this->tfa->verifyCode($secret, $code, $discrepancy);
    }
}
```

---

### `src/services/GoogleOAuthService.php`

**Purpose:** Google OAuth2 integration using `google/apiclient` library. Handles redirect URL generation, token exchange, and user info retrieval.

**Prerequisites:**
- `client_secret.json` downloaded from Google Cloud Console (store outside web-accessible directory)
- Redirect URI configured in Google Cloud Console must match the one used in code
- Required scopes: `email`, `profile` (configured in Google Cloud Console under "Data Access")

**Methods:**
- `getClient()` — create and configure a `Google\Client` instance
- `getAuthUrl($state)` — build Google OAuth consent URL with CSRF state parameter
- `getUserFromCode($code)` — exchange auth code for tokens, fetch user info via `Google\Service\Oauth2`

**Frontend (React) usage:**
- React calls `GET /api/auth/google` → gets `{ url }` → redirects user via `window.location.href = url`
- After Google auth, user is redirected to callback URI → backend processes and redirects back to React app

**Example:**
```php
require_once __DIR__ . '/../../vendor/autoload.php';

use Google\Client;
use Google\Service\Oauth2;

class GoogleOAuthService {
    private string $redirectUri;

    public function __construct() {
        $this->redirectUri = 'YOUR_CALLBACK_URI'; // Must match Google Cloud Console
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
```

---

### `src/services/ImportService.php`

**Purpose:** Parse CSV and Excel files into associative arrays for database import.

**Methods:**
- `parseCsvToAssocArray($filePath, $delimiter)` — read CSV, return array of rows
- `parseExcel($filePath)` — read Excel using PhpSpreadsheet, return array of rows
- `importAthletes($data)` — process parsed data and insert into DB

**Example (already implemented):**
```php
function parseCsvToAssocArray(string $filePath, string $delimiter = ";"): array {
    if (!file_exists($filePath)) {
        throw new Exception("File not found: $filePath");
    }
    $file = fopen($filePath, 'r');
    $headers = fgetcsv($file, 0, $delimiter);
    $rows = [];
    while (($line = fgetcsv($file, 0, $delimiter)) !== false) {
        $rows[] = array_combine($headers, $line);
    }
    fclose($file);
    return $rows;
}
```

---

### `src/services/ValidationService.php`

**Purpose:** Input validation for registration, login, and data forms. Validate on both frontend (React) and backend (PHP).

**Methods:**
- `validateRegistration($email, $password, $passwordRepeat, $firstName, $lastName)` — check all registration fields
- `validateAthleteData($data)` — check required fields for athlete creation
- `validateFileUpload($file)` — check file type, size limits

**Frontend (React) validation notes:**
- Validate on `onBlur` (when user leaves a field) for immediate feedback
- Check email format, password length/strength, password match, name length
- Show field-specific error messages
- Backend validation is the authoritative check — never trust frontend alone

**Example:**
```php
class ValidationService {
    public static function validateRegistration(
        string $email, string $password, string $passwordRepeat,
        string $firstName, string $lastName
    ): array {
        if (empty($firstName)) {
            return ['valid' => false, 'message' => 'First name is required'];
        }
        if (empty($lastName)) {
            return ['valid' => false, 'message' => 'Last name is required'];
        }
        if (strlen($firstName) > 100 || strlen($lastName) > 100) {
            return ['valid' => false, 'message' => 'Name must not exceed 100 characters'];
        }
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            return ['valid' => false, 'message' => 'Invalid email format'];
        }
        if (strlen($password) < 8) {
            return ['valid' => false, 'message' => 'Password must be at least 8 characters'];
        }
        if (!preg_match('/[A-Z]/', $password) || !preg_match('/[0-9]/', $password)) {
            return ['valid' => false, 'message' => 'Password must contain uppercase letter and number'];
        }
        if ($password !== $passwordRepeat) {
            return ['valid' => false, 'message' => 'Passwords do not match'];
        }
        return ['valid' => true];
    }
}
```

---

## Middleware

### `src/middleware/AuthMiddleware.php`

**Purpose:** Protects routes by verifying the user's session. If no active session, returns 401 JSON error.

**Methods:**
- `verify()` — check session `loggedin` flag, halt with 401 JSON if not authenticated
- `getUserId()` — return the authenticated user's ID from the session

**Frontend (React) usage:**
- React must include `credentials: 'include'` in fetch requests to send session cookies
- Example: `fetch('/api/athletes', { credentials: 'include' })`
- On 401 response, redirect user to login page

**Example:**
```php
class AuthMiddleware {
    public static function verify(): void {
        session_start();

        if (!isset($_SESSION['loggedin']) || $_SESSION['loggedin'] !== true) {
            Response::json(['error' => 'Unauthorized'], 401);
            exit;
        }
    }

    public static function getUserId(): int {
        return $_SESSION['user_id'];
    }
}
```

---

### `src/middleware/CorsMiddleware.php`

**Purpose:** Handles Cross-Origin Resource Sharing headers for frontend-backend communication.

**Methods:**
- `handle()` — set CORS headers, handle OPTIONS preflight

**Example:**
```php
class CorsMiddleware {
    public static function handle(): void {
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, Authorization');

        if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            http_response_code(204);
            exit;
        }
    }
}
```

---

## Helpers

### `src/helpers/Response.php`

**Purpose:** Standardized JSON response helper.

**Methods:**
- `json($data, $statusCode)` — output JSON with proper headers and status code
- `error($message, $statusCode)` — shorthand for error responses

**Example:**
```php
class Response {
    public static function json(array $data, int $statusCode = 200): void {
        http_response_code($statusCode);
        header('Content-Type: application/json');
        echo json_encode($data);
    }

    public static function error(string $message, int $statusCode = 400): void {
        self::json(['error' => $message], $statusCode);
    }
}
```

---

### `src/helpers/Sanitizer.php`

**Purpose:** Input sanitization to prevent XSS and injection attacks.

**Methods:**
- `sanitizeString($input)` — trim, strip tags, encode special chars
- `sanitizeEmail($input)` — validate and sanitize email
- `sanitizeInt($input)` — cast to integer safely

**Example:**
```php
class Sanitizer {
    public static function sanitizeString(string $input): string {
        return htmlspecialchars(strip_tags(trim($input)), ENT_QUOTES, 'UTF-8');
    }

    public static function sanitizeEmail(string $input): string {
        $email = filter_var(trim($input), FILTER_SANITIZE_EMAIL);
        return filter_var($email, FILTER_VALIDATE_EMAIL) ? $email : '';
    }

    public static function sanitizeInt($input): int {
        return (int)filter_var($input, FILTER_SANITIZE_NUMBER_INT);
    }
}
```
