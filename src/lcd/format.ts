export function formatLcdDate(input?: Date | string): string {
  if (typeof input === 'string') {
    return input;
  }
  const date = input ?? new Date();
  if (Number.isNaN(date.getTime())) {
    return '0000.00.00';
  }
  const year = String(date.getUTCFullYear()).padStart(4, '0');
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}.${month}.${day}`;
}

export function formatShots(value: number): string {
  if (!Number.isFinite(value)) {
    return '0';
  }
  return String(Math.max(0, Math.min(9999, Math.floor(value))));
}
