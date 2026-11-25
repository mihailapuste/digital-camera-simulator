import {File, Paths} from 'expo-file-system';
import {
  SETTINGS_STORAGE_KEY,
  type SettingsStorage,
} from './settingsPersistence';

const FILE_NAME = 'digicamsim-settings.json';

function settingsFile(): File {
  return new File(Paths.document, FILE_NAME);
}

export const settingsStorage: SettingsStorage = {
  async getItem(key: string) {
    if (key !== SETTINGS_STORAGE_KEY) {
      return null;
    }
    const file = settingsFile();
    if (!file.exists) {
      return null;
    }
    return file.text();
  },
  async setItem(key: string, value: string) {
    if (key !== SETTINGS_STORAGE_KEY) {
      return;
    }
    const file = settingsFile();
    if (!file.exists) {
      file.create();
    }
    await file.write(value);
  },
};
