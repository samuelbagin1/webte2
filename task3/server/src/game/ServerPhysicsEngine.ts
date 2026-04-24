import Matter from 'matter-js';
import type { GameConfig } from '../types/game.js';

export interface StonePhysicsState {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

const STOP_DISPLACEMENT_THRESHOLD = 0.5;

export class ServerPhysicsEngine {
  private engine: Matter.Engine;
  private world: Matter.World;
  private stones = new Map<string, Matter.Body>();
  private checkInterval: number;
  private lastCheckTime = 0;
  private _stopped = true;
  private prevPositions = new Map<string, { x: number; y: number }>();
  private snapshotReady = false;

  constructor(private config: GameConfig) {
    this.engine = Matter.Engine.create({ gravity: { x: 0, y: 0 } });
    this.world = this.engine.world;
    this.checkInterval = config.physics.checkInterval;
    this.addWalls();
  }

  private addWalls(): void {
    const { width, height, wallRestitution } = this.config.field;
    const t = 50;
    const opts: Matter.IChamferableBodyDefinition = {
      isStatic: true,
      restitution: wallRestitution,
      friction: 0,
      frictionStatic: 0,
    };
    Matter.Composite.add(this.world, [
      Matter.Bodies.rectangle(width / 2, -t / 2, width + t * 2, t, opts),
      Matter.Bodies.rectangle(width / 2, height + t / 2, width + t * 2, t, opts),
      Matter.Bodies.rectangle(-t / 2, height / 2, t, height + t * 2, opts),
      Matter.Bodies.rectangle(width + t / 2, height / 2, t, height + t * 2, opts),
    ]);
  }

  addStone(id: string, x: number, y: number): void {
    const { radius, friction, restitution, frictionAir } = this.config.stones;
    const body = Matter.Bodies.circle(x, y, radius, {
      friction,
      restitution,
      frictionAir,
      frictionStatic: 0,
      label: id,
    });
    this.stones.set(id, body);
    Matter.Composite.add(this.world, body);
  }

  removeStone(id: string): void {
    const body = this.stones.get(id);
    if (!body) return;
    Matter.Composite.remove(this.world, body);
    this.stones.delete(id);
  }

  applyForce(id: string, fx: number, fy: number): void {
    const body = this.stones.get(id);
    if (!body) return;
    Matter.Body.applyForce(body, body.position, { x: fx, y: fy });
    this._stopped = false;
    this.snapshotReady = false;
    this.prevPositions.clear();
    this.lastCheckTime = 0;
  }

  setPosition(id: string, x: number, y: number): void {
    const body = this.stones.get(id);
    if (!body) return;
    Matter.Body.setPosition(body, { x, y });
    Matter.Body.setVelocity(body, { x: 0, y: 0 });
    Matter.Body.setAngularVelocity(body, 0);
  }

  step(deltaMs: number): void {
    Matter.Engine.update(this.engine, deltaMs);
  }

  getPositions(): Map<string, StonePhysicsState> {
    const out = new Map<string, StonePhysicsState>();
    for (const [id, body] of this.stones) {
      out.set(id, {
        x: body.position.x,
        y: body.position.y,
        vx: body.velocity.x,
        vy: body.velocity.y,
      });
    }
    return out;
  }

  isSettled(nowMs: number): boolean {
    if (this.stones.size === 0) return true;
    if (nowMs - this.lastCheckTime < this.checkInterval) return this._stopped;
    this.lastCheckTime = nowMs;

    if (!this.snapshotReady) {
      this.prevPositions.clear();
      for (const [id, body] of this.stones) {
        this.prevPositions.set(id, { x: body.position.x, y: body.position.y });
      }
      this.snapshotReady = true;
      this._stopped = false;
      return false;
    }

    let maxDisplacement = 0;
    for (const [id, body] of this.stones) {
      const prev = this.prevPositions.get(id);
      if (prev) {
        const d = Math.hypot(body.position.x - prev.x, body.position.y - prev.y);
        if (d > maxDisplacement) maxDisplacement = d;
      }
      this.prevPositions.set(id, { x: body.position.x, y: body.position.y });
    }

    this._stopped = maxDisplacement < STOP_DISPLACEMENT_THRESHOLD;
    return this._stopped;
  }

  reset(): void {
    Matter.Composite.clear(this.world, false);
    this.stones.clear();
    this.prevPositions.clear();
    this.snapshotReady = false;
    this._stopped = true;
    this.lastCheckTime = 0;
    this.addWalls();
  }

  destroy(): void {
    Matter.Engine.clear(this.engine);
    this.stones.clear();
    this.prevPositions.clear();
  }
}
