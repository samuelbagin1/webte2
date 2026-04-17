# TODO — Zadanie č.3: Online Curling Game

> Tracking implementation progress. Check items as you complete them.
> Full spec: [README.md](README.md)

---

## Phase 1 — Project Setup

- [x] Init Vite + React + TypeScript (`client/`)
- [x] Configure Tailwind CSS v3 + custom design tokens ([README §3](README.md))
- [x] Install & configure shadcn/ui (Button, Card, Dialog, Input, Badge, Toast)
- [x] Install Lucide React, Matter.js
- [x] Init Node.js + TypeScript backend (`server/`)
- [x] Install Express, ws, pg, dotenv
- [x] Create `tsconfig.json` for both client and server
- [x] Create `client/public/game-config.json` with initial values ([README §4](README.md))
- [x] Create `.env.example` for DB credentials

---

## Phase 2 — Database

- [x] Write `server/src/db/schema.sql` — tables: `players`, `games`, `throws` + indexes ([README §5](README.md))
- [x] Write `server/src/db/pool.ts` — PostgreSQL connection pool
- [x] Write `server/src/db/queries.ts` — `saveGame`, `getStats`, `savePlayers`, `saveThrow`
- [x] Create `database/dump.sql` from schema
- [ ] Test DB connection locally

---

## Phase 3 — Backend / WebSocket Server

- [x] Write `server/src/index.ts` — Express HTTP server setup
- [x] Write `server/src/websocket/WebSocketServer.ts` — WS server, connection handler
- [x] Write `server/src/websocket/RoomManager.ts` — matchmaking lobby, waiting queue
- [x] Write `server/src/websocket/GameRoom.ts`:
  - [x] Player pairing + `game_start` broadcast
  - [x] Turn management (`activePlayer`, `stonesLeft`)
  - [x] Handle `shoot` → validate → broadcast `opponent_shot`
  - [x] Handle `stones_stopped` from both clients → send `turn_change`
  - [x] End-of-game detection → calculate distances → send `game_over`
  - [x] Handle `pause` / `unpause`
  - [x] Handle `restart_request` / `restart_accept`
  - [x] Handle `opponent_disconnected` on WS close
- [x] REST endpoint `GET /api/stats` for leaderboard / history
- [x] Save game results to PostgreSQL on `game_over`
- [x] Write shared `server/src/types/game.ts`

---

## Phase 4 — Frontend: Core Infrastructure

- [x] Write `client/src/types/game.ts` — `GameConfig`, `Stone`, `Player`, `WSMessage`
- [x] Write `client/src/lib/config.ts` — load & parse `game-config.json`
- [x] Write `client/src/lib/ws-client.ts` — WebSocket client wrapper (connect, send, close)
- [x] Write `client/src/lib/utils.ts` — distance helpers, coordinate scaling
- [x] Write `client/src/hooks/useWebSocket.ts` — connect, send, receive, reconnect logic
- [x] Write `client/src/hooks/useGameLoop.ts` — `requestAnimationFrame` loop
- [x] Write `client/src/hooks/useResponsiveCanvas.ts` — ResizeObserver, scale factor
- [x] Write `client/src/App.tsx` — root component + screen routing (menu → lobby → game → stats)

---

## Phase 5 — Frontend: Game Engine

- [x] Write `client/src/game/PhysicsEngine.ts`:
  - [x] Matter.js engine setup (gravity = 0, top-down view)
  - [x] Stone body creation (circle, friction, frictionAir, restitution)
  - [x] Static wall bodies with wall restitution
  - [x] `applyForce` for shooting
  - [x] Stopped-detection loop (velocity < threshold every 100ms)
- [x] Write `client/src/game/GameState.ts`:
  - [x] Stone positions, player index, turn state
  - [x] Stones remaining per player
  - [x] Score / distance tracking
