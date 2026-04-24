import WebSocket from 'ws';
import type { C2SMessage, S2CMessage, StonePosition, GameConfig } from '../types/game.js';
import { savePlayers, saveGame, finishGame, abandonGame, saveThrow } from '../db/queries.js';
import { calculateWinner } from '../game/logic.js';
import { ServerPhysicsEngine } from '../game/ServerPhysicsEngine.js';

const STONE_SPAWN_X_RATIO = 0.5;
const STONE_SPAWN_Y_RATIO = 0.80;

export class GameRoom {
  private sockets: [WebSocket, WebSocket];
  private nicknames: [string, string];
  private config: GameConfig;

  private activePlayer: 0 | 1 = 0;
  private throwsRemaining: [number, number];
  private pausedBy: 0 | 1 | null = null;
  private restartVotes: Set<0 | 1> = new Set();

  private throwOrder = 0;
  private gameId: number | null = null;
  private playerIds: [number, number] | null = null;
  private lastStones: StonePosition[] = [];
  private ended = false;

  private physics: ServerPhysicsEngine;
  private tickHandle: NodeJS.Timeout | null = null;
  private tickCount = 0;
  private readonly FIXED_DT = 1000 / 60;
  private readonly BROADCAST_EVERY = 3; // ~20 Hz

