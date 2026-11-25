import type {
  DateStampOptions,
  ResolvedStamp,
  StampClock,
  StampDate,
  StampFormat,
} from './types';
import {STAMP_FORMATS} from './types';

export const DEFAULT_STAMP_COLOR = '#FF8A14';

export const DEFAULT_STAMP: {
  enabled: true;
  clock: {kind: 'retro-year'; year: number};
  format: StampFormat;
  color: string;
  opacity: number;
  glow: number;
} = {
  enabled: true,
  clock: {kind: 'retro-year', year: 2004},
  format: 'yy mm dd',
  color: DEFAULT_STAMP_COLOR,
  opacity: 0.94,
  glow: 0.8,
};

const DAYS_IN_MONTH = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

export function daysInMonth(year: number, month: number): number {
  if (month === 2 && isLeapYear(year)) {
    return 29;
  }
  return DAYS_IN_MONTH[month] ?? 0;
}

export function isValidStampDate(date: StampDate): boolean {
  if (
    !Number.isInteger(date.year) ||
    !Number.isInteger(date.month) ||
    !Number.isInteger(date.day)
  ) {
    return false;
  }
  if (date.year < 1980 || date.year > 2099) {
    return false;
  }
  if (date.month < 1 || date.month > 12) {
    return false;
  }
  return date.day >= 1 && date.day <= daysInMonth(date.year, date.month);
}

export function assertValidStampDate(date: StampDate): void {
  if (!isValidStampDate(date)) {
    const year = String(date.year).padStart(4, '0');
    const month = String(date.month).padStart(2, '0');
    const day = String(date.day).padStart(2, '0');
    throw new Error(`Invalid stamp date ${year}-${month}-${day}`);
  }
}

function pad2(value: number): string {
  return String(value).padStart(2, '0');
}

/** Two-digit year with the leading apostrophe used on compact LCDs. */
export function formatShortYear(year: number): string {
  return `'${pad2(year % 100)}`;
}

export function formatStampText(date: StampDate, format: StampFormat): string {
  assertValidStampDate(date);
  const yyyy = String(date.year);
  const yy = formatShortYear(date.year);
  const mm = pad2(date.month);
  const dd = pad2(date.day);
  switch (format) {
    case 'yy mm dd':
      return `${yy} ${mm} ${dd}`;
    case 'yyyy.mm.dd':
      return `${yyyy}.${mm}.${dd}`;
    case 'yy.mm.dd':
      return `${yy}.${mm}.${dd}`;
    case 'dd.mm.yy':
      return `${dd}.${mm}.${yy}`;
    case 'mm/dd/yy':
      return `${mm}/${dd}/${yy}`;
    default: {
      const unknown: never = format;
      throw new Error(`Unsupported stamp format ${String(unknown)}`);
    }
  }
}

export function isStampFormat(value: string): value is StampFormat {
  return (STAMP_FORMATS as readonly string[]).includes(value);
}

/**
 * Resolves the calendar day. A retro year that is not a leap year falls
 * back from February 29 to February 28 so "today, but in 2003" still stamps.
 */
export function resolveStampDate(clock: StampClock, now: Date): StampDate {
  if (clock.kind === 'fixed') {
    const date = {year: clock.year, month: clock.month, day: clock.day};
    assertValidStampDate(date);
    return date;
  }
  const month = now.getMonth() + 1;
  const day = now.getDate();
  const year = clock.kind === 'retro-year' ? clock.year : now.getFullYear();
  const date = {year, month, day};
  if (!isValidStampDate(date) && month === 2 && day === 29) {
    return {year, month, day: 28};
  }
  assertValidStampDate(date);
  return date;
}

function clamp01(value: number, label: string): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new Error(`${label} must be a finite number`);
  }
  return Math.min(1, Math.max(0, value));
}

/**
 * `undefined` uses the 2004 retro-year default. `null` or `enabled: false`
 * turns the stamp off.
 */
export function resolveStamp(
  options: DateStampOptions | null | undefined,
  now: Date,
): ResolvedStamp | null {
  if (options === null || options?.enabled === false) {
    return null;
  }
  const format = options?.format ?? DEFAULT_STAMP.format;
  if (!isStampFormat(format)) {
    throw new Error(`Unsupported stamp format ${String(format)}`);
  }
  const clock = options?.clock ?? DEFAULT_STAMP.clock;
  const date = resolveStampDate(clock, now);
  return {
    text: formatStampText(date, format),
    date,
    format,
    color: options?.color ?? DEFAULT_STAMP.color,
    opacity: clamp01(options?.opacity ?? DEFAULT_STAMP.opacity, 'opacity'),
    glow: clamp01(options?.glow ?? DEFAULT_STAMP.glow, 'glow'),
  };
}
