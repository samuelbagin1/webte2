import { Badge } from './ui/badge';
import type { Player } from '../types/game';

interface GameHUDProps {
  players: [Player, Player];
  activePlayer: 0 | 1;
  myIndex: 0 | 1;
  onPause: () => void;
}

export function GameHUD({ players, activePlayer, myIndex, onPause }: GameHUDProps) {
  return (
    <div className="absolute inset-x-0 top-0 z-10 flex items-start justify-between px-4 py-3 pointer-events-none">
      <PlayerCard player={players[0]} active={activePlayer === 0} isMe={myIndex === 0} color="terracotta" />

      <div className="flex flex-col items-center gap-2 pointer-events-auto">
        <span className="text-xs text-text-muted font-medium uppercase tracking-wide">
          {activePlayer === myIndex ? 'Your turn' : "Opponent's turn"}
        </span>
        <button
          className="px-3 py-1 rounded-pill border border-border-default text-text-secondary text-xs hover:bg-subtle transition"
          onClick={onPause}
        >
          Pause
        </button>
      </div>

      <PlayerCard player={players[1]} active={activePlayer === 1} isMe={myIndex === 1} color="blue" />
    </div>
  );
}

function PlayerCard({
  player,
  active,
  isMe,
  color,
}: {
  player: Player;
  active: boolean;
  isMe: boolean;
  color: 'terracotta' | 'blue';
}) {
  const dotClass = color === 'terracotta' ? 'bg-player-red' : 'bg-player-blue';
  return (
    <div
      className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition pointer-events-none ${active ? 'bg-card shadow' : 'opacity-60'}`}
    >
      <div className="flex items-center gap-1.5">
        <span className={`w-3 h-3 rounded-full ${dotClass}`} />
        <span className="text-sm font-semibold text-text-primary">
          {player.nickname}
          {isMe && <span className="ml-1 text-text-muted font-normal">(you)</span>}
        </span>
      </div>
      <Badge variant="secondary" className="text-xs">
        {player.stonesLeft} stones left
      </Badge>
    </div>
  );
}
