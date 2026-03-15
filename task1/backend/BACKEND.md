# Backend Documentation — Olympic Games App

## Overview

PHP REST API for managing Olympic athletes, their records, Olympics events, and user accounts. Runs on Nginx with MariaDB (MySQL-compatible) database. Uses a custom router with controller/model architecture.

**Base URL:** `https://node22.webte.fei.stuba.sk/api`

---

## Project Structure

```
backend/
├── config.php              # DB credentials, redirect URIs, connectDatabase() helper
├── .env                    # JWT secret (gitignored)
├── client_secret.json      # Google OAuth credentials (gitignored)
├── composer.json           # Dependencies
└── api/
    ├── index.php           # Entry point — session start, CORS, route definitions, router run
    ├── Router.php           # Custom router with {param} support
    ├── controllers/
    │   ├── AuthController.php      # Login, logout, profile
    │   ├── OAuthController.php     # Google OAuth2 flow
    │   ├── UserController.php      # User CRUD, password change, 2FA setup
    │   ├── AthleteController.php   # Athlete & record CRUD, batch/file import
    │   ├── OlympicsController.php  # Olympics event CRUD, file import
    │   └── FilterController.php    # Filter options (years, disciplines)
    ├── models/
    │   ├── User.php            # users table
    │   ├── Athlete.php         # athlete table
    │   ├── AthleteRecord.php   # athlete_record table (junction)
    │   ├── Olympics.php        # olympics table
    │   ├── Country.php         # country table
    │   ├── Discipline.php      # discipline table
    │   ├── LoginHistory.php    # login_history table
    │   └── Authentication.php  # Password verify + TOTP 2FA verify
    ├── middleware/
    │   ├── CorsMiddleware.php  # CORS headers, OPTIONS preflight
    │   └── AuthMiddleware.php  # JWT Bearer token verification
    ├── helpers/
    │   ├── Response.php        # JSON response helper
    │   └── Sanitizer.php       # XSS/injection sanitization
    └── services/
        ├── JwtService.php      # JWT encode/decode (HS256)
        ├── validate.php        # Registration input validation
        └── parse.php           # CSV/Excel/JSON file parsers, date parser
```

---

## Database Schema (inferred from models)

### `users`
| Column | Type | Notes |
|---|---|---|
| id | int (PK, AI) | |
| first_name | string | |
| last_name | string | |
| email | string (unique) | |
| password_hash | string (nullable) | Argon2ID hash. NULL for OAuth-only users |
| totp_secret | string (nullable) | TOTP 2FA secret |
| google_id | string (nullable) | Google account ID (set via OAuth) |

### `athlete`
| Column | Type | Notes |
|---|---|---|
| id | int (PK, AI) | |
| name | string | |
| surname | string | |
| birth_date | date | |
| birth_place | string | |
| birth_country_id | int (FK -> country) | |
| death_date | date (nullable) | |
| death_place | string (nullable) | |
| death_country_id | int (nullable, FK -> country) | |

### `athlete_record`
| Column | Type | Notes |
|---|---|---|
| id | int (PK, AI) | |
| athlete_id | int (FK -> athlete) | Cascade on delete |
| olympics_id | int (FK -> olympics) | |
| discipline_id | int (FK -> discipline) | |
| placing | int | Placement (1, 2, 3, ...) |

### `olympics`
| Column | Type | Notes |
|---|---|---|
| id | int (PK, AI) | |
| type | enum('LOH','ZOH') | LOH = Summer, ZOH = Winter |
| year | int | |
| city | string | |
| country_id | int (FK -> country) | |
| code | string (nullable) | Olympics edition code |

### `country`
| Column | Type | Notes |
|---|---|---|
| id | int (PK, AI) | |
| name | string | |

### `discipline`
| Column | Type | Notes |
|---|---|---|
| id | int (PK, AI) | |
| name | string | |

### `login_history`
| Column | Type | Notes |
|---|---|---|
| id | int (PK, AI) | |
| user_id | int (FK -> users) | |
| method | enum('LOCAL','OAUTH') | Login method |
| login_at | datetime | Timestamp of login |

---

## Authentication & Security

