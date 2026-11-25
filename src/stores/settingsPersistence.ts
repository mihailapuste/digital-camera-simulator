import {applySnapshot, onSnapshot} from 'mobx-state-tree';
import {
  ISettingsStore,
  normalizeSettingsSnapshot,
} from './SettingsStore';

export const SETTINGS_STORAGE_KEY = 'digicamsim.settings.v1';

export type SettingsStorage = {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
};

export async function hydrateSettings(
  store: ISettingsStore,
  storage: SettingsStorage,
): Promise<void> {
  const raw = await storage.getItem(SETTINGS_STORAGE_KEY);
  if (!raw) {
    return;
  }
  const parsed: unknown = JSON.parse(raw);
  applySnapshot(store, normalizeSettingsSnapshot(parsed));
}

/**
 * Writes an MST snapshot whenever settings change. Returns an unsubscribe.
 * The first call can ignore writes until hydration has applied the stored
 * snapshot, so defaults do not clobber a save that is still loading.
 */
export function watchSettings(
  store: ISettingsStore,
  storage: SettingsStorage,
  options?: {isMuted?: () => boolean},
): () => void {
  return onSnapshot(store, snapshot => {
    if (options?.isMuted?.()) {
      return;
    }
    storage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(snapshot)).catch(
      error => {
        console.error('Could not persist camera settings:', error);
      },
    );
  });
}
