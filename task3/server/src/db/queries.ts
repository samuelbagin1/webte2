import type { RowDataPacket, ResultSetHeader } from 'mysql2';
import pool from './pool.js';

export interface PlayerRow extends RowDataPacket {
  id: number;
  nickname: string;
  created_at: Date;
}

export interface GameStatRow extends RowDataPacket {
  id: number;
  player1: string;
  player2: string;
  winner: string | null;
  status: string;
  started_at: Date;
  finished_at: Date | null;
}

async function upsertPlayer(nickname: string): Promise<PlayerRow> {
  await pool.query('INSERT IGNORE INTO players (nickname) VALUES (?)', [nickname]);
  const [rows] = await pool.query<PlayerRow[]>(
    'SELECT * FROM players WHERE nickname = ?',
    [nickname],
  );
  return rows[0];
}

export async function savePlayers(nicknames: [string, string]): Promise<[PlayerRow, PlayerRow]> {
  return Promise.all(nicknames.map(upsertPlayer)) as Promise<[PlayerRow, PlayerRow]>;
}

export async function saveGame(
  player1Id: number,
  player2Id: number,
  config: Record<string, unknown>,
): Promise<number> {
  const [result] = await pool.query<ResultSetHeader>(
    'INSERT INTO games (player1_id, player2_id, config) VALUES (?, ?, ?)',
    [player1Id, player2Id, JSON.stringify(config)],
  );
  return result.insertId;
}

export async function finishGame(gameId: number, winnerId: number): Promise<void> {
  await pool.query(
    `UPDATE games SET status = 'completed', winner_id = ?, finished_at = NOW() WHERE id = ?`,
    [winnerId, gameId],
  );
}

export async function abandonGame(gameId: number): Promise<void> {
  await pool.query(
    `UPDATE games SET status = 'abandoned', finished_at = NOW() WHERE id = ?`,
    [gameId],
  );
}

export async function saveThrow(
  gameId: number,
  playerId: number,
  throwOrder: number,
  forceX: number,
  forceY: number,
): Promise<void> {
  await pool.query(
    'INSERT INTO throws (game_id, player_id, throw_order, force_x, force_y) VALUES (?, ?, ?, ?, ?)',
    [gameId, playerId, throwOrder, forceX, forceY],
  );
}

export async function getStats(): Promise<GameStatRow[]> {
  const [rows] = await pool.query<GameStatRow[]>(`
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