### JWT Tokens
- **Algorithm:** HS256
- **Secret:** stored in `.env` (`jwt_secret`)
- **Access token expiry:** 1 hour (3600s)
- **Refresh token expiry:** 7 days (604800s)
- **Access token payload:** `{ sub: user_id, email, iat, exp }`
- **Refresh token payload:** `{ sub: user_id, type: "refresh", iat, exp }`

### Auth Flow
1. Client sends `Authorization: Bearer <access_token>` header
2. `AuthMiddleware::verify()` extracts and decodes the JWT
3. Returns `user_id` (from `sub` claim) on success, or 401 JSON error on failure

### Password Hashing
- Algorithm: `PASSWORD_ARGON2ID` via PHP's `password_hash()`

### 2FA (TOTP)
- Library: `robthree/twofactorauth`
- QR codes generated as SVG data URIs via `bacon/bacon-qr-code`
- App label: "Olympic Games APP"
- Tolerance window: 2 (verifies ±2 time steps)

### Google OAuth2
- Uses `google/apiclient` library
- Scopes: `email`, `profile`
- CSRF protection via random `state` parameter stored in `$_SESSION`
- Callback creates/finds user in DB, generates JWT, redirects to frontend with token in URL query param

### Input Sanitization (`Sanitizer`)
- `sanitizeString()` — `htmlspecialchars(strip_tags(trim()))` with UTF-8
- `sanitizeEmail()` — `FILTER_SANITIZE_EMAIL` + `FILTER_VALIDATE_EMAIL`
- `sanitizeInt()` — `FILTER_SANITIZE_NUMBER_INT`

### CORS
- Allows origin from request's `HTTP_ORIGIN` (or `*`)
- Allowed methods: `GET, POST, PUT, DELETE, OPTIONS`
- Allowed headers: `Content-Type, Authorization`
- Credentials: allowed
- OPTIONS preflight returns 204

---

## API Endpoints

All endpoints are prefixed with `/api`. Endpoints marked **[AUTH]** require `Authorization: Bearer <token>` header.

### Authentication

| Method | Endpoint | Auth | Request Body | Response |
|---|---|---|---|---|
| POST | `/auth/login` | No | `{ email, password, totp? }` | `{ message, access_token, refresh_token, user: { full_name, email } }` |
| POST | `/auth/logout` | **[AUTH]** | — | `{ message }` |
| GET | `/auth/profile` | **[AUTH]** | — | `{ id, first_name, last_name, email, full_name, login_type, google_id }` |

**Login details:**
- `totp` is optional — only required if the user has 2FA enabled
- On success: sets PHP session (`loggedin`, `user_id`, `full_name`, `email`), generates JWT pair, records login in history
- On failure: returns 401 with `{ error: "invalid credentials" }` (same message for wrong email, password, or TOTP)

**Profile details:**
- `login_type` is computed: `"OAUTH"` if `google_id` is set, otherwise `"LOCAL"`
- `password_hash` and `totp_secret` are stripped from the response

### Google OAuth

| Method | Endpoint | Auth | Request Body | Response |
|---|---|---|---|---|
| GET | `/auth/google` | No | — | `{ url }` (Google consent URL) |
| GET | `/auth/google/callback` | No | Query: `code`, `state` | HTTP 302 redirect to `/dashboard?token=<jwt>` |

**Flow:**
1. Frontend calls `GET /auth/google` → gets consent URL → redirects browser to it
2. Google redirects back to `/auth/google/callback?code=...&state=...`
3. Backend verifies state, exchanges code for token, fetches user info
4. Creates user in DB if not exists (password_hash = NULL, totp_secret = NULL)
5. Starts session, records login as `OAUTH`, generates JWT
6. Redirects to `https://node22.webte.fei.stuba.sk/dashboard?token=<access_token>`

### Users

| Method | Endpoint | Auth | Request Body | Response |
|---|---|---|---|---|
| POST | `/users` | No | `{ first_name, last_name, email, password, password_repeat }` | `{ message, id, tfa_secret, qr_code }` (201) |
| GET | `/users` | **[AUTH]** | — | `[{ id, first_name, last_name, email, password_hash, totp_secret }]` |
| GET | `/users/{id}` | **[AUTH]** | — | `{ id, first_name, last_name, email, password_hash, totp_secret }` |
| PUT | `/users/{id}` | **[AUTH]** | `{ first_name, last_name }` | `{ message }` |
| PUT | `/users/{id}/password` | **[AUTH]** | `{ current_password, new_password, new_password_repeat }` | `{ message }` |
| DELETE | `/users/{id}` | **[AUTH]** | — | `{ message }` |
| GET | `/users/{id}/login-history` | **[AUTH]** | — | `[{ id, login_type, created_at }]` |
| POST | `/users/{id}/2fa` | **[AUTH]** | — | `{ secret, qr_code }` |

