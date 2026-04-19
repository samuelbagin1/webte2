import { useCallback, useEffect, useRef } from 'react';
import type { C2SMessage, GameConfig, S2CMessage, StonePosition } from '../types/game';
import { PhysicsEngine } from '../game/PhysicsEngine';
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
  onStonesStopped: (msg: Extract<C2SMessage, { type: 'stones_stopped' }>) => void;
  onPositionsUpdate: (msg: Extract<C2SMessage, { type: 'positions_update' }>) => void;
}

const POSITION_STREAM_INTERVAL_MS = 33; // ~30 Hz

export function GameCanvas({
  playerIndex,
  config,
  incomingMessage,
  onShoot,
  onStonesStopped,
  onPositionsUpdate,
}: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const physicsRef = useRef<PhysicsEngine | null>(null);
  const gameStateRef = useRef<GameState | null>(null);
  const rendererRef = useRef<Renderer | null>(null);
  const aimRef = useRef<AimVector | null>(null);
  const stoppedSentRef = useRef(false);

  // Keep latest callbacks stable so refs avoid stale closures
  const onShootRef = useRef(onShoot);
  onShootRef.current = onShoot;
  const onStoppedRef = useRef(onStonesStopped);
  onStoppedRef.current = onStonesStopped;
  const onPositionsUpdateRef = useRef(onPositionsUpdate);
  onPositionsUpdateRef.current = onPositionsUpdate;

  const lastStreamAtRef = useRef(0);

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

    const physics = new PhysicsEngine(config);
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
      state.markShot();
      physicsRef.current?.applyForce(`${playerIndex}-${e.stoneIndex}`, e.forceX, e.forceY);
      stoppedSentRef.current = false;
      onShootRef.current({ type: 'shoot', forceX: e.forceX, forceY: e.forceY, stoneIndex: e.stoneIndex });
    };

    input.attach();
    physicsRef.current = physics;
    gameStateRef.current = gs;
    rendererRef.current = renderer;

    return () => {
      input.detach();
      physics.destroy();
    };
  }, [config, playerIndex]);

  // React to each server message
  useEffect(() => {
    if (!incomingMessage) return;
    const physics = physicsRef.current;
    const gs = gameStateRef.current;
    if (!physics || !gs) return;

    if (incomingMessage.type === 'turn_change') {
      const { activePlayer, throwsRemaining, positions } = incomingMessage;
      gs.applyTurnChange(activePlayer, throwsRemaining);
      stoppedSentRef.current = false;

      if (positions) {
        for (const p of positions) {
          const px = p.x * config.field.width;
          const py = p.y * config.field.height;
          physics.setPosition(`${p.player}-${p.index}`, px, py);
          const stone = gs.stones.find((s) => s.player === p.player && s.index === p.index);
          if (stone) { stone.x = px; stone.y = py; }
        }
      }

      if (throwsRemaining[activePlayer] > 0) {
        const stoneIdx = config.stones.perPlayer - throwsRemaining[activePlayer];
        const startX = config.field.width * 0.5;
        const startY = config.field.height * 0.88;
        const id = `${activePlayer}-${stoneIdx}`;
        physics.addStone(id, startX, startY);
        gs.addStone(activePlayer, stoneIdx, startX, startY);
      }
    }

    if (incomingMessage.type === 'opponent_shot') {
      const { forceX, forceY, stoneIndex } = incomingMessage;
      const opponentIndex: 0 | 1 = playerIndex === 0 ? 1 : 0;
      gs.markShot();
      physics.applyForce(`${opponentIndex}-${stoneIndex}`, forceX, forceY);
      stoppedSentRef.current = false;
    }

    if (incomingMessage.type === 'opponent_positions') {
      for (const p of incomingMessage.stones) {
        const px = p.x * config.field.width;
        const py = p.y * config.field.height;
        physics.setPosition(`${p.player}-${p.index}`, px, py);
        const stone = gs.stones.find((s) => s.player === p.player && s.index === p.index);
        if (stone) { stone.x = px; stone.y = py; }
      }
    }

    if (incomingMessage.type === 'restarting') {
      physics.reset();
      gs.start(0, incomingMessage.stonesPerPlayer);
      stoppedSentRef.current = false;
      aimRef.current = null;
    }
  }, [incomingMessage, config, playerIndex]);

  const gameLoop = useCallback(
    (delta: number) => {
      const physics = physicsRef.current;
      const gs = gameStateRef.current;
      const renderer = rendererRef.current;
      if (!physics || !gs || !renderer) return;

      if (gs.phase === 'sliding') {
        physics.step(delta);
        gs.syncPositions(physics.getPositions());

        const now = performance.now();

        // Active player streams positions so the opponent sees movement reliably
        if (
          gs.activePlayer === playerIndex &&
          now - lastStreamAtRef.current >= POSITION_STREAM_INTERVAL_MS
        ) {
          lastStreamAtRef.current = now;
          const stones: StonePosition[] = gs.stones.map((s) => ({
            player: s.player,
            index: s.index,
            x: s.x / config.field.width,
            y: s.y / config.field.height,
          }));
          onPositionsUpdateRef.current({ type: 'positions_update', stones });
        }

        if (!stoppedSentRef.current && physics.checkStopped(now)) {
          gs.markStopped();
          stoppedSentRef.current = true;

          const stones: StonePosition[] = gs.stones.map((s) => ({
            player: s.player,
            index: s.index,
            x: s.x / config.field.width,
            y: s.y / config.field.height,
          }));
          onStoppedRef.current({ type: 'stones_stopped', stones });
        }
      }

      renderer.draw(gs, renderScaleRef.current, gs.phase === 'aiming' ? aimRef.current : null);
    },
    [config, playerIndex],
  );

  useGameLoop(gameLoop, true);

  return (
    <div className="w-full h-full flex items-center justify-center overflow-hidden">
      <canvas ref={canvasRef} className="touch-none" />
    </div>
  );
}
