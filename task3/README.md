# WEBTE2 — Zadanie č.3: Online Curling Game

> **Autor:** Samuel Bagin
> **Server:** `node22.webte.fei.stuba.sk`
> **Semester:** LS 2025/2026
> **URL:** `https://node22.webte.fei.stuba.sk/zadanie3`
> **Stav:** ✅ Implementované (všetkých 25 požiadaviek, viď §13)

---

## 1. Prehľad projektu

Online hra curling pre dvoch hráčov v reálnom čase cez WebSocket. Každý hráč hrá vo vlastnom prehliadači. Fyzika (kolízie, trenie, odrazy) beží na strane klienta pomocou **Matter.js** — obaja klienti dostávajú rovnaké vstupné parametre a simulujú identický stav **deterministicky**. Server slúži ako autorita — riadi striedanie, páruje hráčov, preposiela herné udalosti a ukladá výsledky do databázy.

Kľúčový návrhový princíp: **deterministická simulácia** na oboch klientoch — namiesto synchronizácie stavu každý frame server preposiela len vektor výstrelu a obaja klienti Matter.js enginom dopočítajú rovnaký výsledok. Pre plynulosť sa navyše počas kĺzania kameňov striemuje pozícia (~33 ms throttle).

---

## 2. Tech Stack

### Frontend
| Technológia | Verzia | Účel |
|---|---|---|
| **Vite** | 8.x | Build tool, dev server, HMR |
| **React** + **TypeScript** | 19.x / 6.x | UI komponenty, stav hry |
| **Tailwind CSS v3** | 3.4.x | Utility-first styling |
| **shadcn/ui** (Radix UI) | 1.x | Button, Dialog, Card, Input, Badge, Toast |
| **Lucide React** | 1.x | Ikonky |
| **Matter.js** | 0.20.x | 2D fyzikálny engine (kolízie, trenie, odrazy) |
| **Canvas API** | — | Rendering hracej plochy (requirement) |

### Backend
| Technológia | Verzia | Účel |
|---|---|---|
| **Node.js** | 20+ | Runtime |
| **TypeScript** | 6.x | Statická typizácia |
| **Express** | 5.x | HTTP server — REST API `/api/stats` |
| **ws** | 8.x | Raw WebSocket server (bez socket.io) |
| **mysql2/promise** | 3.x | MySQL klient (promise API) |
| **dotenv** | 17.x | Environment premenné |
| **tsx** | 4.x | TS runner pre dev mode (`tsx watch`) |

### Databáza
| Technológia | Verzia | Účel |
|---|---|---|
| **MySQL** | 8.4 | Ukladanie hier, hráčov, hodov, štatistík |

> **Poznámka:** Pôvodný návrh počítal s PostgreSQL, ale implementácia používa MySQL 8.4 — schéma je funkčne identická, len v MySQL syntaxi (AUTO_INCREMENT namiesto SERIAL).

### DevOps / Nasadenie
| Technológia | Účel |
|---|---|
| **Docker Compose** | Lokálny dev stack (mysql + server + client) |
| **Nginx** | Reverse proxy pre Node.js + statické súbory na VPS |
| **PM2** *(voliteľné)* | Process manager pre Node.js na VPS |

---

## 3. Dizajnový systém

Vizuál je inšpirovaný dizajnovým systémom Claude Code Docs — teplé krémové pozadie, terracotta akcenty, mäkké pill tvary.

### 3.1 Farebná Paleta (CSS Custom Properties + Tailwind)