**Registration validation rules:**
- `first_name` and `last_name` are required, max 100 chars each
- `email` must be valid format, must not already exist in DB
- `password` must be ≥ 8 chars, contain at least 1 uppercase letter and 1 digit
- `password` and `password_repeat` must match
- On success: automatically generates TOTP secret and QR code (SVG data URI)

**Password change:**
- `current_password` is verified against stored Argon2ID hash
- `new_password` and `new_password_repeat` must match

**2FA setup:**
- Generates a new TOTP secret and QR code, saves secret to DB

### Athletes

| Method | Endpoint | Auth | Request Body | Response |
|---|---|---|---|---|
| GET | `/athletes` | No | Query params (see below) | `{ data: [...], total }` |
| GET | `/athletes/{id}` | No | — | `{ id, name, surname, birth_date, birth_place, birth_country, death_date, death_place, death_country, records: [...] }` |
| POST | `/athletes` | **[AUTH]** | `{ name, surname, birth_date, birth_place, birth_country, death_date?, death_place?, death_country? }` | `{ message }` |
| POST | `/athletes/batch` | **[AUTH]** | `file` (multipart, .json) | `{ message, imported }` |
| POST | `/athletes/import` | **[AUTH]** | `file` (multipart, .csv/.xlsx/.xls) | `{ message, imported }` |
| PUT | `/athletes/{id}` | **[AUTH]** | `{ name, surname, birth_day, birth_place, birth_country, death_day?, death_place?, death_country? }` | `{ message }` |
| DELETE | `/athletes/{id}` | **[AUTH]** | — | `{ message }` |
| DELETE | `/athletes` | **[AUTH]** | — | `{ message }` (deletes ALL athletes) |

**GET `/athletes` query params:**
| Param | Type | Default | Description |
|---|---|---|---|
| page | int | 1 | Page number |
| limit | int | 10 | Items per page (0 = no limit) |
| sort | string | "surname" | Sort column: `name`, `surname`, `year`, `discipline`, `placing`, `city`, `type` |
| order | string | "ASC" | Sort direction: `ASC` or `DESC` |
| year | int | — | Filter by Olympics year |
| discipline | int | — | Filter by discipline ID |

**GET `/athletes/{id}` response:**
- Returns athlete personal data + array of `records`, each containing: `year, type, city, host_country, discipline, placing`

**Batch JSON format** (POST `/athletes/batch`):
```json
[
  {
    "name": "John",
    "surname": "Doe",
    "birth_date": "27/8/1928",
    "birth_place": "Prague",
    "birth_country": "Czechoslovakia",
    "death_date": "",
    "death_place": "",
    "death_country": "",
    "year": 1952,
    "type": "LOH",
    "city": "Helsinki",
    "olympics_country": "Finland",
    "discipline": "100m sprint",
    "placing": 1
  }
]
```

**CSV/Excel import** (POST `/athletes/import`):
- Accepts `.csv` (auto-detects delimiter: `,`, `;`, or tab), `.xlsx`, `.xls`
- First row must be headers
- Supported column names (with alternatives): `name`, `surname`, `birth_date`/`birth_day`, `birth_place`, `birth_country`, `death_date`/`death_day`, `death_place`, `death_country`, `year`/`olympics_year`/`oh_year`, `type`/`olympics_type`/`oh_type`, `city`/`olympics_city`/`oh_city`, `olympics_country`/`country`/`oh_country`/`host_country`, `discipline`, `placing`

**Date parsing** supports formats: `d/m/Y` (27/8/1928), `d/m/y` (7/3/22), `Y-m-d`, and other standard PHP date formats.

### Athlete Records

