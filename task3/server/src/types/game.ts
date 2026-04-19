export interface StonePosition {
  player: 0 | 1;
  index: number;
  x: number; // normalized 0–1 relative to field width
  y: number; // normalized 0–1 relative to field height
}

// ---------- Client → Server ----------
export type C2SMessage =
  | { type: 'join'; nickname: string }
  | { type: 'shoot'; forceX: number; forceY: number; stoneIndex: number }
  | { type: 'positions_update'; stones: StonePosition[] }
  | { type: 'stones_stopped'; stones: StonePosition[] }
  | { type: 'pause' }
  | { type: 'unpause' }
  | { type: 'restart_request' }
  | { type: 'restart_accept' };

// ---------- Server → Client ----------
export type S2CMessage =
  | { type: 'waiting' }
  | { type: 'game_start'; playerIndex: 0 | 1; opponentNickname: string; config: GameConfig; stonesPerPlayer: number }
  | { type: 'opponent_shot'; forceX: number; forceY: number; stoneIndex: number }
  | { type: 'opponent_positions'; stones: StonePosition[] }
  | { type: 'turn_change'; activePlayer: 0 | 1; throwsRemaining: [number, number]; positions?: StonePosition[] }
  | { type: 'game_over'; winner: 0 | 1 | null; distances: number[] }
  | { type: 'paused'; by: 0 | 1 }
  | { type: 'unpaused' }
  | { type: 'restart_requested'; by: 0 | 1 }
  | { type: 'restarting'; config: GameConfig; stonesPerPlayer: number }
  | { type: 'opponent_disconnected' }
  | { type: 'error'; message: string };

// ---------- Config shape (mirrors client/public/game-config.json) ----------
export interface GameConfig {
  stones: {
    perPlayer: number;
    radius: number;
    friction: number;
    restitution: number;
    frictionAir: number;
  };
  target: { x: number; y: number; radius: number; rings: number[] };
  field: { width: number; height: number; wallRestitution: number };
  shot: { maxForce: number; forceMultiplier: number };
  physics: { stoppedVelocityThreshold: number; checkInterval: number };
}
