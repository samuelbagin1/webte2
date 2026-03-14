# Backend Redesign Plan

## Context
The current backend works but doesn't follow the clean REST API pattern from the WEBTE2 assignment PDF. The main issues:
- **Models are plain functions** (not classes with PDO injection as required)
- **Router.php contains all `require` statements** (should be in index.php)
- **Filter routes bypass the router** (inline `if` statements in index.php)
- **Some route inconsistencies** (DELETE `/athletes/{id}` calls `delete()` which deletes ALL athletes)
- **Controllers use `global $pdo`** instead of receiving PDO via model injection

---

## Target Structure

```
api/
├── index.php              # Entry point: requires, session, CORS, route definitions, run()
├── Router.php             # Only the Router class (no requires)
├── controllers/
│   ├── AuthController.php
│   ├── AthleteController.php
│   ├── UserController.php
│   ├── OAuthController.php
│   ├── OlympicsController.php   # NEW - Olympics CRUD + import
│   └── FilterController.php    # NEW - replaces inline filter routes
├── models/
│   ├── User.php               # Class with PDO injection
│   ├── Athlete.php            # Class with PDO injection
│   ├── Country.php            # Class with PDO injection (extracted from insert.php)
│   ├── Discipline.php         # Class with PDO injection
│   ├── Olympics.php           # Class with PDO injection
│   ├── AthleteRecord.php      # Class with PDO injection (extracted from insert.php)
│   └── LoginHistory.php       # Class with PDO injection
├── services/
│   ├── authenticate.php       # Keep as-is (or convert to AuthService class)
│   ├── validate.php           # Keep as-is
│   ├── importService.php      # Keep as-is
│   └── TwoFactorService.php   # Already a class, keep
├── middleware/
│   ├── AuthMiddleware.php     # Keep as-is
│   └── CorsMiddleware.php     # Keep as-is
└── helpers/
    ├── Response.php           # Keep as-is
    └── Sanitizer.php          # Keep as-is
```

---

## REST API Endpoints (Complete List)

### Auth (`/auth`)
| Method | Endpoint | Controller Method | Auth? | Description |
|--------|----------|-------------------|-------|-------------|
| POST | `/auth/login` | `AuthController::login` | No | Login with email/password/totp |
| POST | `/auth/logout` | `AuthController::logout` | Yes | Destroy session |
| GET | `/auth/profile` | `AuthController::profile` | Yes | Get current user profile |

### OAuth (`/auth/google`)
| Method | Endpoint | Controller Method | Auth? | Description |
|--------|----------|-------------------|-------|-------------|
| GET | `/auth/google` | `OAuthController::redirectToGoogle` | No | Get Google OAuth URL |
| GET | `/auth/google/callback` | `OAuthController::handleCallback` | No | Google OAuth callback |

### Athletes (`/athletes`)
| Method | Endpoint | Controller Method | Auth? | Description |
|--------|----------|-------------------|-------|-------------|
| GET | `/athletes` | `AthleteController::index` | No | List athletes (paginated, filterable, sortable). Query params: `?type=LOH&year=2024&discipline=1&placing=1&sort=surname&order=ASC&page=1&limit=10` |
| GET | `/athletes/{id}` | `AthleteController::show` | No | Get single athlete with all records |
| POST | `/athletes` | `AthleteController::create` | Yes | **[REQ 1]** Add single olympian with all info (name, surname, birth, records). Duplicate check by name+surname+birth_date |
| POST | `/athletes/batch` | `AthleteController::createBatch` | Yes | **[REQ 2]** Add multiple olympians from JSON body |
| POST | `/athletes/import` | `AthleteController::import` | Yes | Import athletes from CSV/Excel file upload |
| PUT | `/athletes/{id}` | `AthleteController::update` | Yes | **[REQ 3]** Modify any data about an athlete |
| DELETE | `/athletes/{id}` | `AthleteController::delete` | Yes | **[REQ 4]** Delete single athlete + cascade all records |
| DELETE | `/athletes` | `AthleteController::deleteAll` | Yes | Delete all athletes |

### Olympics (`/olympics`)
| Method | Endpoint | Controller Method | Auth? | Description |
|--------|----------|-------------------|-------|-------------|
| GET | `/olympics` | `OlympicsController::index` | No | List all Olympics events |
| GET | `/olympics/{id}` | `OlympicsController::show` | No | Get single Olympics event |
| POST | `/olympics` | `OlympicsController::create` | Yes | Create Olympics record |
| POST | `/olympics/import` | `OlympicsController::import` | Yes | Import Olympics data from CSV/Excel |
| DELETE | `/olympics/{id}` | `OlympicsController::delete` | Yes | Delete Olympics record |

