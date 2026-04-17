import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function distancePx(x1: number, y1: number, x2: number, y2: number): number {
  return Math.hypot(x2 - x1, y2 - y1);
}

export function normalizedToCanvas(
  nx: number,
  ny: number,
  canvasW: number,
  canvasH: number,
): { x: number; y: number } {
  return { x: nx * canvasW, y: ny * canvasH };
}

export function canvasToNormalized(
  px: number,
  py: number,
  canvasW: number,
  canvasH: number,
): { x: number; y: number } {
  return { x: px / canvasW, y: py / canvasH };
}

export function clampForce(magnitude: number, maxForce: number): number {
  return Math.min(magnitude, maxForce);
}
