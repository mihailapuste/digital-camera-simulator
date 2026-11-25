/** One rocker click. Wide is toward `min`, tele is toward `max`. */
export function stepZoom(
  current: number,
  direction: 'in' | 'out',
  min: number,
  max: number,
): number {
  const floor = Math.min(min, max);
  const ceil = Math.max(min, max);
  const next = current * (direction === 'in' ? 1.25 : 0.8);
  const clamped = Math.min(ceil, Math.max(floor, next));
  return Math.round(clamped * 100) / 100;
}

export function restingZoom(min: number, max: number): number {
  const floor = Math.min(min, max);
  const ceil = Math.max(min, max);
  return Math.min(ceil, Math.max(floor, 1));
}
