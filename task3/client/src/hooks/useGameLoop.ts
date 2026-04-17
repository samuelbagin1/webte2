import { useEffect, useRef } from 'react';

export function useGameLoop(
  callback: (deltaMs: number) => void,
  running: boolean,
): void {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    if (!running) return;
    let rafId: number;
    let lastTime: number | null = null;

    const loop = (now: number) => {
      const delta = lastTime !== null ? now - lastTime : 0;
      lastTime = now;
      callbackRef.current(delta);
      rafId = requestAnimationFrame(loop);
    };

    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
  }, [running]);
}