```css
:root {
  /* Pozadia */
  --bg-page:        #F0EFEA;    /* teplé krémové pozadie */
  --bg-card:        #FAF9F5;    /* karta / panel */
  --bg-subtle:      #F2F0EB;    /* hover stavy */
  --bg-muted:       #EBE9E3;    /* delimitéry */
  --bg-white:       #FFFFFF;

  /* Text */
  --text-primary:   #141413;
  --text-secondary: #3D3C39;
  --text-muted:     #737170;

  /* Akcent — terracotta / coral */
  --accent-primary: #D4713A;
  --accent-copper:  #D4A27F;

  /* Sekundárny akcent — modrá */
  --accent-blue:    #1A72C7;

  /* Hráčske farby (použité v Renderer.ts) */
  --player-red:     #C0614A;    /* Hráč 0 — terracotta fill  */
  --player-red-edge:#8B2500;    /* Hráč 0 — border + bullseye */
  --player-blue:    #4A7FC0;    /* Hráč 1 — modrý fill */
  --player-blue-edge:#1A3F70;   /* Hráč 1 — border */

  /* Bordery */
  --border-default: #DEDEDE;
}
```

### 3.2 Typografia

| Element | Font | Veľkosť | Váha |
|---|---|---|---|
| h1 (hlavný nadpis) | Georgia / serif | 30px | 400 |
| h2 | Georgia / serif | 24px | 400 |
| h3 | Inter / system | 20px | 600 |
| Body | Inter / system-ui | 16px | 400 |
| Button / Label | Inter / system-ui | 14px | 500 |
| Code / Mono | JetBrains Mono | 14px | 400 |

### 3.3 Border Radius · Spacing · Transitions

- Radius: `12px` (tlačidlá, karty, dialógy), `8px` (badges), `9999px` (avatary)
- Spacing grid: 8 px (základ), dominantné `p-4` (16 px), sekcie `p-8` (32 px)
- Transition: `150ms cubic-bezier(0.4, 0, 0.2, 1)`

---

## 4. Herný Konfiguračný Súbor

**Jediný zdroj pravdy:** [`client/public/game-config.json`](client/public/game-config.json). Súbor číta aj frontend (cez `fetch`), aj backend (cez relatívnu cestu `../../client/public/game-config.json`).

```json
{
  "stones": {
    "perPlayer": 5,
    "radius": 20,
    "friction": 0.015,
    "restitution": 0.5,
    "frictionAir": 0.02
  },
  "target": {
    "x": 0.5,
    "y": 0.2,
    "radius": 80,
    "rings": [80, 55, 30, 10]
  },
  "field": {
    "width": 600,
    "height": 1000,
    "wallRestitution": 0.6
  },
  "shot": {
    "maxForce": 0.08,
    "forceMultiplier": 0.0004
  },
  "physics": {
    "stoppedVelocityThreshold": 0.1,
    "checkInterval": 50
  }
}
```

> Súradnice `target.x` a `target.y` sú relatívne (0–1) k rozmerom plochy — prispôsobia sa responzívne. `checkInterval` je perióda detekcie zastavenia kameňov.

---

## 5. Databázová Schéma (MySQL)

Aktuálna schéma je v [`database/dump.sql`](database/dump.sql) a pri štarte Docker Compose sa automaticky importuje cez `docker-entrypoint-initdb.d/`.

```sql
CREATE TABLE IF NOT EXISTS players (
    id         INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    nickname   VARCHAR(50) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS games (
    id          INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    player1_id  INT,
    player2_id  INT,
    winner_id   INT,
    status      VARCHAR(20) DEFAULT 'in_progress',  -- in_progress | completed | abandoned
    config      JSON NOT NULL,                       -- snapshot hernej konfigurácie
    started_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    finished_at TIMESTAMP NULL,
    FOREIGN KEY (player1_id) REFERENCES players(id),
    FOREIGN KEY (player2_id) REFERENCES players(id),
    FOREIGN KEY (winner_id)  REFERENCES players(id)
);

CREATE TABLE IF NOT EXISTS throws (
    id          INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    game_id     INT,
    player_id   INT,
    throw_order INT NOT NULL,
    force_x     FLOAT NOT NULL,
    force_y     FLOAT NOT NULL,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (game_id)   REFERENCES games(id) ON DELETE CASCADE,
    FOREIGN KEY (player_id) REFERENCES players(id)
);

CREATE INDEX idx_games_status  ON games(status);
CREATE INDEX idx_games_players ON games(player1_id, player2_id);
CREATE INDEX idx_throws_game   ON throws(game_id);
```

