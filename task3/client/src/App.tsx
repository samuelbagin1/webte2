import { useCallback, useRef, useState } from 'react';
import type { GameConfig, Player, S2CMessage, Screen } from './types/game';
import { useWebSocket } from './hooks/useWebSocket';
import { MainMenu } from './components/MainMenu';
import { Lobby } from './components/Lobby';
import { StatsPage } from './components/StatsPage';
import { GameCanvas } from './components/GameCanvas';
import { GameHUD } from './components/GameHUD';
import { PauseOverlay } from './components/PauseOverlay';
import { GameOverDialog } from './components/GameOverDialog';

const WS_URL = (import.meta.env.VITE_WS_URL as string | undefined) ?? `${location.protocol === 'https:' ? 'wss' : 'ws'}://${location.host}${import.meta.env.BASE_URL}ws`;

interface GameSession {
  playerIndex: 0 | 1;
  config: GameConfig;
  stonesPerPlayer: number;
  players: [Player, Player];
  activePlayer: 0 | 1;
}

export default function App() {
  const [screen, setScreen] = useState<Screen>('menu');
  const [waiting, setWaiting] = useState(false);
  const [session, setSession] = useState<GameSession | null>(null);
  const [incomingMessage, setIncomingMessage] = useState<S2CMessage | null>(null);
  const [pauseState, setPauseState] = useState<{ by: 0 | 1 } | null>(null);
  const [gameOver, setGameOver] = useState<{ winner: 0 | 1 | null; distances: number[] } | null>(null);
  const [restartRequestedBy, setRestartRequestedBy] = useState<0 | 1 | null>(null);

  const myNicknameRef = useRef('');
  const sessionRef = useRef(session);
  sessionRef.current = session;

  const handleMessage = useCallback((msg: S2CMessage) => {
    switch (msg.type) {
      case 'waiting':
        setWaiting(true);
        break;

      case 'game_start': {
        const { playerIndex, opponentNickname, config, stonesPerPlayer } = msg;
        const myNick = myNicknameRef.current;
        const p0: Player = {
          index: 0,
          nickname: playerIndex === 0 ? myNick : opponentNickname,
          stonesLeft: stonesPerPlayer,
        };
        const p1: Player = {
          index: 1,
          nickname: playerIndex === 1 ? myNick : opponentNickname,
          stonesLeft: stonesPerPlayer,
        };
        setSession({ playerIndex, config, stonesPerPlayer, players: [p0, p1], activePlayer: 0 });
        setWaiting(false);
        setPauseState(null);
        setGameOver(null);
        setRestartRequestedBy(null);
        setIncomingMessage(null);
        setScreen('game');
        break;
      }

      case 'turn_change':
        setSession((s) => {
          if (!s) return s;
          return {
            ...s,
            activePlayer: msg.activePlayer,
            players: [
              { ...s.players[0], stonesLeft: msg.throwsRemaining[0] },
              { ...s.players[1], stonesLeft: msg.throwsRemaining[1] },
            ],
          };
        });
        setIncomingMessage({ ...msg });
        break;

      case 'opponent_shot':
      case 'opponent_positions':
        setIncomingMessage({ ...msg });
        break;

      case 'game_over':
        setGameOver({ winner: msg.winner, distances: msg.distances });
        break;

      case 'paused':
        setPauseState({ by: msg.by });
        break;

      case 'unpaused':
        setPauseState(null);
        break;

      case 'restart_requested':
        setRestartRequestedBy(msg.by);
        break;

      case 'restarting': {
        setSession((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            config: msg.config,
            stonesPerPlayer: msg.stonesPerPlayer,
            activePlayer: 0,
            players: [
              { ...prev.players[0], stonesLeft: msg.stonesPerPlayer },
              { ...prev.players[1], stonesLeft: msg.stonesPerPlayer },
            ],
          };
        });
        setPauseState(null);
        setGameOver(null);
        setRestartRequestedBy(null);
        setIncomingMessage({ ...msg });
        break;
      }

      case 'opponent_disconnected': {
        const s = sessionRef.current;
        setGameOver({ winner: s?.playerIndex ?? 0, distances: [] });
        break;
      }
    }
  }, []);

  const { status, send } = useWebSocket({ url: WS_URL, onMessage: handleMessage });

  function handleJoin(nickname: string) {
    myNicknameRef.current = nickname;
    send({ type: 'join', nickname });
  }

  function handlePause() {
    if (pauseState) {
      send({ type: 'unpause' });
    } else {
      send({ type: 'pause' });
    }
  }

  function handleNewGame() {
    setGameOver(null);
    setSession(null);
    setScreen('lobby');
  }

  function handleMenu() {
    setGameOver(null);
    setSession(null);
    setScreen('menu');
  }

  switch (screen) {
    case 'menu':
      return <MainMenu onPlay={() => setScreen('lobby')} onStats={() => setScreen('stats')} />;

    case 'lobby':
      return (
        <Lobby
          wsStatus={status}
          waiting={waiting}
          onJoin={handleJoin}
          onBack={() => {
            setWaiting(false);
            setScreen('menu');
          }}
        />
      );

    case 'stats':
      return <StatsPage onBack={() => setScreen('menu')} />;

    case 'game': {
      if (!session) return null;
      return (
        <div className="relative w-screen h-screen bg-page overflow-hidden">
          <GameCanvas
            playerIndex={session.playerIndex}
            config={session.config}
            incomingMessage={incomingMessage}
            onShoot={(msg) => send(msg)}
            onStonesStopped={(msg) => send(msg)}
            onPositionsUpdate={(msg) => send(msg)}
          />
          <GameHUD
            players={session.players}
            activePlayer={session.activePlayer}
            myIndex={session.playerIndex}
            onPause={handlePause}
          />
          {pauseState && (
            <PauseOverlay
              pausedBy={pauseState.by}
              players={session.players}
              myIndex={session.playerIndex}
              restartRequestedBy={restartRequestedBy}
              onResume={handlePause}
              onRestartRequest={() => send({ type: 'restart_request' })}
              onRestartAccept={() => send({ type: 'restart_accept' })}
            />
          )}
          {gameOver && (
            <GameOverDialog
              open
              winner={gameOver.winner}
              distances={gameOver.distances}
              players={session.players}
              myIndex={session.playerIndex}
              onNewGame={handleNewGame}
              onMenu={handleMenu}
            />
          )}
        </div>
      );
    }
  }
}
