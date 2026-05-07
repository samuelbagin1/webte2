════════════════════════════════════════════════════════
1. ZMENY V KONFIGURÁCII VPS / SERVERA
════════════════════════════════════════════════════════

Nginx (/etc/nginx/sites-available/node22.webte.fei.stuba.sk):
  Pridané dva location bloky do existujúceho HTTPS server bloku:

  location /task4/              — alias na /var/www/.../task4/frontend/, try_files pre React SPA
  location /task4/api/          — FastCGI smerovanie na Laravel public/index.php

  Použitý PHP-FPM socket:
    unix:/var/run/php/php8.4-fpm.sock

  Dôležité FastCGI premenné pre Laravel API:
    SCRIPT_FILENAME /var/www/node22.webte.fei.stuba.sk/task4/backend/public/index.php
    SCRIPT_NAME /index.php
    REQUEST_URI /api$1$is_args$args

  Po zmene: sudo nginx -t && sudo systemctl reload nginx

Databáza (MySQL — už bežal na serveri):
  Použitý existujúci používateľ: xbagins, databáza: app_db
  Importovaná schéma a seed dáta: mysql -u xbagins -p app_db < task4_setup.sql

════════════════════════════════════════════════════════
2. DODATOČNE INŠTALOVANÉ SYSTÉMOVÉ BALÍKY
════════════════════════════════════════════════════════

  Nebolo potrebné inštalovať ďalšie systémové balíky.

  Už prítomné na serveri:
    - Nginx 1.28.1
    - PHP 8.4 + PHP-FPM
    - MySQL 8.x
    - Node.js / npm
    - Composer

════════════════════════════════════════════════════════
3. POUŽITÉ FRAMEWORKY A KNIŽNICE
════════════════════════════════════════════════════════

Frontend (frontend/):
  - React 18 + TypeScript              — UI komponenty
  - Vite                               — build tool (výstup: frontend/dist/)
  - Tailwind CSS v3                    — styling
  - shadcn/ui + Radix UI               — formuláre, tlačidlá, tabuľky, karty, taby
  - TanStack Query                     — načítanie a cache API dát
  - TanStack Table                     — tabuľka štatistík vyhľadávania
  - React Hook Form + Zod              — formuláre a validácia
  - React Router                       — routovanie SPA
  - Recharts                           — grafy štatistík
  - Axios                              — HTTP klient
  - Lucide React                       — ikony
  - Sonner                             — toast notifikácie

Backend (backend/):
  - PHP 8.3+ / PHP 8.4 na serveri      — runtime
  - Laravel 13                         — REST API, routovanie, modely, validácia
  - Eloquent ORM                       — práca s databázou
  - Guzzle / Laravel HTTP client       — externé API volania
  - Laravel Cache                      — cache počasia, kurzov a AI textov
  - PHPUnit                            — testovanie API

Externé služby:
  - Open-Meteo                         — aktuálne počasie destinácií
  - Frankfurter API                    — kurzy mien voči EUR
  - REST Countries                     — doplnkové informácie o krajinách
  - OpenAI Responses API               — voliteľné generovanie textu "Prečo teraz"

════════════════════════════════════════════════════════
4. POSTUP NASADENIA
════════════════════════════════════════════════════════

── A. Príprava na lokálnom počítači ──

  # Build frontendu
  cd frontend
  npm install
  npm run build           # výstup v frontend/dist/

  # Príprava backendu
  cd ../backend
  composer install --no-dev --optimize-autoloader

