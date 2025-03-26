import {types, Instance} from 'mobx-state-tree';
import {SettingsStore} from './SettingsStore';

/**
 * Root store that contains all the sub-stores for the application
 */
export const RootStore = types
  .model('RootStore')
  .props({
    settingsStore: types.optional(SettingsStore, {}),
  })
  .actions(_self => ({
    // Add any root-level actions here
    reset() {
      // Reset all stores to their default state if needed
    },
  }));

export interface IRootStore extends Instance<typeof RootStore> {}

// Create the store instance
export const createRootStore = () => {
  return RootStore.create({
    settingsStore: {},
  });
};