---

## 6. Architektúra a Dátový Tok

### 6.1 High-Level Architektúra

```
┌──────────────────┐     WebSocket (ws)     ┌─────────────────────┐
│   Klient A       │◄────────────────────►│   Node.js Server     │
│ (React + Canvas  │                       │ (Express + ws)       │
│  + Matter.js)    │                       │                       │
└──────────────────┘                       │ ┌──────────────────┐ │
                                           │ │  RoomManager     │ │
┌──────────────────┐     WebSocket (ws)     │ │  (matchmaking)   │ │
│   Klient B       │◄────────────────────►│ └──────────────────┘ │
│ (React + Canvas  │                       │ ┌──────────────────┐ │
│  + Matter.js)    │                       │ │  GameRoom(s)     │ │
└──────────────────┘                       │ │  (turn logic)    │ │
                                           │ └──────────────────┘ │
                                           │ ┌──────────────────┐ │
                                           │ │  MySQL pool      │ │
                                           │ └──────────────────┘ │
                                           └──────────────────────┘
```

### 6.2 WebSocket Správy (Protocol)

**Klient → Server:**
| Správa | Payload | Popis |
|---|---|---|
| `join` | `{ nickname: string }` | Prihlásenie hráča (vyžadovaná ako prvá správa) |
| `shoot` | `{ forceX, forceY, stoneIndex }` | Vektor výstrelu |
| `positions_update` | `{ stones: StonePosition[] }` | Streamovanie pozícií počas kĺzania (~33 ms) |
| `stones_stopped` | `{ stones: StonePosition[] }` | Klient potvrdí, že všetky kamene stoja |
| `pause` / `unpause` | `{}` | Pauza / zrušenie pauzy |
| `restart_request` / `restart_accept` | `{}` | Vyžiadanie / odsúhlasenie reštartu |

**Server → Klient:**
| Správa | Payload | Popis |
|---|---|---|
| `waiting` | `{}` | Čakanie na druhého hráča v lobby |
| `game_start` | `{ config, playerIndex, opponent, roomId }` | Hra začína |
| `opponent_shot` | `{ forceX, forceY, stoneIndex }` | Výstrel súpera na simuláciu |
| `opponent_positions` | `{ stones: StonePosition[] }` | Prieběžné pozície súperovho kameňa |
| `turn_change` | `{ activePlayer, throwsRemaining, stones }` | Zmena ťahu + najnovšie pozície |
| `game_over` | `{ winner, distances }` | Koniec hry s výsledkami |
| `paused` / `unpaused` | `{ by?: number }` | Pauza / pokračovanie |
| `restart_requested` | `{ by: number }` | Súper žiada reštart |
| `restarting` | `{ activePlayer, throwsRemaining }` | Nová hra začína |
| `opponent_disconnected` | `{}` | Súper sa odpojil |
| `error` | `{ message: string }` | Chyba |

### 6.3 Herný Cyklus

```
1. Obaja hráči sa pripoja → RoomManager ich spáruje → vytvorí GameRoom.
2. Server pošle game_start s konfiguráciou a priradením (playerIndex 0/1).
3. Hráč na ťahu (0 začína):
   a. Klikne na vlastný kameň → ťahá myšou → zobrazí sa aiming šípka.
   b. Uvoľní myš → klient pošle `shoot` s vektorom sily.
   c. Server validuje (je hráč na ťahu? sú kamene?) → prepošle `opponent_shot`.
   d. Obaja klienti aplikujú rovnakú silu na rovnaký kameň → Matter.js simuluje deterministicky.
   e. Aktívny klient počas kĺzania striemuje `positions_update` → server prepošle `opponent_positions`.
   f. Keď kamene zastanú (checkStopped) → klient pošle `stones_stopped` + finálne pozície.
   g. Keď obaja klienti potvrdia → server pošle `turn_change` alebo ukončí hru.
4. Opakuje sa, kým sa nevyhádžu všetky kamene (5 × 2 hráči = 10 kôl).
5. Server vypočíta vzdialenosti najbližších kameňov k cieľu → `game_over`.
6. Výsledok sa uloží do DB (games.status = 'completed').
```

