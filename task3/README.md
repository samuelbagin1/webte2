# WEBTE2 — Zadanie č.3: Online Curling Game

> **Autor:** Samuel  
> **Server:** `node22.webte.fei.stuba.sk`  
> **Semester:** LS 2025/2026  
> **URL:** `https://node22.webte.fei.stuba.sk/zadanie3`

---

## 1. Prehľad projektu

Online hra curling pre dvoch hráčov v reálnom čase cez WebSocket. Každý hráč hrá vo vlastnom prehliadači. Fyzika (kolízie, trenie, odrazy) beží na strane klienta pomocou **Matter.js**, pričom obaja klienti dostanú rovnaké vstupné parametre a simulujú identický stav. Server slúži ako autorita — riadi striedanie, páruje hráčov a preposiela herné udalosti.

---

## 2. Tech Stack

### Frontend
| Technológia | Účel |
|---|---|
| **Vite** | Build tool, dev server, HMR |
| **React 18** + **TypeScript** | UI komponenty, stav hry |
| **Tailwind CSS v3** | Utility-first styling |
| **shadcn/ui** (Radix UI) | UI komponenty (Button, Dialog, Card, Input, Toast, Badge) |
| **Lucide React** | Ikonky |
| **Matter.js** | 2D fyzikálny engine (kolízie, trenie, odrazy) |
| **Canvas API** | Rendering hracej plochy (requirement) |

### Backend
| Technológia | Účel |
|---|---|
| **Node.js** (v20+) | Runtime |
| **ws** | WebSocket server (raw, bez socket.io) |
| **Express** | HTTP server pre statické súbory + REST API (štatistiky) |
| **pg** (node-postgres) | PostgreSQL klient |
| **dotenv** | Environment premenné |

### Databáza
| Technológia | Účel |
|---|---|
| **PostgreSQL** | Ukladanie výsledkov hier, hráčov, štatistík |

### DevOps / Nasadenie
| Technológia | Účel |
|---|---|
| **Nginx** | Reverse proxy pre Node.js + statické súbory |
| **PM2** | Process manager pre Node.js na VPS |
| **VPS** | `node22.webte.fei.stuba.sk` |

---

## 3. Dizajnový systém

Vizuál je inšpirovaný dizajnovým systémom Claude Code Docs — teplé krémové pozadie, terracotta akcenty, mäkké pill tvary. Zjednodušený na herný kontext.

### 3.1 Farebná Paleta (CSS Custom Properties)

```css
:root {
  /* Pozadia */
  --bg-page:        #F0EFEA;    /* teplé krémové pozadie */
  --bg-card:        #FAF9F5;    /* karta / panel */
  --bg-subtle:      #F2F0EB;    /* hover stavy */
  --bg-muted:       #EBE9E3;    /* delimitéry, code bloky */
  --bg-white:       #FFFFFF;    /* čisté biele pozadie */

  /* Text */
  --text-primary:   #141413;    /* nadpisy, hlavný text */
  --text-secondary: #3D3C39;    /* sekundárny text */
  --text-muted:     #737170;    /* utlmený / placeholder */
  --text-on-dark:   #FFFFFF;    /* text na tmavom pozadí */

  /* Akcent — terracotta / coral */
  --accent-primary: #D4713A;    /* hlavný brand akcent */
  --accent-copper:  #D4A27F;    /* teplý medený odtieň, dekoratívne prvky */

  /* Sekundárny akcent — modrá */
  --accent-blue:    #1A72C7;    /* linky, sekundárny akcent */
  --accent-blue-hover: #3F8FD9; /* hover stav linkov */

  /* Hráčske farby */
  --player-red:     #D4713A;    /* Hráč 1 — terracotta kamene */
  --player-blue:    #1A72C7;    /* Hráč 2 — modré kamene */

  /* Danger / Error */
  --danger:         #CF222E;    /* error / disconnect stavy */

  /* Bordery */
  --border-default: #DEDEDE;    /* defaultné bordery */
  --border-subtle:  #E5E5E5;    /* jemné bordery */

  /* CTA / Buttons */
  --btn-primary-bg: #0E0E0E;    /* primárne tlačidlo pozadie */
  --btn-primary-fg: #FFFFFF;    /* primárne tlačidlo text */

  /* Shadows */
  --shadow-ring:    rgba(158, 158, 158, 0.3);
  --shadow-subtle:  rgba(0, 0, 0, 0.05);
}
```