| Method | Endpoint | Auth | Request Body | Response |
|---|---|---|---|---|
| GET | `/athletes/records` | No | Query params (see below) | `{ data: [...], total }` |
| GET | `/athletes/records/{id}` | No | — | `{ name, surname, placing, type, year, city, host_country, discipline }` |
| POST | `/athletes/{id}/record` | **[AUTH]** | `{ year, type, city, olympics_country, discipline, placing }` | `{ message }` |
| POST | `/athletes/batch/record` | **[AUTH]** | `file` (multipart, .json) | `{ message, imported }` |
| PUT | `/athletes/{id}/record` | **[AUTH]** | `{ olympics_id, discipline_id, placing }` | `{ message }` |

**GET `/athletes/records` query params:**
| Param | Type | Default | Description |
|---|---|---|---|
| page | int | 1 | Page number |
| limit | int | 10 | Items per page |
| sort | string | "surname" | Sort column: `name`, `surname`, `year`, `discipline`, `placing`, `city`, `type` |
| order | string | "ASC" | `ASC` or `DESC` |
| type | string | — | Filter by Olympics type (`LOH` or `ZOH`) |
| year | int | — | Filter by Olympics year |
| placing | int | — | Filter by placement |
| discipline | string | — | Filter by discipline name (looked up by name to get ID) |

### Olympics

| Method | Endpoint | Auth | Request Body | Response |
|---|---|---|---|---|
| GET | `/olympics` | No | — | `[{ id, type, year, city, host_country, code }]` |
| GET | `/olympics/{id}` | No | — | `{ id, type, year, city, country_id, code }` |
| POST | `/olympics` | **[AUTH]** | `{ host_country, type, year, city, code }` | `{ message }` |
| POST | `/olympics/import` | **[AUTH]** | `file` (multipart, .csv/.xlsx/.xls) | `{ message, imported }` |
| DELETE | `/olympics/{id}` | **[AUTH]** | — | `{ message }` |

**Olympics types:** `LOH` (Summer Olympics), `ZOH` (Winter Olympics)

**CSV/Excel import columns:** `type`, `year`, `city`, `country`, `code`

### Filters

| Method | Endpoint | Auth | Response |
|---|---|---|---|
| GET | `/filters/years` | No | `[1896, 1900, 1904, ...]` (distinct Olympic years, sorted) |
| GET | `/filters/disciplines` | No | `[{ name: "100m sprint" }, ...]` (all disciplines, sorted by name) |

### API Docs

| Method | Endpoint | Response |
|---|---|---|
| GET | `/docs` | HTML page (`docs.html`) |

---

## Dependencies (composer.json)

| Package | Version | Purpose |
|---|---|---|
| `robthree/twofactorauth` | ^3.0 | TOTP 2FA generation and verification |
| `google/apiclient` | ^2.19 | Google OAuth2 login flow |
| `bacon/bacon-qr-code` | ^2.0 | QR code generation for 2FA setup |
| `phpoffice/phpspreadsheet` | ^5.5 | Excel (.xlsx/.xls) file parsing for imports |

**Note:** Firebase JWT (`firebase/php-jwt`) is also used (loaded via autoload) for JWT encoding/decoding.

---

## Configuration

### config.php (global variables)
| Variable | Description |
|---|---|
| `$hostname` | Database host (`localhost`) |
| `$database` | Database name (`app_db`) |
| `$username` | DB username |
| `$password` | DB password |
| `$callbackRedirectUri` | Google OAuth callback URL |
| `$redirectToDashboard` | Frontend dashboard URL (post-OAuth redirect) |

### .env
| Key | Description |
|---|---|
| `jwt_secret` | Secret key for HS256 JWT signing |
| `username` | DB username |
| `password` | DB password |
| `database` | DB name |

---

## Error Responses

All errors follow the format:
```json
{ "error": "Error message here" }
```

Common HTTP status codes used:
- `200` — Success
- `201` — Created (user registration)
- `400` — Bad request (validation error, missing data, unsupported file type)
- `401` — Unauthorized (invalid credentials, missing/expired token)
- `404` — Not found (athlete/record not found, unknown route)
- `409` — Conflict (duplicate email on registration)
- `500` — Server error (DB fetch failures on filters)

---

## Model Pattern

All models use a `getOrCreate()` pattern — they first check if a record exists (by unique fields), and return the existing ID or insert and return the new ID. This enables idempotent imports.

Controllers use global DB config variables (`$hostname`, `$database`, `$username`, `$password`) and instantiate models with a fresh PDO connection in their constructor.
