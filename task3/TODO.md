# TODO — Zadanie č.3: Online Curling Game

> Tracking implementation progress. Check items as you complete them.
> Full spec: [README.md](README.md)

---

## Phase 1 — Project Setup

- [ ] Init Vite + React + TypeScript (`client/`)
- [ ] Configure Tailwind CSS v3 + custom design tokens ([README §3](README.md))
- [ ] Install & configure shadcn/ui (Button, Card, Dialog, Input, Badge, Toast)
- [ ] Install Lucide React, Matter.js
- [ ] Init Node.js + TypeScript backend (`server/`)
- [ ] Install Express, ws, pg, dotenv
- [ ] Create `tsconfig.json` for both client and server
- [ ] Create `client/public/game-config.json` with initial values ([README §4](README.md))
- [ ] Create `.env.example` for DB credentials

---

## Phase 2 — Database

- [ ] Write `server/src/db/schema.sql` — tables: `players`, `games`, `throws` + indexes ([README §5](README.md))
- [ ] Write `server/src/db/pool.ts` — PostgreSQL connection pool
- [ ] Write `server/src/db/queries.ts` — `saveGame`, `getStats`, `savePlayers`, `saveThrow`
- [ ] Create `database/dump.sql` from schema
- [ ] Test DB connection locally

---

## Phase 3 — Backend / WebSocket Server

- [ ] Write `server/src/index.ts` — Express HTTP server setup
- [ ] Write `server/src/websocket/WebSocketServer.ts` — WS server, connection handler
- [ ] Write `server/src/websocket/RoomManager.ts` — matchmaking lobby, waiting queue
- [ ] Write `server/src/websocket/GameRoom.ts`:
  - [ ] Player pairing + `game_start` broadcast
  - [ ] Turn management (`activePlayer`, `stonesLeft`)
  - [ ] Handle `shoot` → validate → broadcast `opponent_shot`
  - [ ] Handle `stones_stopped` from both clients → send `turn_change`
  - [ ] End-of-game detection → calculate distances → send `game_over`
  - [ ] Handle `pause` / `unpause`
  - [ ] Handle `restart_request` / `restart_accept`
  - [ ] Handle `opponent_disconnected` on WS close
- [ ] REST endpoint `GET /api/stats` for leaderboard / history
- [ ] Save game results to PostgreSQL on `game_over`
- [ ] Write shared `server/src/types/game.ts`

---

## Phase 4 — Frontend: Core Infrastructure

- [ ] Write `client/src/types/game.ts` — `GameConfig`, `Stone`, `Player`, `WSMessage`
- [ ] Write `client/src/lib/config.ts` — load & parse `game-config.json`
- [ ] Write `client/src/lib/ws-client.ts` — WebSocket client wrapper (connect, send, close)
- [ ] Write `client/src/lib/utils.ts` — distance helpers, coordinate scaling
- [ ] Write `client/src/hooks/useWebSocket.ts` — connect, send, receive, reconnect logic
- [ ] Write `client/src/hooks/useGameLoop.ts` — `requestAnimationFrame` loop
- [ ] Write `client/src/hooks/useResponsiveCanvas.ts` — ResizeObserver, scale factor
- [ ] Write `client/src/App.tsx` — root component + screen routing (menu → lobby → game → stats)

---

## Phase 5 — Frontend: Game Engine

- [ ] Write `client/src/game/PhysicsEngine.ts`:
  - [ ] Matter.js engine setup (gravity = 0, top-down view)
  - [ ] Stone body creation (circle, friction, frictionAir, restitution)
  - [ ] Static wall bodies with wall restitution
  - [ ] `applyForce` for shooting
  - [ ] Stopped-detection loop (velocity < threshold every 100ms)
- [ ] Write `client/src/game/GameState.ts`:
  - [ ] Stone positions, player index, turn state
  - [ ] Stones remaining per player
  - [ ] Score / distance tracking
- [ ] Write `client/src/game/Renderer.ts`:
  - [ ] Draw background (`#F0EFEA`)
  - [ ] Draw target — 4 concentric rings (muted → copper → terracotta → bullseye)
  - [ ] Draw stones — terracotta (P1) vs blue (P2), with border + shadow
  - [ ] Draw aiming arrow — direction line, thickness by force
  - [ ] Draw field border (`#DEDEDE`)
- [ ] Write `client/src/game/InputHandler.ts`:
  - [ ] `mousedown` on player's own stone (only if player's turn)
  - [ ] `mousemove` — compute drag vector, reverse for slingshot direction, clamp to maxForce
  - [ ] `mouseup` — fire `shoot` event with `{ forceX, forceY, stoneIndex }`

---

## Phase 6 — Frontend: UI Screens

- [ ] `client/src/components/MainMenu.tsx` — logo, New Game, Rules, Statistics buttons
- [ ] `client/src/components/Lobby.tsx` — nickname input, connect button, waiting animation
- [ ] `client/src/components/GameCanvas.tsx` — canvas element, PhysicsEngine + Renderer integration
- [ ] `client/src/components/GameHUD.tsx` — player names, stones remaining (Badge), turn indicator, pause button
- [ ] `client/src/components/AimingIndicator.tsx` — canvas overlay for slingshot arrow
- [ ] `client/src/components/RulesDialog.tsx` — rules text in shadcn Dialog
- [ ] `client/src/components/GameOverDialog.tsx` — winner, stone distances, New Game / Menu buttons
- [ ] `client/src/components/PauseOverlay.tsx` — semi-transparent overlay, who paused, Resume button
- [ ] `client/src/components/StatsPage.tsx` — table of past games from REST API
- [ ] Wire all shadcn/ui components in `components/ui/`

---

## Phase 7 — Deployment

- [ ] Write `nginx/zadanie3.conf` — static files, WS upgrade, API proxy ([README §11](README.md))
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
| 1 | WebSocket real-time game for 2 players | ⬜ |
| 2 | Configuration from JSON file | ⬜ |
| 3 | Canvas API rendering | ⬜ |
| 4 | Color-coded target (concentric rings) | ⬜ |
| 5 | Color-coded stones per player | ⬜ |
| 6 | Responsive game field | ⬜ |
| 7 | Slingshot mechanics (click + drag + release) | ⬜ |
| 8 | Visual aiming aid (direction/force arrow) | ⬜ |
| 9 | Friction — stones come to rest | ⬜ |
| 10 | Circle-circle collisions | ⬜ |
| 11 | Wall bounces | ⬜ |
| 12 | Turn alternation | ⬜ |
| 13 | Waiting player blocked until stones stop | ⬜ |
| 14 | Winner = closest stone to target | ⬜ |
| 15 | Show result to both players | ⬜ |
| 16 | Login / lobby | ⬜ |
| 17 | Main menu | ⬜ |
| 18 | Pause | ⬜ |
| 19 | Restart (mutual consent) | ⬜ |
| 20 | Disconnect — clean game end | ⬜ |
| 21 | Server is authority (turns, events) | ⬜ |
| 22 | Client sends shot vector | ⬜ |
| 23 | Identical simulation on both clients | ⬜ |
| 24 | Visual design | ⬜ |
| 25 | PostgreSQL statistics | ⬜ |

---

## Notes

- Matter.js is deterministic at equal inputs — both clients run the same simulation independently (no state sync needed per frame)
- `stones_stopped` must be sent by **both** clients before the server advances the turn
- Stone coordinates in `game-config.json` use relative (0–1) values for responsiveness
- Design system: warm cream background, terracotta accent — see [README §3](README.md) for full color palette
