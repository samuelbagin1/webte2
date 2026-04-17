import type { C2SMessage, S2CMessage } from '../types/game';

export type WSStatus = 'disconnected' | 'connecting' | 'connected';

export class WSClient {
  private ws: WebSocket | null = null;
  private onMessage: (msg: S2CMessage) => void;
  private onStatusChange: (status: WSStatus) => void;

  constructor(
    onMessage: (msg: S2CMessage) => void,
    onStatusChange: (status: WSStatus) => void,
  ) {
    this.onMessage = onMessage;
    this.onStatusChange = onStatusChange;
  }

  connect(url: string): void {
    this.onStatusChange('connecting');
    this.ws = new WebSocket(url);

    this.ws.onopen = () => this.onStatusChange('connected');

    this.ws.onmessage = (event: MessageEvent) => {
      try {
        const msg = JSON.parse(event.data as string) as S2CMessage;
        this.onMessage(msg);
      } catch {
        console.error('WS parse error', event.data);
      }
    };

    this.ws.onclose = () => {
      this.onStatusChange('disconnected');
      this.ws = null;
    };

    this.ws.onerror = () => {
      this.onStatusChange('disconnected');
      this.ws = null;
    };
  }

  send(msg: C2SMessage): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(msg));
    }
  }

  close(): void {
    this.ws?.close();
    this.ws = null;
  }
}
