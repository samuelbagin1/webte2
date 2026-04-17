import { useState } from 'react';
import type { Screen } from './types/game';

function MainMenu({ onPlay, onStats }: { onPlay: () => void; onStats: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-6 bg-page">
      <h1 className="text-4xl font-bold text-text-primary">Curling</h1>
      <button
        className="px-8 py-3 rounded-pill bg-btn-dark text-white font-semibold hover:opacity-90 transition"
        onClick={onPlay}
      >
        New Game
      </button>
      <button
        className="px-8 py-3 rounded-pill border border-border-default text-text-secondary hover:bg-subtle transition"
        onClick={onStats}
      >
        Statistics
      </button>
    </div>
  );
}

function Lobby({ onBack }: { onBack: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4 bg-page">
      <p className="text-text-muted">Lobby — coming in Phase 6</p>
      <button className="underline text-accent" onClick={onBack}>Back</button>
    </div>
  );
}

function GameScreen({ onBack }: { onBack: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4 bg-page">
      <p className="text-text-muted">Game canvas — coming in Phase 5</p>
      <button className="underline text-accent" onClick={onBack}>Back</button>
    </div>
  );
}

function StatsPage({ onBack }: { onBack: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4 bg-page">
      <p className="text-text-muted">Statistics — coming in Phase 6</p>
      <button className="underline text-accent" onClick={onBack}>Back</button>
    </div>
  );
}

export default function App() {
  const [screen, setScreen] = useState<Screen>('menu');

  switch (screen) {
    case 'menu':
      return (
        <MainMenu
          onPlay={() => setScreen('lobby')}
          onStats={() => setScreen('stats')}
        />
      );
    case 'lobby':
      return <Lobby onBack={() => setScreen('menu')} />;
    case 'game':
      return <GameScreen onBack={() => setScreen('menu')} />;
    case 'stats':
      return <StatsPage onBack={() => setScreen('menu')} />;
  }
}
