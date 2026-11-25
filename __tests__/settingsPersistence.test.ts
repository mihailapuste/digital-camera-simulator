import {applySnapshot, getSnapshot} from 'mobx-state-tree';
import {
  SettingsStore,
  normalizeSettingsSnapshot,
} from '../src/stores/SettingsStore';
import {
  SETTINGS_STORAGE_KEY,
  hydrateSettings,
  watchSettings,
  type SettingsStorage,
} from '../src/stores/settingsPersistence';

function memory(): SettingsStorage & {data: Map<string, string>} {
  const data = new Map<string, string>();
  return {
    data,
    async getItem(key) {
      return data.get(key) ?? null;
    },
    async setItem(key, value) {
      data.set(key, value);
    },
  };
}

test('settings snapshot round-trips every camera preference', () => {
  const store = SettingsStore.create({});
  store.setPresetId('bw-mode');
  store.setFlashMode('red-eye');
  store.cycleFlash();
  expect(store.flashMode).toBe('auto');
  store.setDateStampEnabled(false);
  store.setDateStampFormat('dd.mm.yy');
  store.cycleDateStampFormat();
  expect(store.dateStampFormat).toBe('mm/dd/yy');
  store.setDateStampClock('current');
  store.setRetroYear(2003);
  store.setShutterSound(false);
  store.setSaveToGallery(false);
  store.setShowGridLines(true);
  store.toggleCameraPosition();
  const snap = getSnapshot(store);
  const next = SettingsStore.create({});
  applySnapshot(next, snap);
  expect(getSnapshot(next)).toEqual(snap);
  expect(next.cameraPosition).toBe('front');
  expect(next.retroYear).toBe(2003);
  expect(next.shutterSound).toBe(false);
});

test('an older snapshot keeps its values and gains the new defaults', () => {
  const normalized = normalizeSettingsSnapshot({
    flashMode: 'off',
    cameraPosition: 'front',
    saveToGallery: false,
    showGridLines: true,
    presetId: '',
    dateStampFormat: 'nope',
    retroYear: 12,
    flash: 'banana',
  });
  expect(normalized.flashMode).toBe('off');
  expect(normalized.cameraPosition).toBe('front');
  expect(normalized.saveToGallery).toBe(false);
  expect(normalized.showGridLines).toBe(true);
  expect(normalized.presetId).toBe('ccd-classic');
  expect(normalized.dateStampFormat).toBe('yy mm dd');
  expect(normalized.dateStampClock).toBe('retro-year');
  expect(normalized.retroYear).toBe(2004);
  expect(normalized.shutterSound).toBe(true);
  expect(normalized.dateStampEnabled).toBe(true);
  const store = SettingsStore.create({});
  applySnapshot(store, normalized);
  expect(store.flashMode).toBe('off');
});

test('hydration restores a snapshot and later edits are written back', async () => {
  const storage = memory();
  storage.data.set(
    SETTINGS_STORAGE_KEY,
    JSON.stringify({
      flashMode: 'on',
      presetId: 'night-flash',
      shutterSound: false,
      dateStampClock: 'current',
    }),
  );
  const store = SettingsStore.create({});
  await hydrateSettings(store, storage);
  expect(store.flashMode).toBe('on');
  expect(store.presetId).toBe('night-flash');
  expect(store.shutterSound).toBe(false);
  expect(store.dateStampClock).toBe('current');
  expect(store.saveToGallery).toBe(true);

  let muted = true;
  const stop = watchSettings(store, storage, {isMuted: () => muted});
  store.setShowGridLines(true);
  expect(JSON.parse(storage.data.get(SETTINGS_STORAGE_KEY) ?? '{}').showGridLines).toBeUndefined();
  muted = false;
  store.setSaveToGallery(false);
  await Promise.resolve();
  const saved = JSON.parse(storage.data.get(SETTINGS_STORAGE_KEY) ?? '{}');
  expect(saved.saveToGallery).toBe(false);
  expect(saved.presetId).toBe('night-flash');
  expect(saved.showGridLines).toBe(true);
  stop();
});