### 3.2 Typografia

| Element | Font | Veľkosť | Váha | Poznámka |
|---|---|---|---|---|
| h1 (hlavný nadpis) | System serif / Georgia | 30px | 400 | letter-spacing: -0.75px |
| h2 | System serif / Georgia | 24px | 400 | letter-spacing: -0.6px |
| h3 | System sans (Inter) | 20px | 600 | — |
| Body | Inter / system-ui | 16px | 400 | line-height: 1.65 |
| Button | Inter / system-ui | 14px | 500 | — |
| Label / Small | Inter / system-ui | 12–14px | 500 | — |
| Code / Mono | JetBrains Mono | 14px | 400 | — |

> Keďže Anthropic Sans nie je verejne dostupný, používame **Inter** ako drop-in náhradu pre sans-serif a **Georgia / serif** pre display nadpisy.

### 3.3 Border Radius

| Hodnota | Použitie |
|---|---|
| `12px` (`rounded-xl`) | Tlačidlá, karty, inputy, dialógy — primárny tvar |
| `8px` (`rounded-lg`) | Menšie badge / chip prvky |
| `6px` (`rounded-md`) | Inline code |
| `9999px` | Avatary, indikátory |

### 3.4 Spacing

Základný grid: **8px** (Tailwind: `gap-2`, `p-2`).  
Dominantná hodnota: **16px** (`p-4`, `gap-4`).  
Sekcie: **32px** (`p-8`).

### 3.5 Transitions

- Štandard: `150ms ease-in-out` (tlačidlá, hover stavy)
- Ease: `cubic-bezier(0.4, 0, 0.2, 1)` (Tailwind default)

### 3.6 Shadows

Minimálne, ring-based:
```css
.card-shadow {
  box-shadow: 0 0 0 1px var(--shadow-ring), 0 1px 2px var(--shadow-subtle);
}
```

---

## 4. Herný Konfiguračný Súbor (`game-config.json`)

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
    "checkInterval": 100
  }
}
```

> Súradnice `target.x` a `target.y` sú relatívne (0–1) k rozmerom plochy — prispôsobia sa responzívne.

---

## 5. Databázová Schéma (PostgreSQL)

```sql
-- Tabuľka hráčov
CREATE TABLE players (
    id          SERIAL PRIMARY KEY,
    nickname    VARCHAR(50) NOT NULL,
    created_at  TIMESTAMP DEFAULT NOW()
);

-- Tabuľka hier
CREATE TABLE games (
    id           SERIAL PRIMARY KEY,
    player1_id   INTEGER REFERENCES players(id),
    player2_id   INTEGER REFERENCES players(id),
    winner_id    INTEGER REFERENCES players(id),
    status       VARCHAR(20) DEFAULT 'in_progress',  -- in_progress, completed, abandoned
    config       JSONB NOT NULL,                       -- snapshot hernej konfigurácie
    started_at   TIMESTAMP DEFAULT NOW(),
    finished_at  TIMESTAMP
);

-- Tabuľka hodov (voliteľné, pre replay/štatistiky)
CREATE TABLE throws (
    id          SERIAL PRIMARY KEY,
    game_id     INTEGER REFERENCES games(id) ON DELETE CASCADE,
    player_id   INTEGER REFERENCES players(id),
    throw_order INTEGER NOT NULL,
    force_x     FLOAT NOT NULL,
    force_y     FLOAT NOT NULL,
    created_at  TIMESTAMP DEFAULT NOW()
);

