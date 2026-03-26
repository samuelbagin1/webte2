
================================================================================
 1. DODATOČNE INŠTALOVANÉ SYSTÉMOVÉ BALÍKY
================================================================================

1.1  PHP rozšírenia
-------------------
Príkaz:
  sudo apt install php8.5-mbstring php8.5-dom php8.5-xml php8.5-gd php8.5-zip

Zoznam rozšírení a ich účel:

  pdo + pdo_mysql       Databázové pripojenie cez PDO (MariaDB/MySQL)
  mbstring              Práca s viacbajtovými reťazcami (phpspreadsheet)
  dom                   DOM manipulácia XML (phpspreadsheet)
  xml + simplexml       XML spracovanie (phpspreadsheet)
  xmlreader + xmlwriter Čítanie/zápis XML (phpspreadsheet)
  gd                    Spracovanie obrázkov (phpspreadsheet grafy/obrázky)
  zip                   Čítanie XLSX súborov (phpspreadsheet)
  fileinfo              Detekcia MIME typov (upload validácia)
  iconv                 Konverzia kódovania znakov
  ctype                 Kontrola typov znakov
  tokenizer             PHP tokenizer (composer)


================================================================================
 2. POUŽITÉ FRAMEWORKY A KNIŽNICE
================================================================================

2.1  Backend — PHP (Composer závislosti)
-----------------------------------------

Balíček                        Verzia    Účel
---------------------------------------------------------------------------
robthree/twofactorauth         ^3.0      TOTP dvojfaktorová autentifikácia
                                         (generovanie tajomstiev, overovanie
                                         6-ciferných kódov)
google/apiclient               ^2.19     Google OAuth2 prihlasovanie
                                         (token exchange, user info)
bacon/bacon-qr-code            ^2.0      Generovanie QR kódov pre 2FA
                                         nastavenie v autentifikátorovej
                                         aplikácii
phpoffice/phpspreadsheet       ^5.5      Čítanie/zápis Excel (XLSX) a CSV
                                         súborov — import údajov o atletoch

2.2  Frontend — React SPA (NPM závislosti)
--------------------------------------------

A) Produkčné závislosti:

Balíček                        Účel
---------------------------------------------------------------------------
react + react-dom (^19.2)      UI framework
react-router-dom (^7.13)       Klientský routing, chránené cesty
axios (^1.13)                  HTTP klient pre API volania
react-hook-form (^7.71)        Správa formulárov (stav, validácia, submit)
@hookform/resolvers + zod      Validácia formulárov (schémy)
  (zod ^4.3)
radix-ui (^1.4)                Headless UI komponenty (dialog, dropdown,
                               select, tabs, a ďalšie)
shadcn (^4.0)                  UI komponentová knižnica nad Radix UI
                               (Button, Card, Dialog, Form, Input,
                               Table, Tabs, atď.)
class-variance-authority       Utility pre CSS triedy (shadcn/ui)
  + clsx + tailwind-merge
lucide-react (^0.577)          Ikony (predvolené pre shadcn/ui)
@hugeicons/react +             Ďalšie ikony
  @hugeicons/core-free-icons
@react-oauth/google (^0.13)    Google OAuth prihlásenie na frontende
js-cookie (^3.0)               Práca s cookies (cookie consent)
sonner (^2.0)                  Toast notifikácie (žiadne alert/confirm!)
next-themes (^0.4)             Prepínanie témy (dark/light mode)
@fontsource-variable/figtree   Vlastný font Figtree
tw-animate-css                 Animácie pre Tailwind CSS

B) Vývojové závislosti:

Balíček                        Účel
---------------------------------------------------------------------------
vite (^7.3)                    Build nástroj (dev server + produkčný build)
@vitejs/plugin-react           Vite plugin pre React (JSX transform, HMR)
typescript (~5.9)              TypeScript kompilátor
tailwindcss (^4.2)             CSS framework
  + @tailwindcss/vite
eslint + pluginy               Linting a kontrola kvality kódu



================================================================================
 3. POSTUP NASADENIA (krok za krokom)
================================================================================

