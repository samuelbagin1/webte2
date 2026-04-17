import type { GameConfig } from '../types/game';
import type { StonePhysicsState } from './PhysicsEngine';

export type GamePhase = 'idle' | 'waiting' | 'aiming' | 'sliding' | 'stopped';

export interface StoneState {
  player: 0 | 1;
  index: number;
  x: number; // logical pixels
  y: number;
  radius: number;
}

export class GameState {
  phase: GamePhase = 'idle';
  activePlayer: 0 | 1 = 0;
  stonesLeft: [number, number] = [0, 0];
  stones: StoneState[] = [];

  constructor(
    private config: GameConfig,
    public playerIndex: 0 | 1,
  ) {}

  start(activePlayer: 0 | 1, stonesPerPlayer: number): void {
    this.stonesLeft = [stonesPerPlayer, stonesPerPlayer];
    this.activePlayer = activePlayer;
    this.stones = [];
    this.phase = activePlayer === this.playerIndex ? 'aiming' : 'waiting';
  }

  addStone(player: 0 | 1, index: number, x: number, y: number): void {
    this.stones.push({ player, index, x, y, radius: this.config.stones.radius });
  }

  beginAim(): void {
    if (this.activePlayer !== this.playerIndex) return;
    if (this.phase !== 'waiting' && this.phase !== 'aiming') return;
    this.phase = 'aiming';
  }

  markShot(): void {
    if (this.phase !== 'aiming' && this.phase !== 'waiting') return;
    this.phase = 'sliding';
  }

  markStopped(): void {
    if (this.phase !== 'sliding') return;
    this.phase = 'stopped';
  }

  applyTurnChange(activePlayer: 0 | 1, throwsRemaining: [number, number]): void {
    this.activePlayer = activePlayer;
    this.stonesLeft = throwsRemaining;
    this.phase = activePlayer === this.playerIndex ? 'aiming' : 'waiting';
  }

  syncPositions(positions: Map<string, StonePhysicsState>): void {
    for (const stone of this.stones) {
      const pos = positions.get(`${stone.player}-${stone.index}`);
      if (pos) {
        stone.x = pos.x;
        stone.y = pos.y;
      }
    }
  }
}
