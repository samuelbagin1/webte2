import type { GameConfig } from '../types/game';

let cached: GameConfig | null = null;

export async function loadConfig(): Promise<GameConfig> {
  if (cached) return cached;
  const res = await fetch(`${import.meta.env.BASE_URL}game-config.json`);
  if (!res.ok) throw new Error(`Failed to load game-config.json: ${res.status}`);
  cached = await res.json() as GameConfig;
  return cached;
}