---

## 7. Štruktúra Projektu

```
zadanie3/
├── client/                             # Frontend (Vite + React + TS)
│   ├── public/
│   │   └── game-config.json            # Externá herná konfigurácia (zdieľaná s backendom)
│   ├── src/
│   │   ├── main.tsx                    # React entry point
│   │   ├── App.tsx                     # Root — screen router (menu → lobby → game → stats)
│   │   ├── index.css                   # Tailwind + reset
│   │   │
│   │   ├── components/
│   │   │   ├── ui/                     # shadcn/ui primitívy
│   │   │   │   ├── badge.tsx
│   │   │   │   ├── button.tsx
│   │   │   │   ├── card.tsx
│   │   │   │   ├── dialog.tsx
│   │   │   │   ├── input.tsx
│   │   │   │   ├── toast.tsx
│   │   │   │   └── toaster.tsx
│   │   │   │
│   │   │   ├── MainMenu.tsx            # Úvodná obrazovka
│   │   │   ├── Lobby.tsx               # Nickname + čakanie na súpera
│   │   │   ├── GameCanvas.tsx          # Canvas + Matter.js integrácia + WS handling
│   │   │   ├── GameHUD.tsx             # Overlay — skóre, ťah, pauza
│   │   │   ├── RulesDialog.tsx         # Pravidlá (Dialog)
│   │   │   ├── GameOverDialog.tsx      # Výsledková obrazovka
│   │   │   ├── PauseOverlay.tsx        # Pauza + restart vyjednávanie
│   │   │   └── StatsPage.tsx           # Tabuľka z /api/stats
│   │   │
│   │   ├── game/
│   │   │   ├── PhysicsEngine.ts        # Matter.js wrapper — bodies, sily, stop detection
│   │   │   ├── GameState.ts            # FSM: idle | waiting | aiming | sliding | stopped
│   │   │   ├── Renderer.ts             # Canvas 2D — plocha, kruhy, kamene, aiming šípka
│   │   │   └── InputHandler.ts         # Slingshot mechanika (mouse down/move/up)
│   │   │
│   │   ├── hooks/
│   │   │   ├── useWebSocket.ts         # WSClient lifecycle + status
│   │   │   ├── useGameLoop.ts          # requestAnimationFrame + delta
│   │   │   └── useResponsiveCanvas.ts  # ResizeObserver + HiDPI scaling
│   │   │
│   │   ├── lib/
│   │   │   ├── config.ts               # fetch + cache game-config.json
│   │   │   ├── ws-client.ts            # WSClient class (connect, send, onMessage)
│   │   │   └── utils.ts                # distancePx, normalizedToCanvas, clampForce
│   │   │
│   │   └── types/
│   │       └── game.ts                 # GameConfig, Stone, Player, C2SMessage, S2CMessage
│   │
│   ├── Dockerfile                      # Client dev container (Vite + HMR)
│   ├── tailwind.config.ts
│   ├── postcss.config.js
│   ├── vite.config.ts                  # Proxy /api + /ws na backend
│   ├── tsconfig.json · tsconfig.app.json · tsconfig.node.json
│   └── package.json
│
├── server/                             # Backend (Node.js + TS)
│   ├── src/
│   │   ├── index.ts                    # Express + WS bootstrap + /api/stats
│   │   ├── websocket/
│   │   │   ├── WebSocketServer.ts      # WSS setup, connection handling (vyžaduje 'join')
│   │   │   ├── RoomManager.ts          # Matchmaking — waiting queue, pair → GameRoom
│   │   │   └── GameRoom.ts             # Turn logic, validácia, pauza, restart, disconnect
│   │   ├── game/
│   │   │   └── logic.ts                # calculateWinner() — najbližší kameň k cieľu
│   │   ├── db/
│   │   │   ├── pool.ts                 # mysql2/promise pool (ENV: DB_HOST, DB_USER, …)
│   │   │   ├── queries.ts              # savePlayers, saveGame, finishGame, abandonGame, saveThrow, getStats
│   │   │   └── schema.sql              # (dokumentácia — reálne sa importuje dump.sql)
│   │   ├── lib/
│   │   │   └── config.ts               # loadConfig() číta client/public/game-config.json
│   │   └── types/
│   │       └── game.ts                 # Zdieľané typy so správami
│   │
│   ├── Dockerfile                      # Server dev container (tsx watch)
│   ├── tsconfig.json
│   └── package.json
│
├── nginx/
│   └── zadanie3.conf                   # Reverse proxy: /zadanie3/, /zadanie3/ws, /zadanie3/api/
│
├── database/
│   └── dump.sql                        # MySQL schéma (auto-import v docker-compose)
│
├── docker-compose.yml                  # mysql + server + client stack
├── .env.example                        # Vzor env premenných pre docker-compose
├── TODO.md                             # Progress tracking (všetky fázy ✅)
└── README.md                           # Tento súbor
```

