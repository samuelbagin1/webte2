════════════════════════════════════════════════════════
1. ZMENY V KONFIGURÁCII VPS / SERVERA
════════════════════════════════════════════════════════

Nginx (/etc/nginx/sites-available/node22.webte.fei.stuba.sk):
  Pridané tri location bloky do existujúceho HTTPS server bloku:

  location /task3/          — alias na /var/www/.../task3/, try_files pre React SPA
  location /task3/ws        — WebSocket proxy na localhost:3001 (Upgrade headers)
  location /task3/api/      — HTTP proxy na localhost:3001/api/

  Po zmene: sudo nginx -t && sudo systemctl reload nginx

Databáza (MySQL — už bežal na serveri):
  Použitý existujúci používateľ: xbagins, databáza: app_db
  Importovaná schéma: mysql -u xbagins -p app_db < dump.sql

════════════════════════════════════════════════════════
2. DODATOČNE INŠTALOVANÉ SYSTÉMOVÉ BALÍKY
════════════════════════════════════════════════════════

  npm install -g pm2          — process manager pre Node.js (auto-restart, logy)

  Už prítomné na serveri (bez inštalácie):
    - Node.js v24.14.1 (cez nvm)
    - MySQL 8.x
    - Nginx 1.28.1

════════════════════════════════════════════════════════
3. POUŽITÉ FRAMEWORKY A KNIŽNICE
════════════════════════════════════════════════════════

Frontend (client/):
  - React 18 + TypeScript         — UI komponenty
  - Vite                          — build tool (výstup: client/dist/)
  - Tailwind CSS v3               — styling
  - shadcn/ui (Radix UI)          — Button, Card, Dialog, Input, Badge, Toast
  - Matter.js                     — 2D fyzikálny engine (kolízie, trenie)
  - Lucide React                  — ikony
  - Canvas API (built-in)         — rendering hracej plochy

Backend (server/):
  - Node.js + TypeScript          — runtime + jazyk
  - Express 5                     — HTTP server + REST API (/api/stats)
  - ws                            — raw WebSocket server
  - mysql2                        — MySQL klient (promise API)
  - dotenv                        — načítanie .env premenných

════════════════════════════════════════════════════════
4. POSTUP NASADENIA
════════════════════════════════════════════════════════

── A. Príprava na lokálnom počítači ──

  # Build frontendu
  cd client
  npm install
  npm run build           # výstup v client/dist/

  # Build backendu
  cd ../server
  npm install
  npm run build           # výstup v server/dist/

── B. Nahratie súborov na server ──

  # Frontend (statické súbory)
  scp -r client/dist/* xbagins@147.175.105.22:/var/www/node22.webte.fei.stuba.sk/task3/

  # Backend (skompilovaný kód + konfigurácia)
  scp -r server/dist xbagins@147.175.105.22:~/curling-server/
  scp server/package.json server/package-lock.json xbagins@147.175.105.22:~/curling-server/
  scp server/game-config.json xbagins@147.175.105.22:~/curling-server/

── C. Inštalácia závislostí na serveri ──

  ssh xbagins@147.175.105.22
  cd ~/curling-server
  npm ci --omit=dev       # inštalácia bez devDependencies (Linux-native binaries)

── D. Konfigurácia prostredia (.env) ──

  nano ~/curling-server/.env

  Obsah:
    DB_HOST=localhost
    DB_PORT=3306
    DB_USER=xbagins
    DB_PASSWORD=<heslo>
    DB_NAME=app_db
    PORT=3001

── E. Vytvorenie / naplnenie databázy ──

  mysql -u xbagins -p app_db < ~/dump.sql

  Schéma obsahuje tabuľky:
    players  — id, nickname, created_at
    games    — id, player1_id, player2_id, winner_id, status, config, started_at, finished_at
    throws   — id, game_id, player_id, throw_order, force_x, force_y, created_at

── F. Spustenie servera cez PM2 ──

  npm install -g pm2
  cd ~/curling-server
  pm2 start dist/index.js --name curling
  pm2 save
  pm2 startup             # vygeneruje príkaz pre auto-start po reštarte VPS

── G. Nginx konfigurácia ──

  sudo nano /etc/nginx/sites-available/node22.webte.fei.stuba.sk
  # Pridať location bloky (viď sekcia 1)
  sudo nginx -t && sudo systemctl reload nginx

── H. Overenie ──

  curl https://node22.webte.fei.stuba.sk/task3/api/stats   # → JSON []
  pm2 logs curling --lines 20                               # → [server] listening on :3001
  # Otvoriť https://node22.webte.fei.stuba.sk/task3/ v prehliadači
