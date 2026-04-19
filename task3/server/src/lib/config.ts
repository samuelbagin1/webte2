import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import type { GameConfig } from '../types/game.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Reads the single source of truth kept in client/public/game-config.json
export async function loadConfig(): Promise<GameConfig> {
  const configPath = join(__dirname, '..', '..', 'game-config.json');
  const raw = await readFile(configPath, 'utf-8');
  return JSON.parse(raw) as GameConfig;
}
