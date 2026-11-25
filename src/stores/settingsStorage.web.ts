import {
  SETTINGS_STORAGE_KEY,
  type SettingsStorage,
} from './settingsPersistence';

export const settingsStorage: SettingsStorage = {
  async getItem(key: string) {
    try {
      return globalThis.localStorage?.getItem(key) ?? null;
    } catch (error) {
      console.error('Could not read camera settings:', error);
      return null;
    }
  },
  async setItem(key: string, value: string) {
    if (key !== SETTINGS_STORAGE_KEY) {
      return;
    }
    try {
      globalThis.localStorage?.setItem(key, value);
    } catch (error) {
      console.error('Could not write camera settings:', error);
    }
  },
};
