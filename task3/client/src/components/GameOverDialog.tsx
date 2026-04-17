import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import type { Player } from '../types/game';

interface GameOverDialogProps {
  open: boolean;
  winner: 0 | 1 | null;
  distances: number[];
  players: [Player, Player];
  myIndex: 0 | 1;
  onNewGame: () => void;
  onMenu: () => void;
}

export function GameOverDialog({
  open,
  winner,
  distances,
  players,
  myIndex,
  onNewGame,
  onMenu,
}: GameOverDialogProps) {
  const isDraw = winner === null;
  const iWon = winner === myIndex;

  const resultText = isDraw ? 'Draw!' : iWon ? 'You Win!' : 'You Lose';
  const resultColor = isDraw ? 'text-text-secondary' : iWon ? 'text-copper' : 'text-text-muted';

  return (
    <Dialog open={open}>
      <DialogContent
        className="bg-card border-border-default max-w-sm"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className={`text-2xl font-bold text-center ${resultColor}`}>
            {resultText}
          </DialogTitle>
        </DialogHeader>

        {!isDraw && (
          <p className="text-center text-text-secondary text-sm">
            Winner:{' '}
            <span className="font-semibold text-text-primary">{players[winner!].nickname}</span>
          </p>
        )}

        {distances.length > 0 && (
          <div className="mt-3 space-y-1">
            <p className="text-xs text-text-muted font-medium uppercase tracking-wide mb-2">
              Closest stone distances
            </p>
            {distances.map((d, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-text-secondary">{players[i % 2]?.nickname ?? `Player ${i + 1}`}</span>
                <span className="text-text-primary font-medium">{d.toFixed(1)} px</span>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-3 mt-4">
          <button
            className="flex-1 px-4 py-2.5 rounded-pill bg-btn-dark text-white font-semibold hover:opacity-90 transition text-sm"
            onClick={onNewGame}
          >
            New Game
          </button>
          <button
            className="flex-1 px-4 py-2.5 rounded-pill border border-border-default text-text-secondary hover:bg-subtle transition text-sm"
            onClick={onMenu}
          >
            Main Menu
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