### API Documentation (`/docs`)
| Method | Endpoint | Controller Method | Auth? | Description |
|--------|----------|-------------------|-------|-------------|
| GET | `/docs` | (static page or OpenAPI JSON) | No | **[REQ 4 from PDF]** API documentation page describing all endpoints |

### Users (`/users`)
| Method | Endpoint | Controller Method | Auth? | Description |
|--------|----------|-------------------|-------|-------------|
| POST | `/users` | `UserController::create` | No | Register new user |
| GET | `/users` | `UserController::index` | Yes | List all users |
| GET | `/users/{id}` | `UserController::show` | Yes | Get single user |
| PUT | `/users/{id}` | `UserController::update` | Yes | Update user profile (name) |
| PUT | `/users/{id}/password` | `UserController::updatePassword` | Yes | Change password |
| DELETE | `/users/{id}` | `UserController::delete` | Yes | Delete user |
| GET | `/users/{id}/login-history` | `UserController::loginHistory` | Yes | Get login history |
| POST | `/users/{id}/2fa` | `UserController::setup2FA` | Yes | Setup 2FA |

### Filters (`/filters`)
| Method | Endpoint | Controller Method | Auth? | Description |
|--------|----------|-------------------|-------|-------------|
| GET | `/filters/years` | `FilterController::years` | No | Get distinct Olympic years |
| GET | `/filters/disciplines` | `FilterController::disciplines` | No | Get all disciplines |

---

## Model Redesign (Key Change)

Convert all models from **plain functions** to **classes with PDO constructor injection**, matching the PDF pattern.

### User Model (`models/User.php`)
```php
class User {
    private PDO $pdo;
    public function __construct(PDO $pdo) { $this->pdo = $pdo; }

    public function create(string $firstName, string $lastName, string $email, ?string $passwordHash, ?string $totpSecret): int
    public function getById(int $id): ?array
    public function getByEmail(string $email): ?array
    public function getAll(): array
    public function update(int $id, string $firstName, string $lastName): bool
    public function updatePassword(int $id, string $passwordHash): bool
    public function set2FASecret(int $id, string $secret): void
    public function delete(int $id): bool
    public function verifyPassword(string $email, string $password): bool
    public function getOrCreate(string $firstName, string $lastName, string $email, ?string $passwordHash, ?string $totpSecret): int
}
```

### Athlete Model (`models/Athlete.php`)
```php
class Athlete {
    private PDO $pdo;
    public function __construct(PDO $pdo) { $this->pdo = $pdo; }

    public function getAll(int $page, int $limit, string $sort, string $order, ?string $type, ?int $year, ?int $discipline, ?int $placing): array
    // ^ added $type (LOH/ZOH) and $placing filters per PDF requirement 5
    public function getById(int $id): ?array
    public function getByName(string $name, string $surname): ?int
    public function create(string $name, string $surname, ...birthInfo): int  // [REQ 1]
    public function getOrCreate(string $name, string $surname, ...): int
    public function update(int $id, array $data): bool                        // [REQ 3]
    public function delete(int $id): bool                                     // [REQ 4] cascade
    public function deleteAll(): void
}
```

### LoginHistory Model (`models/LoginHistory.php`)
```php
class LoginHistory {
    private PDO $pdo;
    public function __construct(PDO $pdo) { $this->pdo = $pdo; }

    public function record(int $userId, string $method): void
    public function getByUserId(int $userId): array
}
```

### Olympics Model (`models/Olympics.php`)
```php
class Olympics {
    private PDO $pdo;
    public function __construct(PDO $pdo) { $this->pdo = $pdo; }

    public function getOrCreate(string $type, int $year, string $city, int $countryId, ?string $code): int
    public function getYears(): array
}
```

### Discipline Model (`models/Discipline.php`)
```php
class Discipline {
    private PDO $pdo;
    public function __construct(PDO $pdo) { $this->pdo = $pdo; }

    public function getOrCreate(string $name): int
    public function getAll(): array
}
```

### Country Model (`models/Country.php`)
```php
class Country {
    private PDO $pdo;
    public function __construct(PDO $pdo) { $this->pdo = $pdo; }

    public function getOrCreate(string $name): int
}
```

