import 'dotenv/config';
import { createServer } from 'http';
import express from 'express';
import { createWebSocketServer } from './websocket/WebSocketServer.js';
import { getStats } from './db/queries.js';
import { loadConfig } from './lib/config.js';

const app = express();
app.use(express.json());

app.get('/api/stats', async (_req, res) => {
  try {
    const stats = await getStats();
    res.json(stats);
  } catch (err) {
    console.error('[stats]', err);
    res.status(500).json({ error: 'Database error' });
  }
});

const config = await loadConfig();
const httpServer = createServer(app);
createWebSocketServer(httpServer, config);

const PORT = Number(process.env.PORT ?? 3001);
httpServer.listen(PORT, () => console.log(`[server] listening on :${PORT}`));
