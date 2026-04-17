import type { GameConfig } from '../types/game';
import type { GameState } from './GameState';

export interface AimVector {
  fromX: number;
  fromY: number;
  /** direction the stone will travel (reversed drag = slingshot) */
  toX: number;
  toY: number;
  /** 0–1 relative to maxForce */
  force: number;
}

const RING_COLORS = ['#C8C4B0', '#B8825A', '#C0614A', '#8B2500'] as const;
const STONE_FILL: [string, string] = ['#C0614A', '#4A7FC0'];
const STONE_BORDER: [string, string] = ['#8B2500', '#1A3F70'];

export class Renderer {
  constructor(
    private ctx: CanvasRenderingContext2D,
    private config: GameConfig,
  ) {}

  draw(state: GameState, scale: number, aim: AimVector | null): void {
    const { width, height } = this.config.field;
    const ctx = this.ctx;

    ctx.save();
    ctx.setTransform(scale, 0, 0, scale, 0, 0);

    this._drawBackground(width, height);
    this._drawTarget();
    this._drawStones(state);
    if (aim) this._drawAimArrow(aim);
    this._drawBorder(width, height);

    ctx.restore();
  }

  private _drawBackground(w: number, h: number): void {
    this.ctx.fillStyle = '#F0EFEA';
    this.ctx.fillRect(0, 0, w, h);
  }

  private _drawTarget(): void {
    const ctx = this.ctx;
    const { x, y, rings } = this.config.target;
    const { width, height } = this.config.field;
    const cx = x * width;
    const cy = y * height;

    // outer → inner so each ring paints over the previous
    for (let i = 0; i < rings.length; i++) {
      ctx.beginPath();
      ctx.arc(cx, cy, rings[i], 0, Math.PI * 2);
      ctx.fillStyle = RING_COLORS[i] ?? '#ccc';
      ctx.fill();
    }
  }

  private _drawStones(state: GameState): void {
    const ctx = this.ctx;
    for (const stone of state.stones) {
      const { x, y, radius, player } = stone;

      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,0.25)';
      ctx.shadowBlur = 6;
      ctx.shadowOffsetY = 3;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fillStyle = STONE_FILL[player];
      ctx.fill();
      ctx.restore();

      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.lineWidth = 3;
      ctx.strokeStyle = STONE_BORDER[player];
      ctx.stroke();
    }
  }

  private _drawAimArrow(aim: AimVector): void {
    const ctx = this.ctx;
    const alpha = 0.3 + aim.force * 0.7;
    const lineWidth = 2 + aim.force * 4;
    const arrowLen = 20 + aim.force * 60;

    const dx = aim.toX - aim.fromX;
    const dy = aim.toY - aim.fromY;
    const len = Math.hypot(dx, dy) || 1;
    const nx = dx / len;
    const ny = dy / len;
    const endX = aim.fromX + nx * arrowLen;
    const endY = aim.fromY + ny * arrowLen;

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = '#333333';
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';

    ctx.beginPath();
    ctx.moveTo(aim.fromX, aim.fromY);
    ctx.lineTo(endX, endY);
    ctx.stroke();

    const headLen = 10;
    const angle = Math.atan2(ny, nx);
    ctx.beginPath();
    ctx.moveTo(endX, endY);
    ctx.lineTo(endX - headLen * Math.cos(angle - Math.PI / 6), endY - headLen * Math.sin(angle - Math.PI / 6));
    ctx.moveTo(endX, endY);
    ctx.lineTo(endX - headLen * Math.cos(angle + Math.PI / 6), endY - headLen * Math.sin(angle + Math.PI / 6));
    ctx.stroke();

    ctx.restore();
  }

  private _drawBorder(w: number, h: number): void {
    this.ctx.strokeStyle = '#DEDEDE';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(0, 0, w, h);
  }
}