3.1  Príprava servera
---------------------
  1. Pripojiť sa na VPS cez SSH:
       ssh user@nodeXX.webte.fei.stuba.sk

  2. Aktualizovať systém:
       sudo apt update && sudo apt upgrade -y

  3. Nainštalovať potrebné balíky:
       sudo apt install -y nginx mariadb-server php-fpm php-mysql \
         php-xml php-mbstring php-gd php-zip php-curl composer
  
  4. Nainštalovať PHP závislosti:
       cd /var/www/node22.webte.fei.stuba.sk/backend
       composer install --no-dev --optimize-autoloader
       composer update    (pre cleanup nepotrebných Google API balíkov)


3.2  Konfigurácia databázy
--------------------------

=============================================  SQL  =============================================
  CREATE DATABASE IF NOT EXISTS app_db
      CHARACTER SET utf8mb4
      COLLATE utf8mb4_general_ci;

  USE app_db;

  -- 1. country
  CREATE TABLE country (
      id INT(11) NOT NULL AUTO_INCREMENT,
      name VARCHAR(100) NOT NULL,
      PRIMARY KEY (id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

  -- 2. athlete
  CREATE TABLE athlete (
      id INT(11) NOT NULL AUTO_INCREMENT,
      name VARCHAR(50) NOT NULL,
      surname VARCHAR(50) NOT NULL,
      birth_date DATE DEFAULT NULL,
      birth_place VARCHAR(80) DEFAULT NULL,
      birth_country_id INT(11) DEFAULT NULL,
      death_date DATE DEFAULT NULL,
      death_place VARCHAR(80) DEFAULT NULL,
      death_country_id INT(11) DEFAULT NULL,
      PRIMARY KEY (id),
      FOREIGN KEY (birth_country_id) REFERENCES country(id) ON DELETE SET NULL,
      FOREIGN KEY (death_country_id) REFERENCES country(id) ON DELETE SET NULL
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

  -- 3. olympics
  CREATE TABLE olympics (
      id INT(11) NOT NULL AUTO_INCREMENT,
      type ENUM('LOH', 'ZOH') NOT NULL,
      year INT(11) NOT NULL,
      city VARCHAR(80) NOT NULL,
      country_id INT(11) NOT NULL,
      code VARCHAR(10) DEFAULT NULL,
      PRIMARY KEY (id),
      FOREIGN KEY (country_id) REFERENCES country(id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

  -- 4. discipline
  CREATE TABLE discipline (
      id INT(11) NOT NULL AUTO_INCREMENT,
      name VARCHAR(80) NOT NULL,
      PRIMARY KEY (id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

  -- 5. athlete_record
  CREATE TABLE athlete_record (
      id INT(11) NOT NULL AUTO_INCREMENT,
      athlete_id INT(11) NOT NULL,
      olympics_id INT(11) NOT NULL,
      discipline_id INT(11) NOT NULL,
      placing INT(11) DEFAULT NULL,
      PRIMARY KEY (id),
      FOREIGN KEY (athlete_id) REFERENCES athlete(id) ON DELETE CASCADE,
      FOREIGN KEY (olympics_id) REFERENCES olympics(id) ON DELETE CASCADE,
      FOREIGN KEY (discipline_id) REFERENCES discipline(id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

  -- 6. users
  CREATE TABLE users (
      id INT(11) NOT NULL AUTO_INCREMENT,
      first_name VARCHAR(255) NOT NULL,
      last_name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      password_hash VARCHAR(255) DEFAULT NULL,
      google_id VARCHAR(255) DEFAULT NULL,
      totp_secret VARCHAR(255) DEFAULT NULL,
      totp_enabled TINYINT(1) NOT NULL DEFAULT 0,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      UNIQUE KEY uq_email (email),
      UNIQUE KEY uq_google_id (google_id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

  -- 7. login_history
  CREATE TABLE login_history (
      id INT(11) NOT NULL AUTO_INCREMENT,
      user_id INT(11) NOT NULL,
      login_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      method VARCHAR(50) NOT NULL,
      PRIMARY KEY (id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

=============================================  /SQL  =============================================





================================================================================
 4. ZMENY V KONFIGURÁCII VPS / SERVERA
================================================================================

4.1  Nginx – konfigurácia virtuálneho hosta
---------------------------------------------
Súbor: /etc/nginx/sites-available/node22.webte.fei.stuba.sk

Hlavné zmeny oproti predvolenej konfigurácii servera:

  Pôvodná konfigurácia:
  - root nastavený na /var/www/node22.webte.fei.stuba.sk
  - index: index.php index.html
  - všeobecný PHP handler cez fastcgi-php.conf snippet
  - vlastná 404 stránka (404.html)

  Nová konfigurácia (po nasadení):
  - root zmenený na /var/www/node22.webte.fei.stuba.sk/frontend
    (React SPA statické súbory)
  - index: index.html

  - location ~ ^/api(/.*)?$ — všetky API požiadavky (/api/*) smerované
    priamo na PHP-FPM:
      fastcgi_pass unix:/var/run/php/php8.4-fpm.sock;
      fastcgi_param SCRIPT_FILENAME .../backend/public/index.php;
      fastcgi_param REQUEST_URI $request_uri;
      include fastcgi_params;
    Všetky API požiadavky sa spracúvajú cez jeden vstupný bod (index.php),
    ktorý funguje ako router.

  - location / — React SPA catch-all (musí byť AŽ ZA /api blokom):
      try_files $uri $uri/ /index.html;
    Ak súbor existuje (JS, CSS, obrázky), vráti sa priamo.
    Inak sa vráti index.html a React Router spracuje URL na klientovi.

  - location ~* /vendor/ — blokovaný prístup k Composer závislostiam:
      deny all;
      return 403;

  - location ~ /\.ht — blokovaný prístup k .htaccess a iným skrytým súborom:
      deny all;

  - client_max_body_size 500M — povolenie nahrávania veľkých súborov
    (import CSV/XLSX s dátami olympionikov)

  - SSL/HTTPS konfigurácia zostáva nezmenená (certifikát školy)
  - HTTP (port 80) automaticky presmerováva na HTTPS (port 443)
  - include snippets/phpmyadmin.conf — prístup k phpMyAdmin zostáva zachovaný


4.2  Konfigurácia Nginx
------------------------
  1. Upraviť konfiguračný súbor:
       sudo nano /etc/nginx/sites-available/node22.webte.fei.stuba.sk

  2. Obsah konfigurácie (node22.webte.fei.stuba.sk):

       server {
            listen 80;
            listen [::]:80;
            server_name node22.webte.fei.stuba.sk;
            rewrite ^ https://$server_name$request_uri? permanent;
        }

        server {
            listen 443 ssl;
            listen [::]:443 ssl;

            server_name node22.webte.fei.stuba.sk;

            access_log /var/log/nginx/access.log;
            error_log  /var/log/nginx/error.log info;

            ssl_certificate /etc/ssl/certs/webte_fei_stuba_sk.pem;
            ssl_certificate_key /etc/ssl/private/webte.fei.stuba.sk-ec.key;

            root /var/www/node22.webte.fei.stuba.sk/frontend;
            index index.html;

            client_max_body_size 500M;

            # === BACKEND API (must be BEFORE the SPA catch-all) ===
            location ~ ^/api(/.*)?$ {
                fastcgi_pass unix:/var/run/php/php8.4-fpm.sock;
                include fastcgi_params;
                fastcgi_param SCRIPT_FILENAME /var/www/node22.webte.fei.stuba.sk/backend/public/index.php;
                fastcgi_param SCRIPT_NAME /index.php;
                fastcgi_param REQUEST_URI $request_uri;
            }


            # Block vendor directory
            location ~* /vendor/ {
                deny all;
                return 403;
            }

            location ~ /\.ht {
                deny all;
            }

            # === FRONTEND (React SPA catch-all) ===
            location / {
                try_files $uri $uri/ /index.html;
            }

            include snippets/phpmyadmin.conf;
        }


  3. Otestovať a reštartovať Nginx:
       sudo nginx -t
       sudo systemctl restart nginx


