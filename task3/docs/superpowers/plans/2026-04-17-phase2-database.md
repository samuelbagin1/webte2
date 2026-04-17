# Phase 2 — Database Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create the PostgreSQL schema, connection pool, and typed query functions for the curling game server.

**Architecture:** Three focused files — `schema.sql` defines the DDL, `pool.ts` exports a singleton `pg.Pool` (reads `.env`), `queries.ts` exports typed async functions that use the pool. `database/dump.sql` mirrors the schema for VPS import.

**Tech Stack:** Node.js 20+, TypeScript (ESM), `pg` 8.x, `dotenv` 17.x

---

### Task 1: SQL Schema

**Files:**
- Create: `server/src/db/schema.sql`

- [ ] **Step 1: Write schema.sql**

```sql
-- server/src/db/schema.sql
CREATE TABLE IF NOT EXISTS players (
    id         SERIAL PRIMARY KEY,
    nickname   VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS games (
    id          SERIAL PRIMARY KEY,
    player1_id  INTEGER REFERENCES players(id),
    player2_id  INTEGER REFERENCES players(id),
    winner_id   INTEGER REFERENCES players(id),
    status      VARCHAR(20) DEFAULT 'in_progress',
    config      JSONB NOT NULL,
    started_at  TIMESTAMP DEFAULT NOW(),
    finished_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS throws (
    id          SERIAL PRIMARY KEY,
    game_id     INTEGER REFERENCES games(id) ON DELETE CASCADE,
    player_id   INTEGER REFERENCES players(id),
    throw_order INTEGER NOT NULL,
    force_x     FLOAT NOT NULL,
    force_y     FLOAT NOT NULL,
    created_at  TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_games_status  ON games(status);
CREATE INDEX IF NOT EXISTS idx_games_players ON games(player1_id, player2_id);
CREATE INDEX IF NOT EXISTS idx_throws_game   ON throws(game_id);
```

- [ ] **Step 2: Apply schema locally**

```bash
psql -U curling_user -d curling_game -f server/src/db/schema.sql
```
Expected: `CREATE TABLE`, `CREATE TABLE`, `CREATE TABLE`, `CREATE INDEX` × 3

- [ ] **Step 3: Commit**

```bash
git add server/src/db/schema.sql
git commit -m "feat(db): add PostgreSQL schema — players, games, throws"
```

---

### Task 2: Connection Pool

**Files:**
- Create: `server/src/db/pool.ts`

- [ ] **Step 1: Write pool.ts**

```typescript
// server/src/db/pool.ts
import 'dotenv/config';
import pg from 'pg';

const { Pool } = pg;

const pool = new Pool({
  host:     process.env.DB_HOST     ?? 'localhost',
  port:     Number(process.env.DB_PORT ?? 5432),
  user:     process.env.DB_USER     ?? 'curling_user',
  password: process.env.DB_PASSWORD ?? '',
  database: process.env.DB_NAME     ?? 'curling_game',
});

export default pool;
```

- [ ] **Step 2: Verify compile**

```bash
cd server && npx tsc --noEmit
```
Expected: no errors

- [ ] **Step 3: Smoke-test pool import**

Add a temporary check to `server/src/index.ts`:
```typescript
import pool from './db/pool.js';
pool.query('SELECT 1').then(() => console.log('DB ok')).catch(console.error);
export {};
```
Run: `cd server && npm run dev`
Expected: `DB ok` printed, no errors. Then revert `index.ts` back to placeholder.

- [ ] **Step 4: Revert index.ts**

```typescript
// server/src/index.ts
export {};
```

- [ ] **Step 5: Commit**

```bash
git add server/src/db/pool.ts server/src/index.ts
git commit -m "feat(db): add pg connection pool"
```

---

### Task 3: Query Functions

**Files:**
- Create: `server/src/db/queries.ts`

- [ ] **Step 1: Write queries.ts**