---

## 8. Kľúčové Implementačné Detaily

### 8.1 Canvas Rendering ([`client/src/game/Renderer.ts`](client/src/game/Renderer.ts))

Renderer kreslí na Canvas 2D:

1. **Pozadie** — `#F0EFEA` (teplý krémový odtieň)
2. **Cieľ** — 4 sústredné kruhy podľa `config.target.rings`:
   - Vonkajší: `#C8C4B0` (light muted)
   - Stredný-von: `#B8825A` (copper)
   - Stredný-dnu: `#C0614A` (terracotta)
   - Stred: `#8B2500` (dark red bullseye)
3. **Kamene** — kruhy s tieňom, farebne rozlíšené:
   - Hráč 0: `#C0614A` fill + `#8B2500` border
   - Hráč 1: `#4A7FC0` fill + `#1A3F70` border
4. **Aiming šípka** — `_drawAimArrow()` — čiara od kamena po kurzor s arrow-head; alpha a hrúbka škálujú s veľkosťou sily
5. **Okraje plochy** — border `#DEDEDE` 2 px

> Poznámka: Pôvodný návrh počítal s oddeleným komponentom `AimingIndicator.tsx` — pri implementácii sa táto logika skonsolidovala priamo do `Renderer._drawAimArrow()` a volá sa z `GameCanvas` počas game loopu.

### 8.2 Matter.js Fyzika ([`client/src/game/PhysicsEngine.ts`](client/src/game/PhysicsEngine.ts))

```typescript
const engine = Matter.Engine.create();
engine.gravity.y = 0; // top-down pohľad

const stone = Matter.Bodies.circle(x, y, config.stones.radius, {
  friction: 0.015,
  frictionAir: 0.02,
  restitution: 0.5,
});

// 4 statické steny pre odrazy
const walls = [ /* top, bottom, left, right */ ];

// Výstrel
Matter.Body.applyForce(stone, stone.position, { x: forceX, y: forceY });

// Detekcia zastavenia — každých 50 ms (config.physics.checkInterval)
// Porovnáva displacement medzi snapshotmi, nie velocity, kvôli floating-point chybám.
// Ak max displacement < 0.5 px → stones_stopped.
```

### 8.3 Slingshot Mechanika ([`client/src/game/InputHandler.ts`](client/src/game/InputHandler.ts))

```
1. mousedown na kameň hráča (len ak phase==='aiming' a stone.owner === playerIndex):
   → uložiť počiatočnú pozíciu.
2. mousemove
   → počítať vektor (kameň → kurzor)
   → obrátiť smer (hráč ťahá dozadu = výstrel dopredu)
   → clamp silu na config.shot.maxForce
   → onAimUpdate(AimVector) — Renderer okamžite prekreslí šípku.
3. mouseup
   → pošle `shoot` { forceX, forceY, stoneIndex } na server
   → lokálne sa sila aplikuje až po opponent_shot echo (alebo ihneď podľa implementácie)
```

