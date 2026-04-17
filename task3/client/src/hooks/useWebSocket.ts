import { useCallback, useEffect, useRef, useState } from 'react';
import { WSClient, type WSStatus } from '../lib/ws-client';
import type { C2SMessage, S2CMessage } from '../types/game';

interface UseWebSocketOptions {
  url: string;
  onMessage: (msg: S2CMessage) => void;
}

interface UseWebSocketReturn {
  status: WSStatus;
  send: (msg: C2SMessage) => void;
  disconnect: () => void;
}

export function useWebSocket({ url, onMessage }: UseWebSocketOptions): UseWebSocketReturn {
  const [status, setStatus] = useState<WSStatus>('disconnected');
  const clientRef = useRef<WSClient | null>(null);
  // Keep ref current so WS handler always calls latest callback without reconnecting
  const onMessageRef = useRef(onMessage);
  onMessageRef.current = onMessage;

  useEffect(() => {
    const client = new WSClient(
      (msg) => onMessageRef.current(msg),
      (s) => setStatus(s),
    );
    clientRef.current = client;
    client.connect(url);

    return () => {
      client.close();
      clientRef.current = null;
    };
  }, [url]);

  const send = useCallback((msg: C2SMessage) => {
    clientRef.current?.send(msg);
  }, []);

  const disconnect = useCallback(() => {
    clientRef.current?.close();
  }, []);

  return { status, send, disconnect };
}
