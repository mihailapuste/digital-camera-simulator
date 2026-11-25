import {
  resolveStampDate,
  type DateStampOptions,
  type StampFormat,
} from '../look';

export type StampSettings = {
  dateStampEnabled: boolean;
  dateStampFormat: StampFormat;
  dateStampClock: 'current' | 'retro-year';
  retroYear: number;
};

export function stampFromSettings(
  settings: StampSettings,
): DateStampOptions | null {
  if (!settings.dateStampEnabled) {
    return null;
  }
  return {
    enabled: true,
    format: settings.dateStampFormat,
    clock:
      settings.dateStampClock === 'current'
        ? {kind: 'current'}
        : {kind: 'retro-year', year: settings.retroYear},
  };
}

/** YYYY.MM.DD for the LCD, using the same calendar day the stamp will burn. */
export function lcdDateLabel(settings: StampSettings, now = new Date()): string {
  const date = resolveStampDate(
    settings.dateStampClock === 'current'
      ? {kind: 'current'}
      : {kind: 'retro-year', year: settings.retroYear},
    now,
  );
  const month = String(date.month).padStart(2, '0');
  const day = String(date.day).padStart(2, '0');
  return `${date.year}.${month}.${day}`;
}