-- Indexy
CREATE INDEX idx_games_status ON games(status);
CREATE INDEX idx_games_players ON games(player1_id, player2_id);
CREATE INDEX idx_throws_game ON throws(game_id);
```

---

## 6. Architektúra a Dátový Tok

### 6.1 High-Level Architektúra

```
┌─────────────────┐     WebSocket (ws)     ┌──────────────────┐
│   Klient A      │◄─────────────────────►│   Node.js Server  │
│  (React + Canvas │                       │  (Express + ws)   │
│   + Matter.js)  │                       │                    │
└─────────────────┘                       │  ┌──────────────┐ │
                                          │  │  Game Rooms   │ │
┌─────────────────┐     WebSocket (ws)     │  │  Manager      │ │
│   Klient B      │◄─────────────────────►│  └──────────────┘ │
│  (React + Canvas │                       │  ┌──────────────┐ │
│   + Matter.js)  │                       │  │  PostgreSQL   │ │
└─────────────────┘                       │  └──────────────┘ │
                                          └──────────────────┘
```

### 6.2 WebSocket Správy (Protocol)

**Klient → Server:**
| Správa | Payload | Popis |
|---|---|---|
| `join` | `{ nickname: string }` | Prihlásenie hráča |
| `shoot` | `{ forceX: number, forceY: number, stoneIndex: number }` | Vektor výstrelu |
| `stones_stopped` | `{ positions: StonePosition[] }` | Klient potvrdí, že všetky kamene stoja |
| `pause` | `{}` | Žiadosť o pauzu |
| `unpause` | `{}` | Zrušenie pauzy |
| `restart_request` | `{}` | Žiadosť o reštart |
| `restart_accept` | `{}` | Súhlas s reštartom |

**Server → Klient:**
| Správa | Payload | Popis |
|---|---|---|
| `waiting` | `{}` | Čakanie na druhého hráča |
| `game_start` | `{ config, playerIndex, opponent, roomId }` | Hra začína |
| `opponent_shot` | `{ forceX, forceY, stoneIndex }` | Výstrel súpera na simuláciu |
| `turn_change` | `{ activePlayer: 0\|1, stonesLeft }` | Zmena ťahu |
| `game_over` | `{ winner, distances }` | Koniec hry s výsledkami |
| `paused` | `{ by: string }` | Hra pozastavená |
| `unpaused` | `{}` | Hra pokračuje |
| `restart_requested` | `{ by: string }` | Súper žiada reštart |
| `game_restarted` | `{ config }` | Nová hra začína |
| `opponent_disconnected` | `{}` | Súper sa odpojil |
| `error` | `{ message: string }` | Chybová správa |

### 6.3 Herný Cyklus (Game Loop)

```
1. Obaja hráči sa pripoja → server vytvorí room
2. Server pošle `game_start` s konfiguráciou a priradením hráča (0 alebo 1)
3. Hráč na ťahu (0 začína):
   a. Klikne na kameň → ťahá myšou → zobrazí sa šípka smeru/sily
   b. Uvoľní myš → klient pošle `shoot` s vektorom sily
   c. Server prepošle `opponent_shot` druhému klientovi
   d. Obaja klienti simulujú fyziku s rovnakými parametrami
   e. Keď kamene zastanú → klient pošle `stones_stopped`
   f. Server (keď obaja potvrdia) pošle `turn_change`