- [x] Write `client/src/game/Renderer.ts`:
  - [x] Draw background (`#F0EFEA`)
  - [x] Draw target — 4 concentric rings (muted → copper → terracotta → bullseye)
  - [x] Draw stones — terracotta (P1) vs blue (P2), with border + shadow
  - [x] Draw aiming arrow — direction line, thickness by force
  - [x] Draw field border (`#DEDEDE`)
- [x] Write `client/src/game/InputHandler.ts`:
  - [x] `mousedown` on player's own stone (only if player's turn)
  - [x] `mousemove` — compute drag vector, reverse for slingshot direction, clamp to maxForce
  - [x] `mouseup` — fire `shoot` event with `{ forceX, forceY, stoneIndex }`

---

## Phase 6 — Frontend: UI Screens

- [x] `client/src/components/MainMenu.tsx` — logo, New Game, Rules, Statistics buttons
- [x] `client/src/components/Lobby.tsx` — nickname input, connect button, waiting animation
- [x] `client/src/components/GameCanvas.tsx` — canvas element, PhysicsEngine + Renderer integration
- [x] `client/src/components/GameHUD.tsx` — player names, stones remaining (Badge), turn indicator, pause button
- [x] `client/src/components/AimingIndicator.tsx` — folded into GameCanvas/Renderer (no separate file needed)
- [x] `client/src/components/RulesDialog.tsx` — rules text in shadcn Dialog
- [x] `client/src/components/GameOverDialog.tsx` — winner, stone distances, New Game / Menu buttons
- [x] `client/src/components/PauseOverlay.tsx` — semi-transparent overlay, who paused, Resume button
- [x] `client/src/components/StatsPage.tsx` — table of past games from REST API
- [x] Wire all shadcn/ui components in `components/ui/`

---

## Phase 7 — Deployment

- [x] Write `nginx/zadanie3.conf` — static files, WS upgrade, API proxy ([README §11](README.md))
- [ ] Build frontend: `npm run build` → `client/dist/`
- [ ] Build backend: `tsc` → `server/dist/`
- [ ] Upload to VPS `node22.webte.fei.stuba.sk`
- [ ] Import DB schema on VPS PostgreSQL
- [ ] Start backend with PM2 (`pm2 start dist/index.js --name curling-server`)
- [ ] Enable Nginx config + reload
- [ ] Smoke test: open 2 browser windows → login → play a full game

---

## Requirements Checklist (from README §13)

| # | Requirement | Done |
|---|---|---|
| 1 | WebSocket real-time game for 2 players | ✅ |
| 2 | Configuration from JSON file | ✅ |
| 3 | Canvas API rendering | ✅ |
| 4 | Color-coded target (concentric rings) | ✅ |
| 5 | Color-coded stones per player | ✅ |
| 6 | Responsive game field | ✅ |
| 7 | Slingshot mechanics (click + drag + release) | ✅ |
| 8 | Visual aiming aid (direction/force arrow) | ✅ |
| 9 | Friction — stones come to rest | ✅ |
| 10 | Circle-circle collisions | ✅ |
| 11 | Wall bounces | ✅ |
| 12 | Turn alternation | ✅ |
| 13 | Waiting player blocked until stones stop | ✅ |
| 14 | Winner = closest stone to target | ✅ |
| 15 | Show result to both players | ✅ |
| 16 | Login / lobby | ✅ |
| 17 | Main menu | ✅ |
| 18 | Pause | ✅ |
| 19 | Restart (mutual consent) | ✅ |
| 20 | Disconnect — clean game end | ✅ |
| 21 | Server is authority (turns, events) | ✅ |
| 22 | Client sends shot vector | ✅ |
| 23 | Identical simulation on both clients | ✅ |
| 24 | Visual design | ✅ |
| 25 | PostgreSQL statistics | ✅ |

---

## Notes

- Matter.js is deterministic at equal inputs — both clients run the same simulation independently (no state sync needed per frame)
- `stones_stopped` must be sent by **both** clients before the server advances the turn
- Stone coordinates in `game-config.json` use relative (0–1) values for responsiveness
- Design system: warm cream background, terracotta accent — see [README §3](README.md) for full color palette
