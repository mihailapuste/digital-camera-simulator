import {getSnapshot, types, Instance} from 'mobx-state-tree';
import {STAMP_FORMATS, type StampFormat} from '../look';
import type {FlashMode} from '../lcd/types';

const FLASH_MODES = ['auto', 'on', 'off', 'red-eye'] as const;
const CLOCKS = ['current', 'retro-year'] as const;
const FACING = ['front', 'back'] as const;

export const DEFAULT_RETRO_YEAR = 2004;

export const SettingsStore = types
  .model('SettingsStore')
  .props({
    flashMode: types.optional(types.enumeration(FLASH_MODES), 'auto'),
    cameraPosition: types.optional(types.enumeration(FACING), 'back'),
    saveToGallery: types.optional(types.boolean, true),
    showGridLines: types.optional(types.boolean, false),
    presetId: types.optional(types.string, 'ccd-classic'),
    dateStampEnabled: types.optional(types.boolean, true),
    dateStampFormat: types.optional(
      types.enumeration(STAMP_FORMATS),
      'yy mm dd',
    ),
    dateStampClock: types.optional(types.enumeration(CLOCKS), 'retro-year'),
    retroYear: types.optional(types.number, DEFAULT_RETRO_YEAR),
    shutterSound: types.optional(types.boolean, true),
  })
  .actions(self => ({
    setFlashMode(mode: FlashMode) {
      self.flashMode = mode;
    },
    cycleFlash() {
      const index = FLASH_MODES.indexOf(self.flashMode);
      self.flashMode = FLASH_MODES[(index + 1) % FLASH_MODES.length];
    },
    setCameraPosition(position: 'front' | 'back') {
      self.cameraPosition = position;
    },
    toggleCameraPosition() {
      self.cameraPosition = self.cameraPosition === 'back' ? 'front' : 'back';
    },
    setSaveToGallery(save: boolean) {
      self.saveToGallery = save;
    },
    setShowGridLines(show: boolean) {
      self.showGridLines = show;
    },
    setPresetId(id: string) {
      self.presetId = id;
    },
    setDateStampEnabled(enabled: boolean) {
      self.dateStampEnabled = enabled;
    },
    setDateStampFormat(format: StampFormat) {
      self.dateStampFormat = format;
    },
    cycleDateStampFormat() {
      const index = STAMP_FORMATS.indexOf(self.dateStampFormat);
      self.dateStampFormat =
        STAMP_FORMATS[(index + 1) % STAMP_FORMATS.length];
    },
    setDateStampClock(clock: 'current' | 'retro-year') {
      self.dateStampClock = clock;
    },
    setRetroYear(year: number) {
      self.retroYear = year;
    },
    setShutterSound(enabled: boolean) {
      self.shutterSound = enabled;
    },
  }));

export type ISettingsStore = Instance<typeof SettingsStore>;

export type SettingsSnapshot = {
  flashMode: FlashMode;
  cameraPosition: 'front' | 'back';
  saveToGallery: boolean;
  showGridLines: boolean;
  presetId: string;
  dateStampEnabled: boolean;
  dateStampFormat: StampFormat;
  dateStampClock: 'current' | 'retro-year';
  retroYear: number;
  shutterSound: boolean;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function pickEnum<T extends string>(
  value: unknown,
  allowed: readonly T[],
  fallback: T,
): T {
  return typeof value === 'string' && allowed.includes(value as T)
    ? (value as T)
    : fallback;
}

function pickBool(value: unknown, fallback: boolean): boolean {
  return typeof value === 'boolean' ? value : fallback;
}

/**
 * Merge a stored MST snapshot onto the current defaults. Unknown or stale
 * values fall back instead of throwing, so an older install still boots.
 */
export function normalizeSettingsSnapshot(raw: unknown): SettingsSnapshot {
  const defaults = getSnapshot(SettingsStore.create({}));
  if (!isRecord(raw)) {
    return defaults;
  }
  const retroYear =
    typeof raw.retroYear === 'number' &&
    Number.isInteger(raw.retroYear) &&
    raw.retroYear >= 1980 &&
    raw.retroYear <= 2099
      ? raw.retroYear
      : defaults.retroYear;
  const presetId =
    typeof raw.presetId === 'string' && raw.presetId.trim().length > 0
      ? raw.presetId
      : defaults.presetId;
  return {
    flashMode: pickEnum(raw.flashMode, FLASH_MODES, defaults.flashMode),
    cameraPosition: pickEnum(
      raw.cameraPosition,
      FACING,
      defaults.cameraPosition,
    ),
    saveToGallery: pickBool(raw.saveToGallery, defaults.saveToGallery),
    showGridLines: pickBool(raw.showGridLines, defaults.showGridLines),
    presetId,
    dateStampEnabled: pickBool(
      raw.dateStampEnabled,
      defaults.dateStampEnabled,
    ),
    dateStampFormat: pickEnum(
      raw.dateStampFormat,
      STAMP_FORMATS,
      defaults.dateStampFormat,
    ),
    dateStampClock: pickEnum(
      raw.dateStampClock,
      CLOCKS,
      defaults.dateStampClock,
    ),
    retroYear,
    shutterSound: pickBool(raw.shutterSound, defaults.shutterSound),
  };
}