── B. Nahratie súborov na server ──

  # Frontend (statické súbory)
  scp -r frontend/dist/* xbagins@147.175.105.22:/var/www/node22.webte.fei.stuba.sk/task4/frontend/

  # Backend (Laravel aplikácia)
  scp -r backend xbagins@147.175.105.22:/var/www/node22.webte.fei.stuba.sk/task4/

  # SQL schéma a seed dáta
  scp task4_setup.sql xbagins@147.175.105.22:~/task4_setup.sql

── C. Inštalácia závislostí na serveri ──

  ssh xbagins@147.175.105.22
  cd /var/www/node22.webte.fei.stuba.sk/task4/backend
  composer install --no-dev --optimize-autoloader

── D. Konfigurácia prostredia (.env) ──

  cd /var/www/node22.webte.fei.stuba.sk/task4/backend
  cp .env.example .env
  php artisan key:generate
  nano .env

  Dôležité hodnoty:
    APP_NAME=task4
    APP_ENV=production
    APP_DEBUG=false
    APP_URL=https://node22.webte.fei.stuba.sk/task4
    FRONTEND_URL=https://node22.webte.fei.stuba.sk/task4

    DB_CONNECTION=mysql
    DB_HOST=localhost
    DB_PORT=3306
    DB_DATABASE=app_db
    DB_USERNAME=xbagins
    DB_PASSWORD=<heslo>

    SESSION_DRIVER=database
    CACHE_STORE=database
    QUEUE_CONNECTION=database

    OPENAI_API_KEY=<voliteľné>
    OPENAI_MODEL=gpt-5.4-mini

  Poznámka:
    Ak OPENAI_API_KEY nie je nastavený, aplikácia použije vlastný fallback text.

── E. Vytvorenie / naplnenie databázy ──

  mysql -u xbagins -p app_db < ~/task4_setup.sql

  Schéma obsahuje tabuľky:
    countries                     — krajiny, hlavné mestá, meny
    destination_types             — typy dovoleniek
    destinations                  — destinácie, poloha, popis, dĺžka letu
    monthly_climates              — mesačné klimatické údaje
    destination_destination_type  — väzba destinácií na typy
    searches                      — uložené vyhľadávania
    search_results                — výsledky vyhľadávania a skóre zhody
    visits                        — hashované návštevy pre štatistiky
    sessions, cache, jobs         — Laravel systémové tabuľky

  Alternatíva pri nasadzovaní zo zdrojových migrácií:
    php artisan migrate --force
    php artisan db:seed --force

── F. Laravel optimalizácia a práva ──

  cd /var/www/node22.webte.fei.stuba.sk/task4/backend
  php artisan config:cache
  php artisan route:cache
  php artisan view:cache

  # Podľa nastavenia servera musí mať PHP-FPM právo zapisovať do storage a bootstrap/cache
  chmod -R ug+rw storage bootstrap/cache

── G. Nginx konfigurácia ──

  sudo nano /etc/nginx/sites-available/node22.webte.fei.stuba.sk

  # task4 backend API (Laravel)
  location ~ ^/task4/api(/.*)?$ {
      fastcgi_pass unix:/var/run/php/php8.4-fpm.sock;
      include fastcgi_params;
      fastcgi_param SCRIPT_FILENAME /var/www/node22.webte.fei.stuba.sk/task4/backend/public/index.php;
      fastcgi_param SCRIPT_NAME /index.php;
      fastcgi_param REQUEST_URI /api$1$is_args$args;
  }

  # task4 frontend (React SPA)
  location /task4/ {
      alias /var/www/node22.webte.fei.stuba.sk/task4/frontend/;
      index index.html;
      try_files $uri $uri/ /task4/index.html;
  }

  sudo nginx -t && sudo systemctl reload nginx

── H. Overenie ──

  curl https://node22.webte.fei.stuba.sk/task4/api/health
  # očakávaná odpoveď: {"status":"ok"}

  curl https://node22.webte.fei.stuba.sk/task4/api/stats/visits
  # očakávaná odpoveď: JSON so štatistikami návštev

  # Otvoriť v prehliadači:
  # https://node22.webte.fei.stuba.sk/task4/

════════════════════════════════════════════════════════
5. HLAVNÉ FUNKCIE A API ENDPOINTY
════════════════════════════════════════════════════════

Používateľské časti aplikácie:
  - vyhľadanie dovolenkových destinácií podľa typu výletu, teploty, dátumu a letu
  - detail destinácie s krajinou, počasím, kurzom meny a textom "Prečo teraz"
  - porovnanie viacerých vybraných destinácií
  - štatistiky návštevnosti, hodín návštev, vyhľadávaní a preferencií

API endpointy:
  GET  /task4/api/health
  POST /task4/api/search
  GET  /task4/api/destinations/{id}
  GET  /task4/api/destinations/{id}/why-now
  GET  /task4/api/compare
  GET  /task4/api/stats/visits
  GET  /task4/api/stats/hourly
  GET  /task4/api/stats/searches
  GET  /task4/api/stats/preferences
  POST /task4/api/visits/track
