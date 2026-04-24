import { useCallback, useEffect, useRef } from 'react';
import type { C2SMessage, GameConfig, S2CMessage } from '../types/game';
import { GameState } from '../game/GameState';
import { Renderer } from '../game/Renderer';
import type { AimVector } from '../game/Renderer';
import { InputHandler } from '../game/InputHandler';
import { useGameLoop } from '../hooks/useGameLoop';
import { useResponsiveCanvas } from '../hooks/useResponsiveCanvas';

interface GameCanvasProps {
  playerIndex: 0 | 1;
  config: GameConfig;
  incomingMessage: S2CMessage | null;
  onShoot: (msg: Extract<C2SMessage, { type: 'shoot' }>) => void;
}

export function GameCanvas({
  playerIndex,
  config,
  incomingMessage,
  onShoot,
}: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const gameStateRef = useRef<GameState | null>(null);
  const rendererRef = useRef<Renderer | null>(null);
  const aimRef = useRef<AimVector | null>(null);

  const onShootRef = useRef(onShoot);
  onShootRef.current = onShoot;

  const { cssScale, renderScale } = useResponsiveCanvas(canvasRef, config.field.width, config.field.height);
  const cssScaleRef = useRef(cssScale);
  cssScaleRef.current = cssScale;
  const renderScaleRef = useRef(renderScale);
  renderScaleRef.current = renderScale;

  // Initialize engine objects once on mount
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const gs = new GameState(config, playerIndex);
    const renderer = new Renderer(ctx, config);
    const input = new InputHandler(
      canvas,
      config,
      () => cssScaleRef.current,
      () => gameStateRef.current!,
    );

    input.onAimUpdate = (aim) => {
      aimRef.current = aim;
    };

    input.onShoot = (e) => {
      const state = gameStateRef.current;
      if (!state) return;
      // Optimistic local phase flip; the server is authoritative for motion.
      state.markShot();
      onShootRef.current({ type: 'shoot', forceX: e.forceX, forceY: e.forceY, stoneIndex: e.stoneIndex });
    };

    input.attach();
    gameStateRef.current = gs;
    rendererRef.current = renderer;

    return () => {
      input.detach();
    };
  }, [config, playerIndex]);

  // React to each server message
  useEffect(() => {
    if (!incomingMessage) return;
    const gs = gameStateRef.current;
    if (!gs) return;

    if (incomingMessage.type === 'turn_change') {
      const { activePlayer, throwsRemaining, positions } = incomingMessage;
      gs.applyTurnChange(activePlayer, throwsRemaining);

      if (positions) {
        // Server owns the stone set now — rebuild from the authoritative snapshot
        // so any newly-spawned stone appears and any removed one disappears.
        gs.stones = [];
        for (const p of positions) {
          const px = p.x * config.field.width;
          const py = p.y * config.field.height;
          gs.addStone(p.player, p.index, px, py);
        }
      }
    }

    if (incomingMessage.type === 'opponent_shot') {
      // Motion arrives via stone_positions; flip phase so UI reflects a shot in flight.
      gs.markShot();
    }

    if (incomingMessage.type === 'stone_positions') {
      for (const p of incomingMessage.stones) {
        const px = p.x * config.field.width;
        const py = p.y * config.field.height;
        const stone = gs.stones.find((s) => s.player === p.player && s.index === p.index);
        if (stone) {
          stone.x = px;
          stone.y = py;
        } else {
          // Shouldn't happen — server seeds stones via turn_change — but guard anyway.
          gs.addStone(p.player, p.index, px, py);
        }
      }
    }

    if (incomingMessage.type === 'restarting') {
      gs.start(0, incomingMessage.stonesPerPlayer);
      aimRef.current = null;
    }
  }, [incomingMessage, config]);

  const gameLoop = useCallback(
    (_delta: number) => {
      const gs = gameStateRef.current;
      const renderer = rendererRef.current;
      if (!gs || !renderer) return;
      renderer.draw(gs, renderScaleRef.current, gs.phase === 'aiming' ? aimRef.current : null);
    },
    [],
  );

  useGameLoop(gameLoop, true);

  return (
    <div className="w-full h-full flex items-center justify-center overflow-hidden">
      <canvas ref={canvasRef} className="touch-none" />
    </div>
  );
}