```typescript
// server/src/db/queries.ts
import pool from './pool.js';

export interface PlayerRow {
  id: number;
  nickname: string;
  created_at: Date;
}

export interface GameRow {
  id: number;
  player1_id: number;
  player2_id: number;
  winner_id: number | null;
  status: string;
  config: Record<string, unknown>;
  started_at: Date;
  finished_at: Date | null;
}

export interface GameStatRow {
  id: number;
  player1: string;
  player2: string;
  winner: string | null;
  status: string;
  started_at: Date;
  finished_at: Date | null;
}

/** Upsert a player by nickname; returns existing row if nickname already exists. */
export async function savePlayers(nicknames: [string, string]): Promise<[PlayerRow, PlayerRow]> {
  const upsert = async (nickname: string): Promise<PlayerRow> => {
    const { rows } = await pool.query<PlayerRow>(
      `INSERT INTO players (nickname) VALUES ($1)
       ON CONFLICT DO NOTHING
       RETURNING *`,
      [nickname],
    );
    if (rows.length) return rows[0];
    const { rows: existing } = await pool.query<PlayerRow>(
      'SELECT * FROM players WHERE nickname = $1',
      [nickname],
    );
    return existing[0];
  };
  return Promise.all(nicknames.map(upsert)) as Promise<[PlayerRow, PlayerRow]>;
}

/** Create a new game record and return its id. */
export async function saveGame(
  player1Id: number,
  player2Id: number,
  config: Record<string, unknown>,
): Promise<number> {
  const { rows } = await pool.query<{ id: number }>(
    `INSERT INTO games (player1_id, player2_id, config) VALUES ($1, $2, $3) RETURNING id`,
    [player1Id, player2Id, JSON.stringify(config)],
  );
  return rows[0].id;
}

/** Mark a game as completed and record the winner. */
export async function finishGame(
  gameId: number,
  winnerId: number,
): Promise<void> {
  await pool.query(
    `UPDATE games SET status = 'completed', winner_id = $1, finished_at = NOW() WHERE id = $2`,
    [winnerId, gameId],
  );
}

/** Mark a game as abandoned (disconnect / forfeit). */
export async function abandonGame(gameId: number): Promise<void> {
  await pool.query(
    `UPDATE games SET status = 'abandoned', finished_at = NOW() WHERE id = $1`,
    [gameId],
  );
}

/** Record a single throw. */
export async function saveThrow(
  gameId: number,
  playerId: number,
  throwOrder: number,
  forceX: number,
  forceY: number,
): Promise<void> {
  await pool.query(
    `INSERT INTO throws (game_id, player_id, throw_order, force_x, force_y)
     VALUES ($1, $2, $3, $4, $5)`,
    [gameId, playerId, throwOrder, forceX, forceY],
  );
}

/** Return all completed games with player nicknames for the stats page. */
export async function getStats(): Promise<GameStatRow[]> {
  const { rows } = await pool.query<GameStatRow>(`
    SELECT
      g.id,
      p1.nickname  AS player1,
      p2.nickname  AS player2,
      pw.nickname  AS winner,
      g.status,
      g.started_at,
      g.finished_at
    FROM games g
    JOIN players p1 ON p1.id = g.player1_id
    JOIN players p2 ON p2.id = g.player2_id
    LEFT JOIN players pw ON pw.id = g.winner_id
    WHERE g.status IN ('completed', 'abandoned')
    ORDER BY g.started_at DESC
    LIMIT 50
  `);
  return rows;
}
```

- [ ] **Step 2: Verify compile**

```bash
cd server && npx tsc --noEmit
```
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add server/src/db/queries.ts
git commit -m "feat(db): add typed query functions — savePlayers, saveGame, saveThrow, getStats"
```

---

### Task 4: Deployment Dump

**Files:**
- Create: `database/dump.sql`

- [ ] **Step 1: Copy schema to dump.sql**

`database/dump.sql` is the file imported on the VPS (`psql ... -f database/dump.sql`).
It should be identical to `schema.sql` but with a header comment:

```sql
-- database/dump.sql
-- PostgreSQL schema dump for curling game
-- Import: psql -U curling_user -d curling_game -f database/dump.sql

CREATE TABLE IF NOT EXISTS players (
    id         SERIAL PRIMARY KEY,
    nickname   VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS games (
    id          SERIAL PRIMARY KEY,
    player1_id  INTEGER REFERENCES players(id),
    player2_id  INTEGER REFERENCES players(id),
    winner_id   INTEGER REFERENCES players(id),
    status      VARCHAR(20) DEFAULT 'in_progress',
    config      JSONB NOT NULL,
    started_at  TIMESTAMP DEFAULT NOW(),
    finished_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS throws (
    id          SERIAL PRIMARY KEY,
    game_id     INTEGER REFERENCES games(id) ON DELETE CASCADE,
    player_id   INTEGER REFERENCES players(id),
    throw_order INTEGER NOT NULL,
    force_x     FLOAT NOT NULL,
    force_y     FLOAT NOT NULL,
    created_at  TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_games_status  ON games(status);
CREATE INDEX IF NOT EXISTS idx_games_players ON games(player1_id, player2_id);
CREATE INDEX IF NOT EXISTS idx_throws_game   ON throws(game_id);
```

- [ ] **Step 2: Commit**

```bash
git add database/dump.sql
git commit -m "feat(db): add database/dump.sql for VPS import"
```