### 8.4 Responzívny Canvas ([`client/src/hooks/useResponsiveCanvas.ts`](client/src/hooks/useResponsiveCanvas.ts))

Hook sleduje rodičovský element cez `ResizeObserver` a spočíta:

```typescript
const cssScale   = Math.min(parentW / logicalW, parentH / logicalH);
const renderScale = cssScale * devicePixelRatio; // HiDPI aware
```

- `cssScale` — používa `InputHandler` na prepočet mouse coords → logical coords.
- `renderScale` — nastavuje sa ako transform kontextu, aby sa kreslilo v logických súradniciach a výstup bol ostrý aj na retina displayoch.

### 8.5 WebSocket Synchronizácia — Determinizmus + Streaming

**Princíp:** Deterministická simulácia na oboch klientoch.

1. Klient A vykoná výstrel → pošle `shoot` serveru.
2. Server validuje (je hráč na ťahu?) → prepošle `opponent_shot` klientovi B.
3. Obaja klienti aplikujú **rovnakú silu** na **rovnaký kameň**.
4. Matter.js je deterministický pri rovnakých vstupoch → výsledok je identický.
5. **Bonus smoothing:** aktívny klient počas kĺzania navyše odosiela `positions_update` každých ~33 ms — server ich prepošle opponentovi ako `opponent_positions`, čo slúži len na vizuálnu korekciu. Keď sa kamene zastavia, finálne pozície prevezme server cez `stones_stopped`.
6. Server poslaním `turn_change` pošle autoritatívne pozície — klient vtedy volá `syncPositions()`.

### 8.6 Reštart (mutual consent)

1. Hráč A (počas pauzy) klikne *Request Restart* → `restart_request` → server pošle `restart_requested { by }` hráčovi B.
2. Hráč B akceptuje → `restart_accept`.
3. Server po 2 hlasoch (`restartVotes.size === 2`) volá `restart()` — resetuje stav, uloží nový `games` riadok do DB a pošle obom `restarting` + `turn_change`.

### 8.7 Disconnect

Server v `handleDisconnect(playerIdx)` nastaví `ended = true`, pošle opponentovi `opponent_disconnected` a označí hru v DB ako `abandoned`.

---

## 9. Obrazovky Aplikácie

| Obrazovka | Komponent | Popis |
|---|---|---|
| Hlavné menu | `MainMenu.tsx` | Logo, [Nová hra], [Pravidlá], [Štatistiky] |
| Lobby | `Lobby.tsx` | Nickname input, status indikátor, čakacia animácia |
| Herná plocha | `GameCanvas.tsx` + `GameHUD.tsx` | Canvas + HUD overlay (mená, zostávajúce kamene, ťah, pauza) |
| Game Over | `GameOverDialog.tsx` | Výsledok, vzdialenosti, [Nová hra] / [Menu] |
| Pauza | `PauseOverlay.tsx` | Overlay, [Resume], [Request Restart] / [Accept Restart] |
| Štatistiky | `StatsPage.tsx` | Tabuľka hier z `/api/stats` |
| Pravidlá | `RulesDialog.tsx` | 6-bodový zoznam pravidiel |

---

## 10. Tailwind Konfigurácia

Pozri [`client/tailwind.config.ts`](client/tailwind.config.ts) — paleta (page, card, accent, player.red, player.blue, danger), radii, fonty (Inter / Georgia / JetBrains Mono), transition defaults.

---

## 11. Nginx Konfigurácia

Produkčná konfigurácia: [`nginx/zadanie3.conf`](nginx/zadanie3.conf).

```nginx
server {
    listen 80;
    server_name node22.webte.fei.stuba.sk;

    # Frontend — statické súbory (Vite build output)
    location /zadanie3/ {
        alias /var/www/zadanie3/client/dist/;
        try_files $uri $uri/ /zadanie3/index.html;
    }

    # WebSocket upgrade
    location /zadanie3/ws {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_read_timeout 86400;  # 24h pre dlhé WS spojenia
    }

    # REST API (štatistiky)
    location /zadanie3/api/ {
        proxy_pass http://127.0.0.1:3001/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

---

## 12. Spustenie a Nasadenie

### 12.1 Lokálny dev (odporúčané) — Docker Compose

```bash
# 1) Skopírovať env
cp .env.example .env          # prípadne uprav DB heslá

