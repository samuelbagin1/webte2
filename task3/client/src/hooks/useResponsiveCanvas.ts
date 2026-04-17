import { useEffect, useRef, useState } from 'react';

export interface CanvasSize {
  width: number;
  height: number;
  /** CSS pixels per logical pixel — use for mouse/touch coordinate conversion */
  cssScale: number;
  /** Device pixels per logical pixel (cssScale × devicePixelRatio) — use for canvas drawing */
  renderScale: number;
}

export function useResponsiveCanvas(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  logicalWidth: number,
  logicalHeight: number,
): CanvasSize {
  const [size, setSize] = useState<CanvasSize>({
    width: logicalWidth,
    height: logicalHeight,
    cssScale: 1,
    renderScale: 1,
  });
  const observerRef = useRef<ResizeObserver | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const update = (cssW: number, cssH: number) => {
      const dpr = window.devicePixelRatio || 1;
      const cssScale = Math.min(cssW / logicalWidth, cssH / logicalHeight);
      canvas.width = Math.round(logicalWidth * cssScale * dpr);
      canvas.height = Math.round(logicalHeight * cssScale * dpr);
      canvas.style.width = `${logicalWidth * cssScale}px`;
      canvas.style.height = `${logicalHeight * cssScale}px`;
      setSize({ width: canvas.width, height: canvas.height, cssScale, renderScale: cssScale * dpr });
    };

    observerRef.current = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) update(entry.contentRect.width, entry.contentRect.height);
    });

    const parent = canvas.parentElement;
    if (parent) {
      observerRef.current.observe(parent);
      update(parent.clientWidth, parent.clientHeight);
    }

    return () => observerRef.current?.disconnect();
  }, [canvasRef, logicalWidth, logicalHeight]);

  return size;
}
