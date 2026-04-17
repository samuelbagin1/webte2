import { useEffect, useRef, useState } from 'react';

export interface CanvasSize {
  width: number;
  height: number;
  scale: number; // combined CSS-fit + devicePixelRatio factor
}

export function useResponsiveCanvas(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  logicalWidth: number,
  logicalHeight: number,
): CanvasSize {
  const [size, setSize] = useState<CanvasSize>({ width: logicalWidth, height: logicalHeight, scale: 1 });
  const observerRef = useRef<ResizeObserver | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const update = (cssW: number, cssH: number) => {
      const dpr = window.devicePixelRatio || 1;
      const scale = Math.min(cssW / logicalWidth, cssH / logicalHeight);
      canvas.width = Math.round(logicalWidth * scale * dpr);
      canvas.height = Math.round(logicalHeight * scale * dpr);
      canvas.style.width = `${logicalWidth * scale}px`;
      canvas.style.height = `${logicalHeight * scale}px`;
      setSize({ width: canvas.width, height: canvas.height, scale: scale * dpr });
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