### AthleteRecord Model (`models/AthleteRecord.php`)
```php
class AthleteRecord {
    private PDO $pdo;
    public function __construct(PDO $pdo) { $this->pdo = $pdo; }

    public function getOrCreate(int $athleteId, int $olympicsId, int $disciplineId, int $placing): int
}
```

---

## Controller Redesign

Each controller instantiates its model(s) in the constructor with PDO, matching the PDF pattern.

### Method Naming Convention (REST standard)

The 5 standard REST methods per resource:
| Method | Purpose | HTTP | Example Route |
|--------|---------|------|---------------|
| `index()` | List all | GET | `/users` |
| `show($id)` | Get one | GET | `/users/{id}` |
| `create()` | Create new | POST | `/users` |
| `update($id)` | Update existing | PUT | `/users/{id}` |
| `delete($id)` | Delete one | DELETE | `/users/{id}` |

Non-CRUD actions use descriptive verb names on sub-resources.

### UserController — Method Renaming

| Current Method | New Method | Route | Why |
|----------------|------------|-------|-----|
| `create()` | `create()` | POST `/users` | Already correct |
| `index()` | `index()` | GET `/users` | Already correct (empty, needs implementation) |
| `show()` | `show($id)` | GET `/users/{id}` | Already correct (empty, needs implementation) |
| `updateProfile()` | `update($id)` | PUT `/users/{id}` | Standard REST name, `$id` from URL |
| `updatePassword()` | `updatePassword($id)` | PUT `/users/{id}/password` | Sub-resource action, keep descriptive name |
| `setup2FA()` | `setup2FA($id)` | POST `/users/{id}/2fa` | Non-CRUD action, keep descriptive name |
| `loginHistory()` | `loginHistory($id)` | GET `/users/{id}/login-history` | Sub-resource, keep descriptive name |
| `verify2FA()` | `verify2FA($id)` | POST `/users/{id}/2fa/verify` | Non-CRUD action |
| `delete()` | `delete($id)` | DELETE `/users/{id}` | Already correct (empty, needs implementation) |
| `profile()` | **REMOVE** | — | Moved to AuthController (belongs there) |

```php
class UserController {
    private User $userModel;
    private LoginHistory $loginHistoryModel;

    public function __construct() {
        global $hostname, $database, $username, $password;
        $pdo = connectDatabase($hostname, $database, $username, $password);
        $this->userModel = new User($pdo);
        $this->loginHistoryModel = new LoginHistory($pdo);
    }

    public function index() { /* list all users */ }
    public function show($id) { /* get user by id */ }
    public function create() { /* register */ }
    public function update($id) { /* update name (was updateProfile) */ }
    public function delete($id) { /* delete user */ }
    public function updatePassword($id) { /* sub-resource */ }
    public function setup2FA($id) { /* sub-resource */ }
    public function loginHistory($id) { /* sub-resource */ }
}
```

### AthleteController — Method Renaming

| Current Method | New Method | Route | Why |
|----------------|------------|-------|-----|
| `index()` | `index()` | GET `/athletes` | Already correct |
| `show($id)` | `show($id)` | GET `/athletes/{id}` | Already correct |
| `importFile()` | `import()` | POST `/athletes/import` | Cleaner name, "File" is implied |
| `importOlympicsFile()` | **MOVED** | — | Moved to `OlympicsController::import()` |
| `delete()` | `deleteAll()` | DELETE `/athletes` | Explicit name since it deletes ALL |
| *(new)* | `create()` | POST `/athletes` | **[REQ 1]** Add single athlete with records |
| *(new)* | `createBatch()` | POST `/athletes/batch` | **[REQ 2]** Add multiple from JSON |
| *(new)* | `update($id)` | PUT `/athletes/{id}` | **[REQ 3]** Modify athlete data |
| *(new)* | `delete($id)` | DELETE `/athletes/{id}` | **[REQ 4]** Delete single athlete + cascade |

```php
class AthleteController {
    private Athlete $athleteModel;

    public function __construct() { ... }

    public function index() { /* list paginated + filtered by type/year/discipline/placing */ }
    public function show($id) { /* get one with all records */ }
    public function create() { /* [REQ 1] add single athlete, check duplicates */ }
    public function createBatch() { /* [REQ 2] add multiple from JSON body */ }
    public function update($id) { /* [REQ 3] modify any athlete data */ }
    public function delete($id) { /* [REQ 4] delete single + cascade records */ }
    public function deleteAll() { /* delete all athletes */ }
    public function import() { /* import from CSV/Excel file */ }
}
```

