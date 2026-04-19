import WebSocket from 'ws';
import type { C2SMessage, S2CMessage, StonePosition, GameConfig } from '../types/game.js';
import { savePlayers, saveGame, finishGame, abandonGame, saveThrow } from '../db/queries.js';
import { calculateWinner } from '../game/logic.js';

export class GameRoom {
  private sockets: [WebSocket, WebSocket];
  private nicknames: [string, string];
  private config: GameConfig;

  private activePlayer: 0 | 1 = 0;
  private throwsRemaining: [number, number];
  private stoppedReported: Set<0 | 1> = new Set();
  private pausedBy: 0 | 1 | null = null;
  private restartVotes: Set<0 | 1> = new Set();

  private throwOrder = 0;
  private gameId: number | null = null;
  private playerIds: [number, number] | null = null;
  private lastStones: StonePosition[] = [];
  private ended = false;

  constructor(
    sockets: [WebSocket, WebSocket],
    nicknames: [string, string],
    config: GameConfig,
  ) {
    this.sockets = sockets;
    this.nicknames = nicknames;
    this.config = config;
    this.throwsRemaining = [config.stones.perPlayer, config.stones.perPlayer];
    this.attachListeners();
    this.initGame().catch(console.error);
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  private send(ws: WebSocket, msg: S2CMessage): void {
    if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(msg));
  }

  private broadcast(msg: S2CMessage): void {
    this.sockets.forEach(ws => this.send(ws, msg));
  }

  private other(idx: 0 | 1): 0 | 1 {
    return (1 - idx) as 0 | 1;
  }

  // ── Setup ─────────────────────────────────────────────────────────────────

  private attachListeners(): void {
    this.sockets.forEach((ws, i) => {
      ws.on('message', data => {
        if (!this.ended) this.handleMessage(i as 0 | 1, data.toString());
      });
      ws.on('close', () => this.handleDisconnect(i as 0 | 1));
    });
  }

  private async initGame(): Promise<void> {
    const [p1, p2] = await savePlayers(this.nicknames);
    this.playerIds = [p1.id, p2.id];
    this.gameId = await saveGame(
      p1.id,
      p2.id,
      this.config as unknown as Record<string, unknown>,
    );

    this.sockets.forEach((ws, i) => {
      this.send(ws, {
        type: 'game_start',
        playerIndex: i as 0 | 1,
        opponentNickname: this.nicknames[this.other(i as 0 | 1)],
        config: this.config,
        stonesPerPlayer: this.config.stones.perPlayer,
      });
    });

    this.broadcast({
      type: 'turn_change',
      activePlayer: this.activePlayer,
      throwsRemaining: this.throwsRemaining,
    });
  }

  // ── Message dispatch ──────────────────────────────────────────────────────

  private handleMessage(playerIdx: 0 | 1, raw: string): void {
    let msg: C2SMessage;
    try { msg = JSON.parse(raw) as C2SMessage; } catch { return; }

    switch (msg.type) {
      case 'shoot':            return this.handleShoot(playerIdx, msg);
      case 'positions_update': return this.handlePositionsUpdate(playerIdx, msg.stones);
      case 'stones_stopped':   return this.handleStopped(playerIdx, msg.stones);
      case 'pause':            return this.handlePause(playerIdx);
      case 'unpause':          return this.handleUnpause(playerIdx);
      case 'restart_request':  return this.handleRestartRequest(playerIdx);
      case 'restart_accept':   return this.handleRestartAccept(playerIdx);
    }
  }

  // ── Position streaming ────────────────────────────────────────────────────

  private handlePositionsUpdate(playerIdx: 0 | 1, stones: StonePosition[]): void {
    // Only the active player's stream is authoritative — ignore any others
    if (playerIdx !== this.activePlayer) return;
    this.send(this.sockets[this.other(playerIdx)], {
      type: 'opponent_positions',
      stones,
    });
  }

  // ── Shot ──────────────────────────────────────────────────────────────────