  constructor(
    sockets: [WebSocket, WebSocket],
    nicknames: [string, string],
    config: GameConfig,
  ) {
    this.sockets = sockets;
    this.nicknames = nicknames;
    this.config = config;
    this.throwsRemaining = [config.stones.perPlayer, config.stones.perPlayer];
    this.physics = new ServerPhysicsEngine(config);
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

  private stoneSpawnPoint(): { x: number; y: number } {
    return {
      x: this.config.field.width * STONE_SPAWN_X_RATIO,
      y: this.config.field.height * STONE_SPAWN_Y_RATIO,
    };
  }

  private snapshotStones(): StonePosition[] {
    const out: StonePosition[] = [];
    const { width, height } = this.config.field;
    for (const [id, state] of this.physics.getPositions()) {
      const [p, i] = id.split('-');
      const player = Number(p) as 0 | 1;
      const index = Number(i);
      out.push({ player, index, x: state.x / width, y: state.y / height });
    }
    return out;
  }

  private spawnStoneFor(player: 0 | 1): void {
    const stoneIdx = this.config.stones.perPlayer - this.throwsRemaining[player];
    const { x, y } = this.stoneSpawnPoint();
    this.physics.addStone(`${player}-${stoneIdx}`, x, y);
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

    // Seed the first stone for the starting player in the authoritative world.
    this.spawnStoneFor(this.activePlayer);

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
      positions: this.snapshotStones(),
    });
  }

  // ── Message dispatch ──────────────────────────────────────────────────────

  private handleMessage(playerIdx: 0 | 1, raw: string): void {
    let msg: C2SMessage;
    try { msg = JSON.parse(raw) as C2SMessage; } catch { return; }

    switch (msg.type) {
      case 'shoot':            return this.handleShoot(playerIdx, msg);
      case 'pause':            return this.handlePause(playerIdx);
      case 'unpause':          return this.handleUnpause(playerIdx);
      case 'restart_request':  return this.handleRestartRequest(playerIdx);
      case 'restart_accept':   return this.handleRestartAccept(playerIdx);
    }
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
    if (this.tickHandle !== null) {
      // Simulation already running — ignore duplicate / late shots.
      return;
    }
    if (!Number.isFinite(msg.forceX) || !Number.isFinite(msg.forceY)) {
      this.send(this.sockets[playerIdx], { type: 'error', message: 'Invalid shot' });
      return;
    }

    // Clamp force magnitude to configured maximum (anti-cheat).
    let { forceX, forceY } = msg;
    const mag = Math.hypot(forceX, forceY);
    const maxForce = this.config.shot.maxForce;
    if (mag > maxForce) {
      const scale = maxForce / mag;
      forceX *= scale;
      forceY *= scale;
    }

    const expectedStoneIndex = this.config.stones.perPlayer - this.throwsRemaining[playerIdx];
    if (msg.stoneIndex !== expectedStoneIndex) {
      this.send(this.sockets[playerIdx], { type: 'error', message: 'Invalid stone index' });
      return;
    }

    this.throwsRemaining[playerIdx]--;
    this.throwOrder++;

    if (this.gameId !== null && this.playerIds !== null) {
      saveThrow(
        this.gameId,
        this.playerIds[playerIdx],
        this.throwOrder,
        forceX,
        forceY,
      ).catch(console.error);
    }

    // Let the opponent's client fire shot SFX / animation cues immediately.
    this.send(this.sockets[this.other(playerIdx)], {
      type: 'opponent_shot',
      forceX,
      forceY,
      stoneIndex: msg.stoneIndex,
    });

    this.physics.applyForce(`${playerIdx}-${msg.stoneIndex}`, forceX, forceY);
    this.startSimulation();
  }

  // ── Simulation loop ───────────────────────────────────────────────────────

  private startSimulation(): void {
    if (this.tickHandle !== null) return;
    this.tickCount = 0;
    this.tickHandle = setInterval(() => this.tick(), this.FIXED_DT);
  }

  private stopSimulation(): void {
    if (this.tickHandle !== null) {
      clearInterval(this.tickHandle);
      this.tickHandle = null;
    }
  }

  private tick(): void {
    if (this.ended) {
      this.stopSimulation();
      return;
    }
    // Pause freezes the simulation but keeps the interval alive so unpause
    // resumes instantly without a new tick lifecycle.
    if (this.pausedBy !== null) return;

    this.physics.step(this.FIXED_DT);
    this.tickCount++;

    if (this.tickCount % this.BROADCAST_EVERY === 0) {
      this.broadcast({ type: 'stone_positions', stones: this.snapshotStones() });
    }

    if (this.physics.isSettled(Date.now())) {
      this.onSettled();
    }
  }

  private onSettled(): void {
    this.stopSimulation();
    this.lastStones = this.snapshotStones();

    if (this.throwsRemaining[0] === 0 && this.throwsRemaining[1] === 0) {
      this.endGame();
      return;
    }

    // Flip turn and spawn the next stone in the authoritative world BEFORE
    // snapshotting, so the broadcast includes it.
    this.activePlayer = this.other(this.activePlayer);
    if (this.throwsRemaining[this.activePlayer] > 0) {
      this.spawnStoneFor(this.activePlayer);
    }

    this.broadcast({
      type: 'turn_change',
      activePlayer: this.activePlayer,
      throwsRemaining: this.throwsRemaining,
      positions: this.snapshotStones(),
    });
  }

  // ── End / cleanup ─────────────────────────────────────────────────────────

  private endGame(): void {
    this.ended = true;
    this.stopSimulation();
    const { winner, distances } = calculateWinner(
      this.lastStones,
      this.config.target.x,
      this.config.target.y,
    );
    this.broadcast({ type: 'game_over', winner, distances });

    if (this.gameId !== null && this.playerIds !== null) {
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
    if (this.pausedBy !== playerIdx) return;
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
    this.stopSimulation();
    this.ended = false;
    this.activePlayer = 0;
    this.throwsRemaining = [this.config.stones.perPlayer, this.config.stones.perPlayer];
    this.pausedBy = null;
    this.restartVotes.clear();
    this.throwOrder = 0;
    this.lastStones = [];

    this.physics.reset();
    this.spawnStoneFor(this.activePlayer);

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
      positions: this.snapshotStones(),
    });
  }

  // ── Disconnect ────────────────────────────────────────────────────────────

  private handleDisconnect(playerIdx: 0 | 1): void {
    if (this.ended) return;
    this.ended = true;
    this.stopSimulation();
    this.physics.destroy();
    this.send(this.sockets[this.other(playerIdx)], { type: 'opponent_disconnected' });
    if (this.gameId !== null) abandonGame(this.gameId).catch(console.error);
  }
}
