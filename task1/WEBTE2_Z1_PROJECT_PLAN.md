# WEBTE2 – Zadanie č.1: Slovenskí olympionici

## Prehľad projektu

Webová stránka s prehľadom slovenských olympionikov. Verejná zóna (tabuľka s filtrovaním, sortovaním, stránkovaním, detail osoby) + privátna zóna (prihlásenie s 2FA + Google OAuth2, import dát, správa profilu, história prihlásení).

**Stack:** PHP backend (REST API) + React frontend (SPA, Vite + shadcn/ui + Tailwind CSS), MariaDB/MySQL (PhpMyAdmin), Nginx na VPS.

---

## Architektúra

```
Browser (React SPA)  ──HTTP/JSON──>  Nginx  ──FastCGI──>  PHP-FPM  ──PDO──>  MariaDB
```

---

## Databáza – `app_db`

### Existujúce tabuľky (podľa tvojho návrhu)

#### `country`
| Stĺpec | Typ | Popis |
|---------|-----|-------|
| id | INT(11) PK AI | Identifikátor |
| name | VARCHAR(10) | Názov/kód krajiny |

#### `athlete`
| Stĺpec | Typ | Popis |
|---------|-----|-------|
| id | INT(11) PK AI | Identifikátor |
| name | VARCHAR(50) | Meno |
| surname | VARCHAR(50) | Priezvisko |
| birth_date | DATE | Dátum narodenia |
| birth_place | VARCHAR(80) | Miesto narodenia |
| birth_country_id | INT(11) | FK → country(id) |
| death_date | DATE | Dátum úmrtia (NULL ak žije) |
| death_place | VARCHAR(80) | Miesto úmrtia |
| death_country_id | INT(11) | FK → country(id), NULL povolené |

#### `olympics`
| Stĺpec | Typ | Popis |
|---------|-----|-------|
| id | INT(11) PK AI | Identifikátor |
| type | ENUM('LOH','ZOH') | Letné / Zimné |
| year | INT(11) | Rok konania |
| city | VARCHAR(80) | Mesto |
| country_id | INT(11) | FK → country(id) |

#### `discipline`
| Stĺpec | Typ | Popis |
|---------|-----|-------|
| id | INT(11) PK AI | Identifikátor |
| name | VARCHAR(80) | Názov disciplíny |

#### `athlete_record` (asociatívna tabuľka)
| Stĺpec | Typ | Popis |
|---------|-----|-------|
| id | INT(11) PK AI | Identifikátor |
| athlete_id | INT(11) | FK → athlete(id) |
| olympics_id | INT(11) | FK → olympics(id) |
| discipline_id | INT(11) | FK → discipline(id) |
| placing | INT(11) | Umiestnenie (1=zlato, 2=striebro, 3=bronz, ...) |

### Tabuľky na doplnenie (auth systém)

#### `users`
| Stĺpec | Typ | Popis |
|---------|-----|-------|
| id | INT(11) PK AI | Identifikátor |
| first_name | VARCHAR(255) NOT NULL | Meno |
| last_name | VARCHAR(255) NOT NULL | Priezvisko |
| email | VARCHAR(255) NOT NULL UNIQUE | E-mail (jedinečný identifikátor pre login) |
| password_hash | VARCHAR(255) | Hash hesla – `password_hash($pw, PASSWORD_ARGON2ID)`. NULL pre Google-only účty |
| google_id | VARCHAR(255) UNIQUE | Google user ID (NULL pre lokálne účty) |
| tfa_secret | VARCHAR(255) | TOTP secret pre 2FA (generovaný pri registrácii) |
| created_at | TIMESTAMP DEFAULT CURRENT_TIMESTAMP | Automaticky vyplnený čas registrácie |