4. Opakuje sa kým nie sú všetky kamene odhodené
5. Server vypočíta vzdialenosti → pošle `game_over`
6. Výsledok sa uloží do DB
```

---

## 7. Štruktúra Projektu

```
zadanie3/
├── client/                          # Frontend (Vite + React + TS)
│   ├── public/
│   │   └── game-config.json         # Externá herná konfigurácia
│   ├── src/
│   │   ├── main.tsx                 # Entry point
│   │   ├── App.tsx                  # Root komponent + routing
│   │   ├── index.css                # Tailwind + custom properties
│   │   │
│   │   ├── components/
│   │   │   ├── ui/                  # shadcn/ui komponenty
│   │   │   │   ├── button.tsx
│   │   │   │   ├── card.tsx
│   │   │   │   ├── dialog.tsx
│   │   │   │   ├── input.tsx
│   │   │   │   ├── badge.tsx
│   │   │   │   └── toast.tsx
│   │   │   │
│   │   │   ├── MainMenu.tsx         # Úvodná obrazovka (Nová hra, Pravidlá, Štatistiky)
│   │   │   ├── Lobby.tsx            # Prihlásenie menom + čakanie na súpera
│   │   │   ├── GameCanvas.tsx       # Canvas rendering + Matter.js integrácia
│   │   │   ├── GameHUD.tsx          # Overlay — skóre, ťah, pauza, timer
│   │   │   ├── AimingIndicator.tsx  # Šípka/čiara smeru a sily (Canvas overlay)
│   │   │   ├── RulesDialog.tsx      # Pravidlá hry (Dialog)
│   │   │   ├── GameOverDialog.tsx   # Výsledková obrazovka
│   │   │   ├── PauseOverlay.tsx     # Pauza overlay
│   │   │   └── StatsPage.tsx        # Tabuľka výsledkov z DB
│   │   │
│   │   ├── game/
│   │   │   ├── PhysicsEngine.ts     # Matter.js wrapper — setup, simulácia, trenie
│   │   │   ├── GameState.ts         # Herný stav (kamene, ťahy, skóre)
│   │   │   ├── Renderer.ts          # Canvas 2D renderovanie (plocha, kruhy, kamene)
│   │   │   └── InputHandler.ts      # Mouse eventy — slingshot mechanika
│   │   │
│   │   ├── hooks/
│   │   │   ├── useWebSocket.ts      # WebSocket hook (connect, send, receive)
│   │   │   ├── useGameLoop.ts       # requestAnimationFrame game loop
│   │   │   └── useResponsiveCanvas.ts  # Resize observer pre Canvas
│   │   │
│   │   ├── lib/
│   │   │   ├── ws-client.ts         # WebSocket klient wrapper
│   │   │   ├── config.ts            # Načítanie game-config.json
│   │   │   └── utils.ts             # Pomocné funkcie (vzdialenosť, scaling)
│   │   │
│   │   └── types/
│   │       └── game.ts              # TypeScript typy (GameConfig, Stone, Player, WSMessage)
│   │
│   ├── tailwind.config.ts           # Tailwind konfigurácia + custom farby
│   ├── postcss.config.js
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── package.json
│
├── server/                          # Backend (Node.js)
│   ├── src/
│   │   ├── index.ts                 # Entry — Express + WebSocket server
│   │   ├── websocket/
│   │   │   ├── WebSocketServer.ts   # WS server setup, connection handling
│   │   │   ├── GameRoom.ts          # Herná miestnosť — logika párovania, ťahov
│   │   │   └── RoomManager.ts       # Správa miestností, matchmaking (lobby)
│   │   ├── db/
│   │   │   ├── pool.ts              # PostgreSQL connection pool
│   │   │   ├── schema.sql           # SQL schéma (CREATE TABLE)
│   │   │   └── queries.ts           # DB queries (saveGame, getStats, ...)
│   │   ├── config/
│   │   │   └── game-config.json     # Herná konfigurácia (zdieľaná s klientom)
│   │   └── types/
│   │       └── game.ts              # Zdieľané typy
│   │
│   ├── tsconfig.json
│   └── package.json
│
├── nginx/
│   └── zadanie3.conf                # Nginx konfigurácia (reverse proxy + WS upgrade)
│
├── database/
│   └── dump.sql                     # PostgreSQL dump
│
└── README.md                        # Tento súbor
```

---

## 8. Kľúčové Implementačné Detaily

### 8.1 Canvas Rendering (`Renderer.ts`)

Canvas renderuje:
1. **Pozadie** — teplý krémový odtieň (`#F0EFEA`)
2. **Cieľ** — sústredné kruhy (4 prstence podľa `config.target.rings`) s farbami:
   - Vonkajší: `#EBE9E3` (muted)
   - Stredný: `#D4A27F` (copper)
   - Vnútorný: `#D4713A` (terracotta)
   - Stred: `#CF222E` (bullseye)
