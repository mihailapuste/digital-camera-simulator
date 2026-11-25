import {types, flow, Instance} from 'mobx-state-tree';
import {
  deletePhoto,
  importDataUrl,
  importFile,
  listPhotos,
  saveToDeviceLibrary,
} from '../services/photoLibrary';

/**
 * Store to handle camera operations and image storage.
 * Paths are display URIs (`file://` on native, data URLs on web).
 */
export const CameraStore = types
  .model('CameraStore')
  .props({
    images: types.array(types.string),
    isCapturing: types.optional(types.boolean, false),
    lastImagePath: types.optional(types.string, ''),
  })
  .views(self => ({
    get imageCount() {
      return self.images.length;
    },
  }))
  .actions(self => {
    const remember = (uri: string) => {
      const withoutCurrent = self.images.filter(image => image !== uri);
      self.images.replace([uri, ...withoutCurrent]);
      self.lastImagePath = uri;
    };

    return {
      setCapturing(isCapturing: boolean) {
        self.isCapturing = isCapturing;
      },

      clearImages() {
        self.images.clear();
        self.lastImagePath = '';
      },

      removeImage(path: string) {
        const index = self.images.findIndex(imagePath => imagePath === path);
        if (index === -1) {
          return;
        }
        self.images.splice(index, 1);
        void deletePhoto(path).catch(error => {
          console.error('Error deleting image file:', error);
        });
        if (self.lastImagePath === path) {
          self.lastImagePath = self.images[0] ?? '';
        }
      },

      loadPhotos: flow(function* () {
        try {
          const photos: Awaited<ReturnType<typeof listPhotos>> =
            yield listPhotos();
          self.images.replace(photos.map(photo => photo.uri));
          self.lastImagePath = photos[0]?.uri ?? '';
          return self.images;
        } catch (error) {
          console.error('Error loading photos:', error);
          return [];
        }
      }),

      loadLatestPhoto: flow(function* () {
        try {
          const photos: Awaited<ReturnType<typeof listPhotos>> =
            yield listPhotos();
          self.lastImagePath = photos[0]?.uri ?? '';
          return self.lastImagePath || null;
        } catch (error) {
          console.error('Error loading latest photo:', error);
          return null;
        }
      }),

      saveCapturedPhoto: flow(function* (sourcePath: string) {
        try {
          const photo: Awaited<ReturnType<typeof importFile>> =
            yield importFile(sourcePath);
          remember(photo.uri);
          return photo.uri;
        } catch (error) {
          console.error('Error saving captured photo:', error);
          return null;
        }
      }),

      importUploadedPhoto: flow(function* (dataUrl: string) {
        try {
          const photo: Awaited<ReturnType<typeof importDataUrl>> =
            yield importDataUrl(dataUrl);
          remember(photo.uri);
          return photo.uri;
        } catch (error) {
          console.error('Error importing uploaded photo:', error);
          return null;
        }
      }),

      saveToGallery: flow(function* (imagePath: string) {
        try {
          const result: Awaited<ReturnType<typeof saveToDeviceLibrary>> =
            yield saveToDeviceLibrary(imagePath);
          return result;
        } catch (error) {
          console.error('Error saving to gallery:', error);
          throw error;
        }
      }),
    };
  });

export type ICameraStore = Instance<typeof CameraStore>;