> **Heslá sa do databázy ukladajú zásadne hashované, nikdy nie v plain-text podobe!** Používame `password_hash()` s algoritmom `PASSWORD_ARGON2ID`. Dĺžku `password_hash` stĺpca volíme podľa algoritmu (pozri [PHP docs](https://www.php.net/manual/en/function.password-hash.php)). E-mail slúži ako jedinečný identifikátor používateľa (UNIQUE constraint).

#### `login_history`
| Stĺpec | Typ | Popis |
|---------|-----|-------|
| id | INT(11) PK AI | Identifikátor |
| user_id | INT(11) NOT NULL | FK → users(id) ON DELETE CASCADE |
| method | VARCHAR(50) NOT NULL | 'local' alebo 'google' |
| created_at | TIMESTAMP DEFAULT CURRENT_TIMESTAMP | Automaticky vyplnený čas prihlásenia |

> Pri vymazaní používateľa sa vymažú aj záznamy o jeho prihláseniach (ON DELETE CASCADE).

### ER vzťahy

```
country (1) ──< (N) olympics          (country_id)
country (1) ──< (N) athlete           (birth_country_id, death_country_id)
country (1) ──< (N) athlete_record    – nepriamo cez olympics

athlete (1) ──< (N) athlete_record    (athlete_id)
olympics (1) ──< (N) athlete_record   (olympics_id)
discipline (1) ──< (N) athlete_record (discipline_id)

users (1) ──< (N) login_history          (user_id)
```

`athlete_record` = many-to-many medzi `athlete` ↔ `olympics`, rozšírená o `discipline` a `placing`.

---

## Štruktúra projektu

### Produkčná (VPS)

```
/var/www/
├── config.php                            # DB + OAuth config – MIMO document root!
│
├── nodeXX.webte.fei.stuba.sk/            # Nginx document root
│   ├── api/                              # PHP backend
│   │   ├── index.php                     # Front controller / router
│   │   │
│   │   ├── controllers/
│   │   │   ├── AuthController.php        # Login, register, logout, 2FA
│   │   │   ├── OAuthController.php       # Google OAuth2 (redirect, callback)
│   │   │   ├── AthleteController.php     # List, detail, filtre, sorting, pagination
│   │   │   ├── ImportController.php      # Upload XLSX/CSV, import, vymazanie
│   │   │   └── UserController.php        # Profil, heslo, história prihlásení
│   │   │
│   │   ├── models/
│   │   │   ├── User.php                  # CRUD users
│   │   │   ├── Athlete.php               # getOrCreate athlete
│   │   │   ├── Country.php               # getOrCreate country
│   │   │   ├── Olympics.php              # getOrCreate olympics
│   │   │   ├── Discipline.php            # getOrCreate discipline
│   │   │   ├── AthleteRecord.php         # INSERT/DELETE athlete_record
│   │   │   └── LoginHistory.php          # INSERT/SELECT login_history
│   │   │
│   │   ├── services/
│   │   │   ├── AuthService.php           # password_hash/verify, session
│   │   │   ├── TwoFactorService.php      # TOTP (pragmarx/google2fa)
│   │   │   ├── GoogleOAuthService.php    # Token exchange, user info
│   │   │   ├── ImportService.php         # XLSX/CSV čítanie, getOrCreate logika
│   │   │   └── ValidationService.php     # Backend validácia
│   │   │
│   │   ├── middleware/
│   │   │   ├── AuthMiddleware.php        # Session check pre privátne endpointy
│   │   │   └── CorsMiddleware.php        # CORS hlavičky
│   │   │
│   │   └── helpers/
│   │       ├── Response.php              # JSON response helper
│   │       └── Sanitizer.php             # htmlspecialchars, trim
│   │
│   ├── dist/                             # React build (npm run build)
│   └── uploads/                          # Dočasné XLSX/CSV súbory
│
├── vendor/                               # Composer (NEODOVZDÁVAŤ!)
└── composer.json
```

### Lokálna vývojová

```
webte2-z1/
│
├── backend/
│   ├── public/
│   │   └── index.php
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── AuthController.php
│   │   │   ├── OAuthController.php
│   │   │   ├── AthleteController.php
│   │   │   ├── ImportController.php
│   │   │   └── UserController.php
│   │   ├── models/
│   │   │   ├── User.php
│   │   │   ├── Athlete.php
│   │   │   ├── Country.php
│   │   │   ├── Olympics.php
│   │   │   ├── Discipline.php
│   │   │   ├── AthleteRecord.php
│   │   │   └── LoginHistory.php
│   │   ├── services/
│   │   │   ├── AuthService.php
│   │   │   ├── TwoFactorService.php
│   │   │   ├── GoogleOAuthService.php
│   │   │   ├── ImportService.php
│   │   │   └── ValidationService.php
│   │   ├── middleware/
│   │   │   ├── AuthMiddleware.php
│   │   │   └── CorsMiddleware.php
│   │   └── helpers/
│   │       ├── Response.php
│   │       └── Sanitizer.php
│   ├── config.php
│   ├── composer.json
│   └── composer.lock
│
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── main.jsx
│   │   ├── App.jsx
│   │   │
│   │   ├── api/
│   │   │   └── client.js                # Axios instance (base URL, interceptory)
│   │   │
│   │   ├── context/
│   │   │   └── AuthContext.jsx           # Auth stav (user, isLoggedIn)
│   │   │
│   │   ├── hooks/
│   │   │   ├── useAuth.js
│   │   │   └── useAthletes.js            # Fetch s filtrami/sortom/stránkovaním
│   │   │
│   │   ├── router/
│   │   │   ├── routes.jsx                # React Router v6
│   │   │   └── ProtectedRoute.jsx        # Redirect na login
│   │   │
│   │   ├── pages/
│   │   │   ├── HomePage.jsx              # Verejná – tabuľka olympionikov
│   │   │   ├── AthleteDetailPage.jsx     # Detail – všetky údaje
│   │   │   ├── LoginPage.jsx             # Lokálne + Google
│   │   │   ├── RegisterPage.jsx          # Registrácia
│   │   │   ├── TwoFactorPage.jsx         # 2FA verifikácia
│   │   │   ├── TwoFactorSetupPage.jsx    # QR kód setup
│   │   │   ├── DashboardPage.jsx         # Privátna zóna
│   │   │   ├── ProfilePage.jsx           # Zmena mena + hesla
│   │   │   ├── LoginHistoryPage.jsx      # História prihlásení
│   │   │   └── ImportPage.jsx            # Upload + import + vymazanie
│   │   │
│   │   ├── components/
│   │   │   ├── ui/                      # shadcn/ui komponenty (auto-generated)
│   │   │   │   ├── button.tsx
│   │   │   │   ├── card.tsx
│   │   │   │   ├── dialog.tsx
│   │   │   │   ├── form.tsx
│   │   │   │   ├── input.tsx
│   │   │   │   ├── label.tsx
│   │   │   │   ├── table.tsx
│   │   │   │   ├── tabs.tsx
│   │   │   │   ├── toast.tsx
│   │   │   │   ├── dropdown-menu.tsx
│   │   │   │   ├── select.tsx
│   │   │   │   └── sonner.tsx
│   │   │   ├── layout/
│   │   │   │   ├── Navbar.jsx            # Menu + info o userovi
│   │   │   │   ├── Footer.jsx
│   │   │   │   └── Layout.jsx            # Navbar + Outlet + Footer
│   │   │   ├── athletes/
│   │   │   │   ├── AthleteTable.jsx      # TanStack Table
│   │   │   │   ├── AthleteFilters.jsx    # Dropdowny (rok, kategória)
│   │   │   │   └── AthleteRow.jsx        # Klikateľné meno → detail
│   │   │   ├── auth/
│   │   │   │   ├── LoginForm.jsx
│   │   │   │   ├── RegisterForm.jsx
│   │   │   │   ├── GoogleLoginButton.jsx
│   │   │   │   └── TwoFactorForm.jsx
│   │   │   ├── profile/
│   │   │   │   ├── EditProfileForm.jsx
│   │   │   │   └── ChangePasswordForm.jsx
│   │   │   ├── import/
│   │   │   │   ├── FileUpload.jsx
│   │   │   │   └── DeleteDataButton.jsx
│   │   │   └── common/
│   │   │       ├── CookieConsent.jsx
│   │   │       ├── FormError.jsx         # Inline chyby (nie alert!)
│   │   │       └── LoadingSpinner.jsx
│   │   │
│   │   ├── lib/
│   │   │   └── utils.ts                # shadcn/ui cn() helper
│   │   │
│   │   └── styles/
│   │       └── globals.css             # Tailwind + shadcn/ui CSS variables (light/dark)
│   │
│   ├── components.json                  # shadcn/ui config
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── tsconfig.json
│
├── database/
│   ├── schema.sql                        # CREATE TABLE pre všetkých 7 tabuliek
│   └── dump.sql                          # mysqldump
│
├── nginx/
│   └── site.conf
│
├── README.md                             # Technická správa
└── .gitignore
```

---

## API Endpointy

### Verejné

| Metóda | URL | Popis |
|--------|-----|-------|
| GET | `/api/athletes` | Zoznam – query: `page`, `limit`, `sort`, `order`, `year`, `discipline` |
| GET | `/api/athletes/{id}` | Detail – JOIN cez athlete_record → olympics, discipline, country |
| GET | `/api/filters/years` | `SELECT DISTINCT year FROM olympics ORDER BY year` |
| GET | `/api/filters/disciplines` | `SELECT id, name FROM discipline ORDER BY name` |

### Auth

| Metóda | URL | Popis |
|--------|-----|-------|
| POST | `/api/auth/register` | Registrácia |
| POST | `/api/auth/login` | Login → 2FA required? |
| POST | `/api/auth/2fa/verify` | TOTP overenie |
| POST | `/api/auth/2fa/setup` | Secret + QR URI |
| GET | `/api/auth/google` | Redirect na Google |
| GET | `/api/auth/google/callback` | Callback → session |
| POST | `/api/auth/logout` | Odhlásenie |
| GET | `/api/auth/me` | Aktuálny user |

### Privátne

| Metóda | URL | Popis |
|--------|-----|-------|
| PUT | `/api/user/profile` | Zmena mena/priezviska |
| PUT | `/api/user/password` | Zmena hesla |
| GET | `/api/user/login-history` | História |
| POST | `/api/import/upload` | Upload + import do DB |
| DELETE | `/api/import/data` | Vymazanie olympijských dát |

### Kľúčové SQL pre `/api/athletes`

```sql
-- Základný query pre zoznam (server-side pagination + sorting = BONUS)
SELECT
    a.id,
    a.name,
    a.surname,
    o.year,
    o.type,
    o.city,
    c_rep.name AS country,          -- krajina z olympics
    d.name AS discipline,
    ar.placing
FROM athlete_record ar
JOIN athlete a ON ar.athlete_id = a.id
JOIN olympics o ON ar.olympics_id = o.id
JOIN discipline d ON ar.discipline_id = d.id
JOIN country c_rep ON o.country_id = c_rep.id
WHERE 1=1
    -- filtre (ak sú aktívne):
    -- AND o.year = :year
    -- AND d.id = :discipline_id
ORDER BY a.surname ASC             -- dynamický ORDER BY podľa sort param
LIMIT :limit OFFSET :offset        -- server-side pagination
```

```sql
-- Detail jedného atleta
SELECT
    a.*,
    c_birth.name AS birth_country,
    c_death.name AS death_country
FROM athlete a
LEFT JOIN country c_birth ON a.birth_country_id = c_birth.id
LEFT JOIN country c_death ON a.death_country_id = c_death.id
WHERE a.id = :id;

-- + jeho záznamy:
SELECT
    o.year, o.type, o.city,
    d.name AS discipline,
    ar.placing,
    c_host.name AS host_country
FROM athlete_record ar
JOIN olympics o ON ar.olympics_id = o.id
JOIN discipline d ON ar.discipline_id = d.id
JOIN country c_host ON o.country_id = c_host.id
WHERE ar.athlete_id = :id
ORDER BY o.year;
```

---

## Import logika (getOrCreate pattern)

```
Pre každý riadok z XLSX/CSV:
  1. getOrCreateCountry(name) → country_id     // pre host krajinu OH
  2. getOrCreateCountry(name) → birth/death country_id
  3. getOrCreateOlympics(type, year, city, country_id) → olympics_id
  4. getOrCreateAthlete(name, surname, birth_date, ...) → athlete_id
  5. getOrCreateDiscipline(name) → discipline_id
  6. INSERT INTO athlete_record(athlete_id, olympics_id, discipline_id, placing)
```

**Vymazanie:** `DELETE FROM athlete_record` (+ voliteľne `DELETE FROM athlete`, `olympics`, `discipline` ak chceš čistý stav). Import musí po vymazaní fungovať.

---

## Knižnice

### Backend (`composer.json`)

| Knižnica | Účel |
|----------|------|
| **phpoffice/phpspreadsheet** | Čítanie XLSX (alebo CSV cez `fgetcsv()`) |
| **robthree/twofactorauth** | TOTP 2FA (`createSecret()`, `verifyCode()`, `getQRCodeImageAsDataUri()`) |
| **bacon/bacon-qr-code** ^2 | QR kódy pre 2FA (provider pre robthree) |
| **google/apiclient** | Google OAuth2 (`Google\Client`, `Google\Service\Oauth2`) |

### Frontend (`package.json`)

**UI Framework:** [shadcn/ui](https://ui.shadcn.com/) — open-source sada accessible komponentov (60+), ktoré sa kopírujú priamo do projektu (plná kontrola). Postaven na Radix UI + Tailwind CSS. Inštalácia cez CLI: `npx shadcn@latest init` (Vite) + `npx shadcn@latest add button card dialog form input table tabs toast` atď.

| Knižnica | Účel |
|----------|------|
| **react** + **react-dom** | React SPA |
| **react-router-dom** v6+ | Routing, protected routes |
| **shadcn/ui** (Button, Card, Dialog, Form, Input, Table, Tabs, Toast...) | Predpripravené accessible UI komponenty |
| **@tanstack/react-table** v8 | Tabuľka – sorting, pagination (shadcn/ui DataTable wrapper) |
| **react-hook-form** + **zod** + **@hookform/resolvers** | Formuláre + validácia (shadcn/ui Form je wrapper nad react-hook-form) |
| **axios** | HTTP klient |
| **tailwindcss** | Responzívne CSS (základ pre shadcn/ui) |
| **@react-oauth/google** | Google OAuth2 button |
| **sonner** | Toast notifikácie (nie alert!) — shadcn/ui Sonner wrapper |
| **lucide-react** | Ikony (default pre shadcn/ui) |
| **js-cookie** | Cookie consent |

### Alternatívy pre tabuľku

| Knižnica | Kedy |
|----------|------|
| **@tanstack/react-table** | Plná kontrola, server-side = BONUS – **odporúčané** |
| **MUI X Data Grid** | Rýchly štart, batteries-included |
| **PrimeReact DataTable** | Lazy loading out of the box |

---

## Kľúčové implementačné body

### Tabuľka (verejná zóna)
- Dropdown filtre: **Rok** a **Kategória** – keď aktívny → stĺpec sa skryje
- 3-stavové sortovanie na "Priezvisko", "Rok", "Kategória": ASC → DESC → pôvodné
- Klik na meno → `/athlete/:id`
- Stránkovanie: 10/20 + všetky
- **BONUS:** SQL `LIMIT/OFFSET` + `ORDER BY`

### Autentifikácia

#### Registrácia
1. Formulár: meno, priezvisko, email, heslo, heslo znova
2. Frontend validácia (okamžite po opustení políčka): formát emailu, dĺžka mena/priezviska, sila hesla, zhoda hesiel
3. Backend validácia: `filter_var()`, kontrola UNIQUE emailu, `htmlspecialchars()`
4. Heslo sa hashuje: `password_hash($pw, PASSWORD_ARGON2ID)` — **nikdy plain-text!**
5. Po úspešnej registrácii: vygenerovať 2FA TOTP secret + QR kód, zobraziť používateľovi
6. Používateľ naskenuje QR kód do Google Authenticator (alebo zadá secret manuálne)

#### Prihlásenie (lokálne s 2FA)
1. Formulár: email, heslo, TOTP kód (6-ciferný)
2. Postup overovania (aplikácia je "skeptická" — nehovorí, čo konkrétne je zlé):
   - Zisti, či používateľ s emailom existuje → ak nie: "Nesprávne prihlasovacie údaje"
   - Over heslo cez `password_verify()` → ak nezodpovedá: "Nesprávne prihlasovacie údaje"
   - Over TOTP kód cez `$tfa->verifyCode($secret, $code, 2)` (discrepancy=2 → 60s platnosť) → ak nezodpovedá: "Nesprávne prihlasovacie údaje"
3. Po úspešnom overení: `session_start()`, uložiť do `$_SESSION`: `loggedin=true`, `full_name`, `email`, `created_at`
4. Zaznamenať prihlásenie do `login_history` (login_type = 'LOCAL')
5. Presmerovať na zabezpečenú stránku

#### Google OAuth2
1. Vytvoriť projekt v Google Cloud Console → OAuth consent screen (External) → OAuth Client (Web app)
2. Nastaviť Redirect URI na `oauth2callback.php`
3. Stiahnuť `client_secret.json` — uložiť MIMO document root (vedľa `config.php`)
4. Data Access scopes: `email`, `profile`, `openid`
5. Flow:
   - Používateľ klikne "Prihlásiť sa cez Google" → redirect na Google auth URL
   - Generovať `state` parameter (CSRF ochrana): `bin2hex(random_bytes(16))`, uložiť do session
   - Google vráti auth code na callback URI → overiť `state` → exchange code za access token
   - Načítať user info cez `Google\Service\Oauth2` → `$oauth->userinfo->get()`
   - Uložiť do session: `loggedin=true`, `full_name`, `email`, `gid` (Google ID)
   - Zaznamenať prihlásenie do `login_history` (login_type = 'OAUTH')
6. Knižnica: `google/apiclient` — optimalizovať cez `composer.json` extra config (ponechať len `Oauth2`)

#### Zabezpečené stránky
- Každá chránená stránka: `session_start()` → kontrola `$_SESSION['loggedin'] === true` → ak nie, redirect na login
- Rozlíšenie lokálneho a Google prihlásenia podľa prítomnosti `$_SESSION['gid']`

#### Odhlásenie
```php
session_start();
$_SESSION = array();
session_unset();
session_destroy();
header("location: index.php");
exit;
```

#### Composer závislosti (2FA + OAuth)
```sh
composer require robthree/twofactorauth
composer require bacon/bacon-qr-code ^2
composer require google/apiclient
```
Optimalizácia Google knižníc v `composer.json`:
```json
{
    "scripts": {
        "pre-autoload-dump": "Google\\Task\\Composer::cleanup"
    },
    "extra": {
        "google/apiclient-services": ["Oauth2"]
    }
}
```
Potom `composer update` na vymazanie nepotrebných Google API knižníc.

- Každé prihlásenie → `login_history`

### Validácia
- Frontend: react-hook-form + zod
- Backend: PHP `filter_var()`, regex
- **ŽIADNE `alert()` / `confirm()`!**

---

## Nginx – kľúčové body

```nginx
server {
    listen 80;
    server_name nodeXX.webte.fei.stuba.sk;
    root /var/www/nodeXX.webte.fei.stuba.sk;
    charset utf-8;
    client_max_body_size 10M;

    # React SPA
    location / {
        try_files $uri $uri/ /dist/index.html;
    }

    # Blokovať prístup k vendor/
    location ~* /vendor/ {
        deny all;
        return 403;
    }

    # PHP API
    location /api/ {
        try_files $uri /api/index.php$is_args$args;
        location ~ \.php$ {
            fastcgi_pass unix:/run/php/php-fpm.sock;
            fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
            include fastcgi_params;
        }
    }
}
```

---

## Postup nasadenia

1. SSH → nainštalovať php-fpm, php-mysql, php-xml, php-zip, php-gd, php-mbstring, nginx, mariadb, composer, node/npm
2. DB cez PhpMyAdmin (`utf8mb4_general_ci`) + `schema.sql`
3. `composer install` (backend) — inštalácia v adresári projektu, potom `composer update` pre cleanup Google API
4. `npm install && npm run build` (frontend) → `dist/`
5. `config.php` + `client_secret.json` mimo document root (napr. `/var/www/`)
6. Google Cloud Console: vytvoriť projekt → OAuth consent screen (External) → OAuth Client → Redirect URI → scopes (email, profile, openid) → stiahnuť `client_secret.json`
7. Nginx: pridať blokovanie `/vendor/`, restart + test
8. **Produkčne vymazať `composer.json` zo servera** (stačí `vendor/` a zdrojáky)
9. Všetky zmeny na serveri zdokumentovať v README

---

## Checklist

- [ ] ZIP: `idStudenta_priezvisko_z1.zip`
- [ ] PHP, JSX, JS, CSS zdrojáky
- [ ] `composer.json` (BEZ `vendor/`)
- [ ] `package.json` (BEZ `node_modules/`)
- [ ] `dump.sql`
- [ ] `site.conf`
- [ ] `README.md` (zmeny VPS, balíky, frameworky, postup nasadenia)
- [ ] Odkaz na nodeXX.webte.fei.stuba.sk

---

## Poznámky

- `config.php` MIMO document root
- UTF-8 všade (DB `utf8mb4`, PHP, HTML, HTTP)
- Prepared statements výhradne
- Min. 2 neštandardné fonty + responzivita
- Toto zadanie nadväzuje na ďalšie – čistá architektúra sa oplatí
