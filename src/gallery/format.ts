const MONTHS = [
  'JAN',
  'FEB',
  'MAR',
  'APR',
  'MAY',
  'JUN',
  'JUL',
  'AUG',
  'SEP',
  'OCT',
  'NOV',
  'DEC',
];

function parts(timestamp: number): Date {
  return new Date(timestamp);
}

/** Playback header, `04.11.24`. */
export function formatPlaybackDate(timestamp: number): string {
  const date = parts(timestamp);
  const year = String(date.getFullYear()).slice(-2);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}.${month}.${day}`;
}

/** Burned-in stamp text, `04 11 24`. */
export function formatStampDate(timestamp: number): string {
  const date = parts(timestamp);
  const year = String(date.getFullYear()).slice(-2);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year} ${month} ${day}`;
}

/** `24 NOV 2004`. */
export function formatLongDate(timestamp: number): string {
  const date = parts(timestamp);
  const day = String(date.getDate()).padStart(2, '0');
  return `${day} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

/** 24-hour `18:42`, the way a compact's playback screen reads. */
export function formatPlaybackTime(timestamp: number): string {
  const date = parts(timestamp);
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

export function dayKey(timestamp: number): string {
  const date = parts(timestamp);
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
}

/** Local month and day for a fixed 2004 stamp clock. */
export function stampParts(timestamp: number): {month: number; day: number} {
  const date = parts(timestamp);
  return {month: date.getMonth() + 1, day: date.getDate()};
}
