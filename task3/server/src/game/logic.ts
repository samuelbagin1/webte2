import type { StonePosition } from '../types/game.js';

function dist(s: StonePosition, tx: number, ty: number): number {
  return Math.sqrt((s.x - tx) ** 2 + (s.y - ty) ** 2);
}

export function calculateWinner(
  stones: StonePosition[],
  targetX: number,
  targetY: number,
): { winner: 0 | 1 | null; distances: number[] } {
  if (stones.length === 0) return { winner: null, distances: [] };

  const distances = stones.map(s => dist(s, targetX, targetY));

  const p0Min = Math.min(
    ...stones.map((s, i) => (s.player === 0 ? distances[i] : Infinity)),
  );
  const p1Min = Math.min(
    ...stones.map((s, i) => (s.player === 1 ? distances[i] : Infinity)),
  );

  if (Math.abs(p0Min - p1Min) < 1e-9) return { winner: null, distances };
  return { winner: p0Min < p1Min ? 0 : 1, distances };
}