3. **Kamene** — kruhy s tieňom, farebne rozlíšené:
   - Hráč 1: `#D4713A` (terracotta) s `#B85A2A` okrajom
   - Hráč 2: `#1A72C7` (modrá) s `#145DA0` okrajom
4. **Aiming šípka** — čiara od kamena ku kurzoru so šípkou, hrúbka podľa sily
5. **Okraje plochy** — jemný border `#DEDEDE`

### 8.2 Matter.js Fyzika (`PhysicsEngine.ts`)

```typescript
// Pseudo-kód nastavenia
const engine = Matter.Engine.create();
engine.gravity.y = 0; // top-down pohľad, žiadna gravitácia

// Kameň
const stone = Matter.Bodies.circle(x, y, radius, {
  friction: config.stones.friction,
  frictionAir: config.stones.frictionAir,
  restitution: config.stones.restitution,
  isStatic: false,
});

// Steny (odrazy)
const walls = [
  Matter.Bodies.rectangle(w/2, 0, w, 10, { isStatic: true, restitution: config.field.wallRestitution }),
  // ... 4 steny
];

// Výstrel — aplikácia sily
Matter.Body.applyForce(stone, stone.position, { x: forceX, y: forceY });

// Detekcia zastavenia — kontrola každých 100ms
// Ak velocity < threshold pre všetky kamene → stones_stopped
```

### 8.3 Slingshot Mechanika (`InputHandler.ts`)

```
1. mousedown na kameň hráča (ak je na ťahu)
   → uložiť počiatočnú pozíciu
2. mousemove
   → počítať vektor (kameň → kurzor)
   → obrátiť smer (hráč ťahá dozadu = výstrel dopredu)
   → clamp silu na maxForce
   → renderovať šípku (smer + hrúbka podľa sily)
3. mouseup
   → odoslať { forceX, forceY, stoneIndex } na server
   → aplikovať silu lokálne
```

### 8.4 Responzívny Canvas (`useResponsiveCanvas.ts`)

```typescript
// Canvas sa škáluje podľa okna prehliadača
// Pomer strán (aspect ratio) je zachovaný podľa config.field
// Všetky pozície sa prepočítavajú cez scale faktor
const scale = Math.min(
  windowWidth / config.field.width,
  windowHeight / config.field.height
);
```

### 8.5 WebSocket Synchronizácia

**Princíp:** Deterministická simulácia na oboch klientoch.

1. Klient A vykoná výstrel → pošle vektor serveru
2. Server validuje (je hráč na ťahu?) → prepošle klientovi B
3. Obaja klienti aplikujú rovnakú silu na rovnaký kameň
4. Matter.js je deterministický pri rovnakých vstupoch → rovnaký výsledok
5. Po zastavení kameňov → obaja klienti potvrdia → server pokračuje

**Fallback:** Ak sa pozície odchýlia (floating point), server môže periodicky synchronizovať pozície kameňov.

---

## 9. Obrazovky Aplikácie

### 9.1 Hlavné Menu
- Logo / názov hry (serif font, terracotta akcent)
- **[Nová hra]** — primárne tlačidlo (dark pill, `#0E0E0E`)
- **[Pravidlá]** — sekundárne tlačidlo (cream pill s ring shadow)
- **[Štatistiky]** — ghost tlačidlo

### 9.2 Lobby
- Input na meno (shadcn Input, 12px radius)
- **[Pripojiť sa]** tlačidlo
- Čakacia obrazovka s animáciou (pulse badge "Čakám na súpera...")

### 9.3 Herná Plocha
- Canvas (centrovaný, responzívny)
- HUD overlay:
  - Hore: mená hráčov + počet zostávajúcich kameňov (Badge)
  - Indikátor "Tvoj ťah" / "Čakaj na súpera"
  - Tlačidlo pauzy (Lucide `Pause` ikona)

