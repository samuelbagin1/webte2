import Matter from 'matter-js';
import type { GameConfig } from '../types/game';

export interface StonePhysicsState {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

export class PhysicsEngine {
  private engine: Matter.Engine;
  private world: Matter.World;
  private stones = new Map<string, Matter.Body>();
  private threshold: number;
  private checkInterval: number;
  private lastCheckTime = 0;
  private _stopped = true;

  constructor(private config: GameConfig) {
    this.engine = Matter.Engine.create({ gravity: { x: 0, y: 0 } });
    this.world = this.engine.world;
    this.threshold = config.physics.stoppedVelocityThreshold;
    this.checkInterval = config.physics.checkInterval;
    this._addWalls();
  }

  private _addWalls(): void {
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

  applyForce(id: string, fx: number, fy: number): void {
    const body = this.stones.get(id);
    if (!body) return;
    Matter.Body.applyForce(body, body.position, { x: fx, y: fy });
    this._stopped = false;
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

  checkStopped(nowMs: number): boolean {
    if (this.stones.size === 0) return true;
    if (nowMs - this.lastCheckTime < this.checkInterval) return this._stopped;
    this.lastCheckTime = nowMs;
    this._stopped = [...this.stones.values()].every(
      (b) => Math.hypot(b.velocity.x, b.velocity.y) < this.threshold,
    );
    return this._stopped;
  }

  reset(): void {
    Matter.Composite.clear(this.world, false);
    this.stones.clear();
    this._stopped = true;
    this._addWalls();
  }

  destroy(): void {
    Matter.Engine.clear(this.engine);
    this.stones.clear();
  }
}