### OlympicsController (NEW)

| Method | Route | Purpose |
|--------|-------|---------|
| `index()` | GET `/olympics` | List all Olympics events |
| `show($id)` | GET `/olympics/{id}` | Get single Olympics event |
| `create()` | POST `/olympics` | Create Olympics record |
| `import()` | POST `/olympics/import` | Import from CSV/Excel (moved from AthleteController) |
| `delete($id)` | DELETE `/olympics/{id}` | Delete Olympics record |

```php
class OlympicsController {
    private Olympics $olympicsModel;

    public function __construct() { ... }

    public function index() { /* list all */ }
    public function show($id) { /* get one */ }
    public function create() { /* create record */ }
    public function import() { /* was AthleteController::importOlympicsFile */ }
    public function delete($id) { /* delete one */ }
}
```

### AuthController — Method Renaming

| Current Method | New Method | Route | Why |
|----------------|------------|-------|-----|
| `login()` | `login()` | POST `/auth/login` | Keep (not a resource CRUD) |
| `logout()` | `logout()` | POST `/auth/logout` | Keep |
| `profile()` | `profile()` | GET `/auth/profile` | Keep (already in AuthController) |

No changes needed — auth actions are non-CRUD by nature, descriptive names are correct.

### FilterController (NEW)

```php
class FilterController {
    private Olympics $olympicsModel;
    private Discipline $disciplineModel;

    public function __construct() { ... }
    public function years() { Response::json($this->olympicsModel->getYears()); }
    public function disciplines() { Response::json($this->disciplineModel->getAll()); }
}
```

---

## Router.php Changes
- Move all `require_once` statements OUT of Router.php into index.php
- Keep only the Router class definition
- Fix 401 -> 404 for "Not Found" response

## index.php Changes
- Move all `require_once` from Router.php here
- Replace inline filter `if` blocks with router calls
- Clean up duplicate/TODO routes
- Add `header("Content-Type: application/json")`

---

## Files to Modify
- `api/Router.php` - Remove requires, keep class only
- `api/index.php` - Add requires, fix routes, add filter routes via router
- `api/controllers/AthleteController.php` - Use model classes
- `api/controllers/AuthController.php` - Use model classes
- `api/controllers/UserController.php` - Use model classes
- `api/controllers/OAuthController.php` - Use model classes (minor)

## Files to Create
- `api/models/User.php` (replaces `models/user.php`)
- `api/models/Athlete.php` (replaces `models/athlete.php`)
- `api/models/LoginHistory.php` (replaces `models/loginHistory.php`)
- `api/models/Olympics.php` (extracted from `models/insert.php` + `models/filters.php`)
- `api/models/Discipline.php` (extracted from `models/insert.php` + `models/filters.php`)
- `api/models/Country.php` (extracted from `models/insert.php`)
- `api/models/AthleteRecord.php` (extracted from `models/insert.php`)
- `api/controllers/OlympicsController.php` (new - Olympics CRUD + import)
- `api/controllers/FilterController.php` (new)

## Files to Delete
- `api/models/user.php` (replaced by User.php class)
- `api/models/athlete.php` (replaced by Athlete.php class)
- `api/models/insert.php` (split into Country, Olympics, Discipline, AthleteRecord)
- `api/models/loginHistory.php` (replaced by LoginHistory.php class)
- `api/models/filters.php` (merged into Olympics + Discipline models)

---

## PDF Requirements Coverage

| # | Requirement | Endpoint | Status |
|---|-------------|----------|--------|
| 1 | Add single olympian (duplicate check) | POST `/athletes` | **NEW** |
| 2 | Add multiple from JSON | POST `/athletes/batch` | **NEW** |
| 3 | Modify any athlete data | PUT `/athletes/{id}` | **NEW** |
| 4 | Delete athlete (cascade) | DELETE `/athletes/{id}` | **NEW** |
| 5 | Filter by type/year/placing/sport | GET `/athletes?type=LOH&year=...&placing=...&discipline=...` | **ENHANCED** (add `type`, `placing` params) |
| 6 | Table data via web service | Already uses API | OK |
| 7 | Proper HTTP status codes | All endpoints | Review needed |
| 8 | API documentation page | GET `/docs` (OpenAPI/Swagger) | **NEW** |
| 9 | CRUD forms in private zone | Frontend work | Out of scope for backend plan |
| 10 | Input validation (front+back) | Backend validation in controllers | Partially exists |
| BONUS | JWT authentication | Replace session auth with JWT tokens | **OPTIONAL** |

