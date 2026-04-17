import type { GameConfig } from '../types/game';
import type { GameState } from './GameState';
import type { AimVector } from './Renderer';

export interface ShootEvent {
  forceX: number;
  forceY: number;
  stoneIndex: number;
}

export class InputHandler {
  onShoot: ((e: ShootEvent) => void) | null = null;
  onAimUpdate: ((aim: AimVector | null) => void) | null = null;

  private dragging = false;
  private dragStartX = 0;
  private dragStartY = 0;
  private activeStoneIndex = -1;

  private _onMouseDown: (e: MouseEvent) => void;
  private _onMouseMove: (e: MouseEvent) => void;
  private _onMouseUp: (e: MouseEvent) => void;

  constructor(
    private canvas: HTMLCanvasElement,
    private config: GameConfig,
    private getScale: () => number,
    private getState: () => GameState,
  ) {
    this._onMouseDown = this._handleMouseDown.bind(this);
    this._onMouseMove = this._handleMouseMove.bind(this);
    this._onMouseUp = this._handleMouseUp.bind(this);
  }

  attach(): void {
    this.canvas.addEventListener('mousedown', this._onMouseDown);
    window.addEventListener('mousemove', this._onMouseMove);
    window.addEventListener('mouseup', this._onMouseUp);
  }

  detach(): void {
    this.canvas.removeEventListener('mousedown', this._onMouseDown);
    window.removeEventListener('mousemove', this._onMouseMove);
    window.removeEventListener('mouseup', this._onMouseUp);
    this.dragging = false;
    this.onAimUpdate?.(null);
  }

  private _logicalPos(e: MouseEvent): { x: number; y: number } {
    const rect = this.canvas.getBoundingClientRect();
    const scale = this.getScale();
    return {
      x: (e.clientX - rect.left) / scale,
      y: (e.clientY - rect.top) / scale,
    };
  }

  private _handleMouseDown(e: MouseEvent): void {
    const state = this.getState();
    if (state.phase !== 'aiming') return;
    if (state.activePlayer !== state.playerIndex) return;

    const { x, y } = this._logicalPos(e);
    const ownStones = state.stones.filter((s) => s.player === state.playerIndex);
    // The active stone is the last one placed by this player (lowest placed index = highest array index)
    const activeStone = ownStones[ownStones.length - 1];
    if (!activeStone) return;

    if (Math.hypot(x - activeStone.x, y - activeStone.y) > activeStone.radius * 2) return;

    this.dragging = true;
    this.dragStartX = activeStone.x;
    this.dragStartY = activeStone.y;
    this.activeStoneIndex = activeStone.index;
  }

  private _handleMouseMove(e: MouseEvent): void {
    if (!this.dragging) return;
    const { x, y } = this._logicalPos(e);
    const { maxForce, forceMultiplier } = this.config.shot;

    const dragDx = x - this.dragStartX;
    const dragDy = y - this.dragStartY;
    const magnitude = Math.hypot(dragDx, dragDy);
    const force = Math.min(magnitude * forceMultiplier, maxForce);

    this.onAimUpdate?.({
      fromX: this.dragStartX,
      fromY: this.dragStartY,
      toX: this.dragStartX - dragDx,
      toY: this.dragStartY - dragDy,
      force: force / maxForce,
    });
  }

  private _handleMouseUp(e: MouseEvent): void {
    if (!this.dragging) return;
    this.dragging = false;

    const { x, y } = this._logicalPos(e);
    const { maxForce, forceMultiplier } = this.config.shot;

    const dragDx = x - this.dragStartX;
    const dragDy = y - this.dragStartY;

    if (Math.hypot(dragDx, dragDy) < 2) {
      this.onAimUpdate?.(null);
      return;
    }

    // Slingshot: reverse drag direction
    const rawFx = -dragDx * forceMultiplier;
    const rawFy = -dragDy * forceMultiplier;
    const rawMag = Math.hypot(rawFx, rawFy) || 1;
    const clampScale = Math.min(1, maxForce / rawMag);

    this.onAimUpdate?.(null);
    this.onShoot?.({
      forceX: rawFx * clampScale,
      forceY: rawFy * clampScale,
      stoneIndex: this.activeStoneIndex,
    });
  }
}
