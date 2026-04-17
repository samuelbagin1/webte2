import WebSocket from 'ws';
import { GameRoom } from './GameRoom.js';
import type { GameConfig } from '../types/game.js';

interface WaitingEntry {
  ws: WebSocket;
  nickname: string;
}

export class RoomManager {
  private waiting: WaitingEntry | null = null;
  private config: GameConfig;

  constructor(config: GameConfig) {
    this.config = config;
  }

  addPlayer(ws: WebSocket, nickname: string): void {
    if (!this.waiting) {
      this.waiting = { ws, nickname };
      ws.send(JSON.stringify({ type: 'waiting' }));
      // Clean up the slot if the waiting player disconnects before a match
      ws.on('close', () => {
        if (this.waiting?.ws === ws) this.waiting = null;
      });
      return;
    }

    const partner = this.waiting;
    this.waiting = null;
    new GameRoom([partner.ws, ws], [partner.nickname, nickname], this.config);
  }
}
