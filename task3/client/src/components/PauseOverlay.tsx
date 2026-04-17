import type { Player } from '../types/game';

interface PauseOverlayProps {
  pausedBy: 0 | 1;
  players: [Player, Player];
  myIndex: 0 | 1;
  restartRequestedBy: 0 | 1 | null;
  onResume: () => void;
  onRestartRequest: () => void;
  onRestartAccept: () => void;
}

export function PauseOverlay({
  pausedBy,
  players,
  myIndex,
  restartRequestedBy,
  onResume,
  onRestartRequest,
  onRestartAccept,
}: PauseOverlayProps) {
  const iAmPauser = pausedBy === myIndex;
  const pauserName = players[pausedBy].nickname;
  const opponentRequestedRestart = restartRequestedBy !== null && restartRequestedBy !== myIndex;

  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-card border border-border-default rounded-2xl p-8 flex flex-col items-center gap-4 shadow-xl min-w-64">
        <h3 className="text-lg font-bold text-text-primary">Game Paused</h3>
        <p className="text-text-secondary text-sm">
          {iAmPauser ? 'You paused the game.' : `${pauserName} paused the game.`}
        </p>

        {opponentRequestedRestart && (
          <div className="bg-subtle rounded-xl px-4 py-3 text-center w-full">
            <p className="text-text-secondary text-sm mb-2">Opponent wants to restart.</p>
            <button
              className="px-4 py-1.5 rounded-pill bg-btn-dark text-white text-sm hover:opacity-90 transition"
              onClick={onRestartAccept}
            >
              Accept Restart
            </button>
          </div>
        )}

        <button
          className="w-full px-6 py-2.5 rounded-pill bg-btn-dark text-white font-semibold hover:opacity-90 transition"
          onClick={onResume}
        >
          Resume
        </button>

        {restartRequestedBy === null && (
          <button
            className="w-full px-6 py-2 rounded-pill border border-border-default text-text-secondary text-sm hover:bg-subtle transition"
            onClick={onRestartRequest}
          >
            Request Restart
          </button>
        )}
      </div>
    </div>
  );
}
