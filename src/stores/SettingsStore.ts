import {types, Instance} from 'mobx-state-tree';

export const SettingsStore = types
  .model('SettingsStore')
  .props({
    flashMode: types.optional(
      types.enumeration(['off', 'on', 'auto']),
      'off'
    ),
    cameraPosition: types.optional(
      types.enumeration(['front', 'back']),
      'back'
    ),
    saveToGallery: types.optional(types.boolean, true),
    showGridLines: types.optional(types.boolean, false),
  })
  .actions(self => ({
    setFlashMode(mode: 'off' | 'on' | 'auto') {
      self.flashMode = mode;
    },
    setCameraPosition(position: 'front' | 'back') {
      self.cameraPosition = position;
    },
    setSaveToGallery(save: boolean) {
      self.saveToGallery = save;
    },
    setShowGridLines(show: boolean) {
      self.showGridLines = show;
    },
  }));

export interface ISettingsStore extends Instance<typeof SettingsStore> {}
