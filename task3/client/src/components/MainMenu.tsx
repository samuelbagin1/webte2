import { useState } from 'react';
import { RulesDialog } from './RulesDialog';

interface MainMenuProps {
  onPlay: () => void;
  onStats: () => void;
}

export function MainMenu({ onPlay, onStats }: MainMenuProps) {
  const [rulesOpen, setRulesOpen] = useState(false);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-6 bg-page">
      <div className="flex flex-col items-center gap-1 mb-4">
        <div className="w-16 h-16 rounded-full bg-copper flex items-center justify-center shadow-lg">
          <span className="text-white text-3xl font-bold select-none">●</span>
        </div>
        <h1 className="text-4xl font-bold text-text-primary tracking-tight">Curling</h1>
        <p className="text-text-muted text-sm">Online Multiplayer</p>
      </div>

      <button
        className="w-48 px-8 py-3 rounded-pill bg-btn-dark text-white font-semibold hover:opacity-90 transition"
        onClick={onPlay}
      >
        New Game
      </button>
      <button
        className="w-48 px-8 py-3 rounded-pill border border-border-default text-text-secondary hover:bg-subtle transition"
        onClick={() => setRulesOpen(true)}
      >
        Rules
      </button>
      <button
        className="w-48 px-8 py-3 rounded-pill border border-border-default text-text-secondary hover:bg-subtle transition"
        onClick={onStats}
      >
        Statistics
      </button>

      <RulesDialog open={rulesOpen} onClose={() => setRulesOpen(false)} />
    </div>
  );
}
