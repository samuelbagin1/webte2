import { useState } from 'react';
import type { WSStatus } from '../lib/ws-client';

interface LobbyProps {
  wsStatus: WSStatus;
  waiting: boolean;
  onJoin: (nickname: string) => void;
  onBack: () => void;
}

export function Lobby({ wsStatus, waiting, onJoin, onBack }: LobbyProps) {
  const [nickname, setNickname] = useState('');

  const canConnect = wsStatus === 'connected' && nickname.trim().length >= 2 && !waiting;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (canConnect) onJoin(nickname.trim());
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-6 bg-page">
      <h2 className="text-2xl font-bold text-text-primary">Join Game</h2>

      {!waiting ? (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-72">
          <input
            className="px-4 py-2 rounded-pill border border-border-default bg-card text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-copper"
            placeholder="Your nickname (min 2 chars)"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            maxLength={20}
            autoFocus
          />
          <button
            type="submit"
            disabled={!canConnect}
            className="px-8 py-3 rounded-pill bg-btn-dark text-white font-semibold hover:opacity-90 transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {wsStatus === 'connecting' ? 'Connecting…' : wsStatus === 'disconnected' ? 'Disconnected' : 'Connect'}
          </button>
        </form>
      ) : (
        <div className="flex flex-col items-center gap-4">
          <div className="flex gap-2">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="w-3 h-3 rounded-full bg-copper animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
          <p className="text-text-secondary">Waiting for opponent…</p>
        </div>
      )}

      <button
        className="text-text-muted underline text-sm hover:text-text-secondary transition"
        onClick={onBack}
      >
        ← Back to menu
      </button>
    </div>
  );
}