# 2) Spustiť celý stack (mysql + server + client)
docker compose up --build

# Client:  http://localhost:5173
# Server:  http://localhost:3001
# MySQL:   localhost:3306 (curling_user / curling_pass)
```

Docker Compose definuje tri služby:
- `mysql` — MySQL 8.4, schéma sa auto-importuje zo [`database/dump.sql`](database/dump.sql) pri prvom spustení; dáta sú v named volume `mysql_data`.
- `server` — Node.js dev server (`tsx watch src/index.ts`), src/ je bind-mounted pre HMR.
- `client` — Vite dev server (`npm run dev`), src/ je bind-mounted; `/api` a `/ws` sú proxyované na `server:3001`.

### 12.2 Lokálny dev bez Dockeru

```bash
# MySQL bežiaci lokálne, schéma importovaná manuálne:
mysql -u curling_user -p curling_game < database/dump.sql

# Server
cd server && npm install && npm run dev

# Client (v druhom termináli)
cd client && npm install && npm run dev
```

### 12.3 Produkčný build

```bash
# Frontend
cd client && npm run build        # výstup: client/dist/

# Backend
cd server && npm run build        # výstup: server/dist/
node dist/index.js                # alebo cez PM2
```

### 12.4 Nasadenie na VPS (`node22.webte.fei.stuba.sk`)

```bash
# 1) Upload projektu
scp -r zadanie3/ student@node22.webte.fei.stuba.sk:/var/www/

# 2) Na serveri — MySQL + schéma
mysql -u root -p -e "CREATE DATABASE curling_game; \
  CREATE USER 'curling_user'@'localhost' IDENTIFIED BY '…'; \
  GRANT ALL ON curling_game.* TO 'curling_user'@'localhost';"
mysql -u curling_user -p curling_game < database/dump.sql

# 3) Build + PM2
cd /var/www/zadanie3/client && npm install && npm run build
cd ../server && npm install && npm run build
pm2 start dist/index.js --name curling-server
pm2 save && pm2 startup

# 4) Nginx
sudo cp nginx/zadanie3.conf /etc/nginx/sites-available/
sudo ln -s /etc/nginx/sites-available/zadanie3.conf /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

### 12.5 Overenie

1. Otvoriť `https://node22.webte.fei.stuba.sk/zadanie3` v dvoch prehliadačoch (alebo oknách).
2. Prihlásiť oboch hráčov rôznymi menami → server ich spáruje → hra začne.
3. Po odohraní hry skontrolovať výsledky v sekcii *Štatistiky*.

---

## 13. Checklist Požiadaviek