## Athlete Endpoint Details (Request/Response Bodies)

### POST `/athletes` — Create single athlete [REQ 1]
```json
// REQUEST BODY
{
  "name": "Peter",
  "surname": "Sagan",
  "birth_date": "1990-01-26",
  "birth_place": "Žilina",
  "birth_country": "Slovensko",
  "death_date": null,           // optional
  "death_place": null,          // optional
  "death_country": null,        // optional
  "records": [                  // optional array of Olympic records
    {
      "olympics_type": "LOH",
      "olympics_year": 2016,
      "discipline": "Cyklistika",
      "placing": 1
    }
  ]
}
// RESPONSE 201
{ "message": "Athlete created", "id": 42 }
// RESPONSE 409 (duplicate)
{ "error": "Athlete already exists", "existing_id": 15 }
```
**Duplicate check:** name + surname + birth_date. If athlete exists but has new records → add records to existing athlete (one person can have multiple awards).

### POST `/athletes/batch` — Create multiple athletes [REQ 2]
```json
// REQUEST BODY — array of athletes (same structure as single create)
[
  { "name": "Peter", "surname": "Sagan", "birth_date": "1990-01-26", ... , "records": [...] },
  { "name": "Anastasiya", "surname": "Kuzmina", ... , "records": [...] }
]
// RESPONSE 201
{ "message": "Imported 2 athletes", "created": 2, "skipped": 0 }
```

### PUT `/athletes/{id}` — Update athlete [REQ 3]
```json
// REQUEST BODY — partial update (only send fields to change)
{
  "name": "Peter",
  "surname": "Sagan",
  "birth_date": "1990-01-26",
  "birth_place": "Žilina",
  "birth_country": "Slovensko",
  "records": [                  // if provided, replaces all records
    { "olympics_type": "LOH", "olympics_year": 2016, "discipline": "Cyklistika", "placing": 1 }
  ]
}
// RESPONSE 200
{ "message": "Athlete updated" }
// RESPONSE 404
{ "error": "Athlete not found" }
```

### DELETE `/athletes/{id}` — Delete athlete [REQ 4]
```json
// RESPONSE 200
{ "message": "Athlete deleted" }
// RESPONSE 404
{ "error": "Athlete not found" }
```
Cascade: `athlete_record` rows auto-deleted via `ON DELETE CASCADE` in schema.

### GET `/athletes` — List with filters [REQ 5]
Query parameters:
- `type` — LOH or ZOH (Olympics type filter) **NEW**
- `year` — Olympics year
- `discipline` — discipline ID
- `placing` — placing number (1, 2, 3...) **NEW**
- `sort` — column to sort by (name, surname, year, discipline, placing, city, type)
- `order` — ASC or DESC
- `page` — page number
- `limit` — items per page (0 = all)

---

## API Documentation (Requirement 4 from PDF)

**Approach:** Serve Swagger UI with OpenAPI 3.0 spec.

**New files:**
- `api/openapi.json` — OpenAPI 3.0 specification
- The `/docs` route serves a simple HTML page with Swagger UI loaded from CDN

**Swagger UI page** (`api/docs.html` or generated by a DocsController):
```html
<!DOCTYPE html>
<html>
<head>
    <title>Olympic API Documentation</title>
    <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist/swagger-ui.css">
</head>
<body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist/swagger-ui-bundle.js"></script>
    <script>
        SwaggerUIBundle({ url: "/api/openapi.json", dom_id: '#swagger-ui' });
    </script>
</body>
</html>
```

