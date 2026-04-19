# Curling Game — Client (Frontend)

React + TypeScript + Vite frontend for the [WEBTE2 zadanie č.3](../README.md) online curling game. Renders the game on Canvas 2D, runs Matter.js physics locally, and synchronizes turns with the backend over raw WebSockets.

> Full project overview, protocol, and deployment notes are in the [root README](../README.md). This file focuses on the `client/` subfolder.

---

## 1. Tech stack

| | |
|---|---|
| Build tool | Vite 8 + `@vitejs/plugin-react` |
| UI | React 19 + TypeScript 6 |
| Styling | Tailwind CSS 3.4 + `tailwindcss-animate` |
| Components | shadcn/ui (Radix UI primitives) — `Button`, `Card`, `Dialog`, `Input`, `Badge`, `Toast` |
| Icons | `lucide-react` |
| Physics | `matter-js` 0.20 |
| Rendering | Canvas 2D API |

No client-side routing library — screen navigation is a single `useState` state machine in [`src/App.tsx`](src/App.tsx).

---

## 2. Scripts

```bash
npm install         # install dependencies
npm run dev         # Vite dev server on :5173 with HMR
npm run build       # tsc -b && vite build   → dist/
npm run preview     # preview the production build
npm run lint        # ESLint
```

The `build` script type-checks first (`tsc -b`) — TS errors fail the build.

---

## 3. Environment

The backend URL is configured via a Vite env var (used by [`vite.config.ts`](vite.config.ts) to set up dev proxies for `/api` and `/ws`):

```bash
VITE_BACKEND_URL=http://localhost:3001   # default
```

Under `docker compose up`, this is set to `http://server:3001` so the Vite dev server proxies correctly inside the compose network.

The WebSocket URL the client opens is derived from the current page origin — in dev it hits `ws://localhost:5173/ws` (proxied to the backend), in production it hits `wss://…/zadanie3/ws` (proxied by Nginx, see [`../nginx/zadanie3.conf`](../nginx/zadanie3.conf)).

---

## 4. Source layout

```
src/
├── main.tsx                    # React entry point
├── App.tsx                     # Root — screen state machine + WS session orchestration
├── index.css                   # Tailwind directives + base reset
│
├── components/
│   ├── ui/                     # shadcn/ui primitives (badge, button, card, dialog, input, toast, toaster)
│   ├── MainMenu.tsx            # Landing screen — Play, Rules, Stats
│   ├── Lobby.tsx               # Nickname input + connection status + waiting state
│   ├── GameCanvas.tsx          # Canvas host — wires PhysicsEngine + GameState + Renderer + InputHandler
│   ├── GameHUD.tsx             # Overlay — players, stones remaining, turn indicator, pause button
│   ├── RulesDialog.tsx         # Modal with hardcoded rules
│   ├── GameOverDialog.tsx      # Result + closest-stone distances + next-step buttons
│   ├── PauseOverlay.tsx        # Pause + mutual-consent restart flow
│   └── StatsPage.tsx           # Table fed by GET /api/stats
│
├── game/
│   ├── PhysicsEngine.ts        # Matter.js wrapper — bodies, forces, stop detection
│   ├── GameState.ts            # FSM: idle → waiting → aiming → sliding → stopped
│   ├── Renderer.ts             # Canvas 2D draw — background, target rings, stones, aim arrow
│   └── InputHandler.ts         # Slingshot mechanic — mousedown/move/up with clamped force
│
├── hooks/
│   ├── useWebSocket.ts         # Wraps WSClient, exposes { status, send, disconnect }
│   ├── useGameLoop.ts          # requestAnimationFrame loop with delta-time
│   └── useResponsiveCanvas.ts  # ResizeObserver + HiDPI-aware scale (cssScale × dpr)
│
├── lib/
│   ├── config.ts               # fetch + cache /game-config.json
│   ├── ws-client.ts            # WSClient class — connect, send, onMessage, onStatusChange
│   └── utils.ts                # distancePx, normalizedToCanvas, canvasToNormalized, clampForce
│
└── types/
    └── game.ts                 # GameConfig, Stone, Player, C2SMessage, S2CMessage
```

### Screen flow

`App.tsx` holds `screen: 'menu' | 'lobby' | 'game' | 'stats'`. Navigation is pure state transitions — no router. `MainMenu` → `Lobby` → `GameCanvas + GameHUD` → `GameOverDialog` → back to `MainMenu`. `StatsPage` is reachable from the menu.

---

## 5. How the game pieces plug together

```
useWebSocket ─── send/receive ───┐
                                 │
                                 ▼
        GameCanvas (React component)
        ├─ useResponsiveCanvas  → cssScale + renderScale (HiDPI)
        ├─ PhysicsEngine        ← applyForce, step, checkStopped
        ├─ GameState (FSM)      ← phase, activePlayer, stones, throwsRemaining
        ├─ Renderer             ← draws each frame from GameState
        └─ InputHandler         → mouse events → shoot C2SMessage
```

Per frame (inside `useGameLoop`):

1. `PhysicsEngine.step(delta)` advances Matter.js.
2. `GameState.syncPositions(...)` reads stone positions back.
3. `PhysicsEngine.checkStopped(now)` — every 50 ms samples displacement; if max displacement < 0.5 px, marks sliding as over.
4. While sliding, the active player also sends `positions_update` throttled to ~33 ms so the opponent sees smooth movement.
5. `Renderer.draw(state, renderScale, aim)` redraws the canvas.

On the other side of the wire: `GameCanvas` handles incoming `opponent_shot` by applying the same force to the same stone index (Matter.js is deterministic given identical inputs), and handles `turn_change` by applying the server's authoritative positions before unlocking input for the next player.

---

## 6. Game configuration

The single source of truth is [`public/game-config.json`](public/game-config.json) — served statically by Vite (and by Nginx in production). The **server** also reads the same file via a relative path (`../../client/public/game-config.json`), so tuning the physics or layout is a one-file change that both sides pick up.

Key fields ([see root README §4](../README.md#4-herný-konfiguračný-súbor) for full schema):

- `stones.perPlayer`, `stones.radius`, `stones.friction*`, `stones.restitution`
- `target.x`, `target.y` (normalized 0–1) + `target.rings` (ring radii)
- `field.width`, `field.height` (logical px; canvas scales responsively)
- `shot.maxForce`, `shot.forceMultiplier`
- `physics.stoppedVelocityThreshold`, `physics.checkInterval`

---

## 7. Styling

Tailwind config extends the default theme with the project's design tokens (cream backgrounds, terracotta + blue accents, Inter + Georgia fonts, 12 px pill radius). See [`tailwind.config.ts`](tailwind.config.ts) and [root README §3](../README.md#3-dizajnový-systém).

---

## 8. Docker

[`Dockerfile`](Dockerfile) builds a lightweight Node image that runs `npm run dev` — used by [`../docker-compose.yml`](../docker-compose.yml) with bind mounts for HMR. For production, build locally with `npm run build` and serve `dist/` as static files via Nginx.

---

## 9. Notes

- The pipeline is build-time type-checked (`tsc -b`), but no unit/integration tests are configured.
- Dead imports/components: `ui/card.tsx`, `ui/toast.tsx`, `ui/toaster.tsx` are installed but currently unused — kept for future screens.
- `ui/button.tsx` is installed but the current UI uses plain Tailwind-styled `<button>` elements where a `Button` component would otherwise apply. Safe to consolidate later if desired.