| # | Požiadavka | Status | Implementácia |
|---|---|---|---|
| 1 | WebSocket real-time hra pre 2 hráčov | ✅ | `server/src/websocket/GameRoom.ts` |
| 2 | Konfigurácia z JSON súboru | ✅ | `client/public/game-config.json` (zdieľaná) |
| 3 | Canvas API rendering | ✅ | `client/src/game/Renderer.ts` |
| 4 | Farebne vyznačený cieľ (sústredné kruhy) | ✅ | 4 prstence v `Renderer.draw()` |
| 5 | Farebne odlíšené kamene | ✅ | Terracotta vs. modrá |
| 6 | Responzívna hracia plocha | ✅ | `useResponsiveCanvas` + HiDPI scaling |
| 7 | Mechanika praku (klik + ťah + uvoľnenie) | ✅ | `InputHandler.ts` |
| 8 | Vizuálna pomôcka (šípka smeru/sily) | ✅ | `Renderer._drawAimArrow()` |
| 9 | Trenie — kamene zastanú | ✅ | `frictionAir` + displacement stop detection |
| 10 | Kolízie kruh-kruh | ✅ | Matter.js built-in |
| 11 | Odrazy od okrajov | ✅ | 4 static wall bodies, `wallRestitution` |
| 12 | Striedanie hráčov | ✅ | `GameRoom.activePlayer` toggle |
| 13 | Ďalší hráč čaká na zastavenie | ✅ | `stones_stopped` z oboch klientov |
| 14 | Určenie víťaza (najbližší kameň k cieľu) | ✅ | `server/src/game/logic.ts:calculateWinner` |
| 15 | Zobrazenie výsledku obom hráčom | ✅ | `GameOverDialog.tsx` |
| 16 | Prihlásenie / lobby | ✅ | `Lobby.tsx` + `RoomManager.ts` |
| 17 | Hlavné menu | ✅ | `MainMenu.tsx` |
| 18 | Pauza | ✅ | `PauseOverlay.tsx` + `handlePause`/`handleUnpause` |
| 19 | Reštart (vzájomný súhlas) | ✅ | `restart_request` / `restart_accept` voting |
| 20 | Odpojenie hráča — korektné ukončenie | ✅ | `handleDisconnect` → `opponent_disconnected` + DB abandon |
| 21 | Server = autorita (striedanie, udalosti) | ✅ | `GameRoom.ts` validuje všetky akcie |
| 22 | Klient posiela vektor výstrelu | ✅ | `shoot { forceX, forceY, stoneIndex }` |
| 23 | Rovnaká simulácia na oboch klientoch | ✅ | Deterministický Matter.js |
| 24 | Grafický vzhľad | ✅ | Claude Code-inšpirovaný design system |
| 25 | DB štatistiky | ✅ | MySQL + `GET /api/stats` + `StatsPage.tsx` |

> **Pozn. k požiadavke č. 25:** zadanie špecifikovalo PostgreSQL, implementácia používa MySQL 8.4 — funkčnosť (ukladanie hier, hráčov, hodov; REST endpoint) je identická, rozdiel je len vo volbe SQL dialektu a drivera (`mysql2/promise`).

---

## 14. Dodatočne Nainštalované Systémové Balíky

| Balík | Dôvod |
|---|---|
| `docker` / `docker-compose` | Lokálny dev stack (na VPS voliteľné) |
| `pm2` | Process manager pre Node.js na VPS (produkcia) |
| `mysql-server` | Ak sa nepoužíva Docker na VPS |

---

## 15. Použité Frameworky a Knižnice

### Frontend
- React 19, TypeScript 6, Vite 8
- Tailwind CSS 3.4, tailwindcss-animate
- shadcn/ui (Radix UI primitívy): Button, Card, Dialog, Input, Badge, Toast
- Lucide React (ikony)
- Matter.js 0.20 (fyzikálny engine)
- class-variance-authority, clsx, tailwind-merge (CSS utility)

### Backend
- Node.js 20+, TypeScript 6
- Express 5 (HTTP + `/api/stats`)
- ws 8 (raw WebSocket)
- mysql2 3 (promise API)
- dotenv
- tsx (dev runner)

---

## 16. Odhad vs. Realita

| Fáza | Odhad | Stav |
|---|---|---|
| Setup projektu (Vite, Tailwind, shadcn, Node) | 2–3 h | ✅ |
| Canvas rendering + Matter.js fyzika | 6–8 h | ✅ |
| Slingshot mechanika + aiming | 3–4 h | ✅ |
| WebSocket server + GameRoom logika | 4–6 h | ✅ |
| UI obrazovky (Menu, Lobby, HUD, GameOver) | 3–4 h | ✅ |
| Styling podľa design systému | 2–3 h | ✅ |
| DB integrácia + štatistiky | 2–3 h | ✅ (MySQL namiesto PG) |
| Docker Compose dev stack | +1–2 h | ✅ (navyše oproti pôvodnému plánu) |
| Nasadenie na VPS + Nginx | 2–3 h | pripravené (Nginx config + PM2 postup) |
| **Celkom** | **~27–38 h** | — |