**OpenAPI spec structure** (`api/openapi.json`):
```yaml
openapi: 3.0.0
info:
  title: Slovak Olympians API
  version: 1.0.0
  description: REST API for managing Slovak Olympic athletes and their records

servers:
  - url: /api

paths:
  /auth/login:
    post: { summary: Login, requestBody: {email, password, totp}, responses: {200, 401} }
  /auth/logout:
    post: { summary: Logout, security: [bearerAuth], responses: {200} }
  /auth/profile:
    get: { summary: Get profile, security: [bearerAuth], responses: {200} }

  /athletes:
    get: { summary: List athletes, parameters: [type, year, discipline, placing, sort, order, page, limit] }
    delete: { summary: Delete all athletes, security: [bearerAuth] }
  /athletes/{id}:
    get: { summary: Get athlete }
    put: { summary: Update athlete, security: [bearerAuth] }
    delete: { summary: Delete athlete, security: [bearerAuth] }
  /athletes/batch:
    post: { summary: Batch create athletes, security: [bearerAuth] }
  /athletes/import:
    post: { summary: Import from CSV/Excel, security: [bearerAuth] }

  /olympics:
    get: { summary: List Olympics }
    post: { summary: Create Olympics, security: [bearerAuth] }
  /olympics/{id}:
    get: { summary: Get Olympics event }
    delete: { summary: Delete Olympics event, security: [bearerAuth] }
  /olympics/import:
    post: { summary: Import Olympics from CSV/Excel, security: [bearerAuth] }

  /users:
    get: { summary: List users, security: [bearerAuth] }
    post: { summary: Register }
  /users/{id}:
    get: { summary: Get user, security: [bearerAuth] }
    put: { summary: Update user, security: [bearerAuth] }
    delete: { summary: Delete user, security: [bearerAuth] }

  /filters/years:
    get: { summary: Get Olympics years }
  /filters/disciplines:
    get: { summary: Get disciplines }

components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
  schemas:
    Athlete: { ... }
    Olympics: { ... }
    User: { ... }
```
The actual file will be a fully-valid JSON OpenAPI 3.0 spec with all request/response schemas defined.

## BONUS: JWT Authentication

**Package:** `firebase/php-jwt` (`composer require firebase/php-jwt`)

**How it works:**
1. User logs in via `POST /auth/login` → server returns `{ "access_token": "...", "refresh_token": "...", "expires_in": 3600 }`
2. Client stores tokens and sends `Authorization: Bearer <access_token>` header with every request
3. `AuthMiddleware::verify()` decodes and validates the JWT instead of checking `$_SESSION`
4. When access token expires, client calls `POST /auth/refresh` with refresh token to get a new access token

**Token payload (claims):**
```json
{
  "sub": 42,           // user_id
  "email": "user@example.com",
  "iat": 1710000000,   // issued at
  "exp": 1710003600    // expires (1 hour for access, 7 days for refresh)
}
```

**New/modified files:**
- `api/services/JwtService.php` (NEW) — encode/decode/validate tokens
  ```php
  class JwtService {
      private string $secretKey;  // from .env or config

      public function generateAccessToken(array $user): string
      public function generateRefreshToken(array $user): string
      public function decode(string $token): ?array   // returns claims or null
      public function isExpired(string $token): bool
  }
  ```
- `api/middleware/AuthMiddleware.php` — change `verify()` to read Bearer token from `Authorization` header, decode with JwtService, extract user_id
- `api/controllers/AuthController.php` — `login()` returns JWT tokens instead of setting session; add `refresh()` method
- `api/index.php` — add route: `POST /auth/refresh` → `AuthController::refresh`

**AuthMiddleware change:**
```php
public static function verify(): int {
    $header = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    if (!preg_match('/Bearer\s+(.+)/', $header, $matches)) {
        Response::json(["error" => "No token provided"], 401);
        exit;
    }
    $jwt = new JwtService();
    $claims = $jwt->decode($matches[1]);
    if (!$claims) {
        Response::json(["error" => "Invalid or expired token"], 401);
        exit;
    }
    return $claims['sub']; // returns user_id
}
```

**Impact:** Every controller method that calls `AuthMiddleware::verify()` now gets user_id as return value instead of reading `$_SESSION['user_id']`. Session-based auth for Google OAuth callback would need to return a JWT after successful OAuth flow too.

---

## Verification
1. Test each endpoint with curl/Postman after changes
2. POST `/athletes` — create single athlete, verify duplicate returns 409
3. POST `/athletes/batch` — send JSON array, verify all created
4. PUT `/athletes/{id}` — modify data, verify changes persist
5. DELETE `/athletes/{id}` — delete athlete, verify records cascade deleted
6. GET `/athletes?type=LOH&year=2024&placing=1` — verify all filters work
7. Verify login/logout/profile flow works
8. Verify import functionality still works
9. Verify 2FA setup and login with TOTP
10. Check all error responses return correct HTTP status codes (200, 201, 400, 401, 404, 409, 500)