### 9.4 Game Over Dialog
- shadcn Dialog s výsledkami
- Vzdialenosti kameňov od cieľa
- **[Nová hra]** + **[Menu]** tlačidlá

### 9.5 Pauza Overlay
- Polopriehľadný overlay
- "Hra pozastavená" text
- **[Pokračovať]** tlačidlo
- Info kto pozastavil

---

## 10. Tailwind Konfigurácia

```typescript
// tailwind.config.ts
export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        page:       "#F0EFEA",
        card:       "#FAF9F5",
        subtle:     "#F2F0EB",
        muted:      "#EBE9E3",
        accent: {
          DEFAULT:  "#D4713A",
          copper:   "#D4A27F",
          blue:     "#1A72C7",
          "blue-hover": "#3F8FD9",
        },
        text: {
          primary:   "#141413",
          secondary: "#3D3C39",
          muted:     "#737170",
        },
        danger:     "#CF222E",
        btn: {
          dark:     "#0E0E0E",
        },
        player: {
          red:      "#D4713A",
          blue:     "#1A72C7",
        },
      },
      borderRadius: {
        pill: "12px",
      },
      fontFamily: {
        sans:  ["Inter", "system-ui", "sans-serif"],
        serif: ["Georgia", "serif"],
        mono:  ["JetBrains Mono", "monospace"],
      },
      transitionDuration: {
        DEFAULT: "150ms",
      },
      transitionTimingFunction: {
        DEFAULT: "cubic-bezier(0.4, 0, 0.2, 1)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
```

---

## 11. Nginx Konfigurácia

```nginx
# /etc/nginx/sites-available/zadanie3.conf

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
        proxy_pass http://127.0.0.1:3003;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_read_timeout 86400;  # 24h pre dlhé WS spojenia
    }

    # REST API (štatistiky)
    location /zadanie3/api/ {
        proxy_pass http://127.0.0.1:3003/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

---

## 12. Postup Nasadenia na VPS

### 12.1 Príprava servera

```bash
# SSH na VPS
ssh student@node22.webte.fei.stuba.sk

# Overiť Node.js verziu (musí byť 20+)
node --version

# Nainštalovať PM2 (ak ešte nie je)
npm install -g pm2
```

### 12.2 PostgreSQL

```bash
# Pripojiť sa na PostgreSQL
sudo -u postgres psql

# Vytvoriť databázu a používateľa
CREATE DATABASE curling_game;
CREATE USER curling_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE curling_game TO curling_user;
\q

# Importovať schému
psql -U curling_user -d curling_game -f database/dump.sql
```

### 12.3 Build a Deploy

```bash
# Nahrať projekt na server (scp alebo git)
scp -r zadanie3/ student@node22.webte.fei.stuba.sk:/var/www/

# Na serveri:
cd /var/www/zadanie3

# Frontend build
cd client
npm install
npm run build    # výstup v client/dist/

# Backend
cd ../server
npm install
cp .env.example .env   # upraviť DB credentials

# Spustiť server cez PM2
pm2 start dist/index.js --name curling-server
pm2 save
pm2 startup     # auto-start po reštarte servera
```

### 12.4 Nginx

```bash
# Skopírovať konfiguráciu
sudo cp nginx/zadanie3.conf /etc/nginx/sites-available/
sudo ln -s /etc/nginx/sites-available/zadanie3.conf /etc/nginx/sites-enabled/

# Test konfigurácie
sudo nginx -t

# Reload
sudo systemctl reload nginx
```

### 12.5 Overenie

1. Otvoriť `https://node22.webte.fei.stuba.sk/zadanie3` v Chrome
2. Otvoriť rovnakú URL v druhom okne / Firefox
3. Obaja hráči sa prihlásia → server ich spáruje → hra začne

---

## 13. Checklist Požiadaviek