  private handleShoot(
    playerIdx: 0 | 1,
    msg: Extract<C2SMessage, { type: 'shoot' }>,
  ): void {
    if (playerIdx !== this.activePlayer) {
      this.send(this.sockets[playerIdx], { type: 'error', message: 'Not your turn' });
      return;
    }
    if (this.throwsRemaining[playerIdx] <= 0) {
      this.send(this.sockets[playerIdx], { type: 'error', message: 'No stones remaining' });
      return;
    }

    this.throwsRemaining[playerIdx]--;
    this.throwOrder++;
    this.stoppedReported.clear();

    if (this.gameId !== null && this.playerIds !== null) {
      saveThrow(
        this.gameId,
        this.playerIds[playerIdx],
        this.throwOrder,
        msg.forceX,
        msg.forceY,
      ).catch(console.error);
    }

    this.send(this.sockets[this.other(playerIdx)], {
      type: 'opponent_shot',
      forceX: msg.forceX,
      forceY: msg.forceY,
      stoneIndex: msg.stoneIndex,
    });
  }

  // ── Stones-stopped / turn advance / end-game ──────────────────────────────

  private handleStopped(playerIdx: 0 | 1, stones: StonePosition[]): void {
    this.stoppedReported.add(playerIdx);
    if (stones.length > 0) this.lastStones = stones;

    if (this.stoppedReported.size < 2) return; // wait for the other client

    if (this.throwsRemaining[0] === 0 && this.throwsRemaining[1] === 0) {
      this.endGame();
    } else {
      this.activePlayer = this.other(this.activePlayer);
      this.broadcast({
        type: 'turn_change',
        activePlayer: this.activePlayer,
        throwsRemaining: this.throwsRemaining,
        positions: this.lastStones,
      });
    }
  }

  private endGame(): void {
    this.ended = true;
    const { winner, distances } = calculateWinner(
      this.lastStones,
      this.config.target.x,
      this.config.target.y,
    );
    this.broadcast({ type: 'game_over', winner, distances });

    if (this.gameId !== null && this.playerIds !== null) {
      // On tie, record player 0 as winner_id to satisfy the non-null FK
      const winnerId = winner !== null ? this.playerIds[winner] : this.playerIds[0];
      finishGame(this.gameId, winnerId).catch(console.error);
    }
  }

  // ── Pause ─────────────────────────────────────────────────────────────────

  private handlePause(playerIdx: 0 | 1): void {
    if (this.pausedBy !== null) return;
    this.pausedBy = playerIdx;
    this.broadcast({ type: 'paused', by: playerIdx });
  }

  private handleUnpause(playerIdx: 0 | 1): void {
    if (this.pausedBy !== playerIdx) return; // only the pauser can unpause
    this.pausedBy = null;
    this.broadcast({ type: 'unpaused' });
  }

  // ── Restart ───────────────────────────────────────────────────────────────

  private handleRestartRequest(playerIdx: 0 | 1): void {
    this.restartVotes.add(playerIdx);
    this.send(this.sockets[this.other(playerIdx)], { type: 'restart_requested', by: playerIdx });
    if (this.restartVotes.size === 2) this.restart().catch(console.error);
  }

  private handleRestartAccept(playerIdx: 0 | 1): void {
    this.restartVotes.add(playerIdx);
    if (this.restartVotes.size === 2) this.restart().catch(console.error);
  }

  private async restart(): Promise<void> {
    this.ended = false;
    this.activePlayer = 0;
    this.throwsRemaining = [this.config.stones.perPlayer, this.config.stones.perPlayer];
    this.stoppedReported.clear();
    this.pausedBy = null;
    this.restartVotes.clear();
    this.throwOrder = 0;
    this.lastStones = [];

    if (this.playerIds !== null) {
      this.gameId = await saveGame(
        this.playerIds[0],
        this.playerIds[1],
        this.config as unknown as Record<string, unknown>,
      );
    }

    this.broadcast({
      type: 'restarting',
      config: this.config,
      stonesPerPlayer: this.config.stones.perPlayer,
    });

    this.broadcast({
      type: 'turn_change',
      activePlayer: this.activePlayer,
      throwsRemaining: this.throwsRemaining,
    });
  }

  // ── Disconnect ────────────────────────────────────────────────────────────

  private handleDisconnect(playerIdx: 0 | 1): void {
    if (this.ended) return;
    this.ended = true;
    this.send(this.sockets[this.other(playerIdx)], { type: 'opponent_disconnected' });
    if (this.gameId !== null) abandonGame(this.gameId).catch(console.error);
  }
}
