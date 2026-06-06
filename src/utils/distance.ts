import { Point } from '../types/models';

export function distance(a: Point, b: Point) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

export function clampPoint(point: Point, width: number, height: number, padding = 24): Point {
  return {
    x: Math.min(Math.max(point.x, padding), width - padding),
    y: Math.min(Math.max(point.y, padding), height - padding)
  };
}