| # | Požiadavka | Status | Implementácia |
|---|---|---|---|
| 1 | WebSocket real-time hra pre 2 hráčov | ⬜ | `ws` + GameRoom |
| 2 | Konfigurácia z JSON súboru | ⬜ | `game-config.json` |
| 3 | Canvas API rendering | ⬜ | `Renderer.ts` |
| 4 | Farebne vyznačený cieľ (sústredné kruhy) | ⬜ | `Renderer.ts` — 4 prstence |
| 5 | Farebne odlíšené kamene | ⬜ | Terracotta vs. Modrá |
| 6 | Responzívna hracia plocha | ⬜ | `useResponsiveCanvas.ts` |
| 7 | Mechanika praku (klik + ťah + uvoľnenie) | ⬜ | `InputHandler.ts` |
| 8 | Vizuálna pomôcka (šípka smeru/sily) | ⬜ | `AimingIndicator.tsx` |
| 9 | Trenie — kamene zastanú | ⬜ | `frictionAir` v Matter.js |
| 10 | Kolízie kruh-kruh | ⬜ | Matter.js built-in |
| 11 | Odrazy od okrajov | ⬜ | Static wall bodies |
| 12 | Striedanie hráčov | ⬜ | `GameRoom.ts` — turn logic |
| 13 | Ďalší hráč čaká na zastavenie | ⬜ | `stones_stopped` event |
| 14 | Určenie víťaza (najbližší kameň k cieľu) | ⬜ | Euklidovská vzdialenosť |
| 15 | Zobrazenie výsledku obom hráčom | ⬜ | `GameOverDialog.tsx` |
| 16 | Prihlásenie / lobby | ⬜ | `Lobby.tsx` + `RoomManager.ts` |
| 17 | Hlavné menu | ⬜ | `MainMenu.tsx` |
| 18 | Pauza | ⬜ | `PauseOverlay.tsx` |
| 19 | Reštart (vzájomný súhlas) | ⬜ | `restart_request` / `restart_accept` |
| 20 | Odpojenie hráča — korektné ukončenie | ⬜ | `opponent_disconnected` event |
| 21 | Server = autorita (striedanie, udalosti) | ⬜ | `GameRoom.ts` |
| 22 | Klient posiela vektor výstrelu | ⬜ | `shoot` message |
| 23 | Rovnaká simulácia na oboch klientoch | ⬜ | Deterministický Matter.js |
| 24 | Grafický vzhľad | ⬜ | Claude Code design system |
| 25 | PostgreSQL štatistiky | ⬜ | `StatsPage.tsx` + REST API |

---

## 14. Dodatočne Nainštalované Systémové Balíky

| Balík | Dôvod |
|---|---|
| `pm2` | Process manager pre Node.js |
| *(prípadne doplniť pri nasadení)* | — |

---

## 15. Použité Frameworky a Knižnice

### Frontend
- React 18, TypeScript, Vite
- Tailwind CSS v3, tailwindcss-animate
- shadcn/ui (Radix UI primitívy): Button, Card, Dialog, Input, Badge, Toast
- Lucide React (ikony)
- Matter.js (fyzikálny engine)

### Backend
- Node.js 20+, TypeScript
- Express (HTTP + statické súbory)
- ws (WebSocket)
- pg (PostgreSQL klient)
- dotenv

---

## 16. Odhad Časovej Náročnosti

| Fáza | Čas |
|---|---|
| Setup projektu (Vite, Tailwind, shadcn, Node) | 2–3 h |
| Canvas rendering + Matter.js fyzika | 6–8 h |
| Slingshot mechanika + aiming | 3–4 h |
| WebSocket server + GameRoom logika | 4–6 h |
| UI obrazovky (Menu, Lobby, HUD, GameOver) | 3–4 h |
| Styling podľa design systému | 2–3 h |
| PostgreSQL integrácia + štatistiky | 2–3 h |
| Nasadenie na VPS + Nginx | 2–3 h |
| Testovanie + ladenie | 3–4 h |
| **Celkom** | **~27–38 h** |
