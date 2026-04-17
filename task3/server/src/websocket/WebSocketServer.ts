import { WebSocketServer as WSS } from 'ws';
import type { Server } from 'http';
import { RoomManager } from './RoomManager.js';
import type { C2SMessage, GameConfig } from '../types/game.js';

export function createWebSocketServer(httpServer: Server, config: GameConfig): WSS {
  const wss = new WSS({ server: httpServer });
  const roomManager = new RoomManager(config);

  wss.on('connection', ws => {
    // First message must be `join` with a non-empty nickname; anything else drops the connection
    ws.once('message', data => {
      let msg: C2SMessage;
      try { msg = JSON.parse(data.toString()) as C2SMessage; } catch {
        ws.close();
        return;
      }
      if (msg.type !== 'join' || !msg.nickname?.trim()) {
        ws.close();
        return;
      }
      roomManager.addPlayer(ws, msg.nickname.trim());
    });
  });

  return wss;
}
