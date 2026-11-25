import {types, flow, Instance} from 'mobx-state-tree';
import {fileNumberFromIndex} from '../gallery/fileNumber';
import {compareNewestFirst} from '../gallery/groupPhotos';
import {fileNameFromUri, timestampFromName} from '../gallery/metadata';
import type {CaptureMetaInput, GalleryPhoto, PhotoMeta} from '../gallery/types';
import {
  deletePhoto,
  importDataUrl,
  importFile,
  listPhotos,
  replacePhoto,
  saveToDeviceLibrary,
} from '../services/photoLibrary';
import type {StoredPhoto} from '../services/photoLibrary.types';

export type {CaptureMetaInput, GalleryPhoto};

/**
 * One playback record. Keyed by the stored file name so a web data URL can
 * change when a legacy photo is baked without losing its file number.
 */
const PhotoRecord = types.model('PhotoRecord', {
  name: types.identifier,
  uri: types.string,
  timestamp: types.number,
  presetId: types.maybeNull(types.string),
  fileNumber: types.string,
  lookBaked: types.optional(types.boolean, false),
  revision: types.optional(types.number, 0),
});

function recordSnapshot(photo: StoredPhoto, meta: PhotoMeta) {
  return {
    name: photo.name,
    uri: photo.uri,
    timestamp: meta.timestamp,
    presetId: meta.presetId,
    fileNumber: meta.fileNumber,
    lookBaked: meta.lookBaked,
    revision: meta.revision,
  };
}

/**
 * Store to handle camera operations and image storage.
 * Paths are display URIs (`file://` on native, data URLs on web).
 * `images` stays a list of URI strings. Playback metadata lives in `records`.
 */
export const CameraStore = types
  .model('CameraStore')
  .props({
    images: types.array(types.string),
    records: types.optional(types.map(PhotoRecord), {}),
    isCapturing: types.optional(types.boolean, false),
    lastImagePath: types.optional(types.string, ''),
  })
  .views(self => ({
    get imageCount() {
      return self.images.length;
    },
    /**
     * Newest first, aligned with `images`. Photos with no record still appear
     * so older files remain viewable.
     */
    get playbackPhotos(): GalleryPhoto[] {
      const byUri = new Map<string, GalleryPhoto>();
      for (const record of self.records.values()) {
        byUri.set(record.uri, {
          uri: record.uri,
          name: record.name,
          timestamp: record.timestamp,
          presetId: record.presetId,
          fileNumber: record.fileNumber,
          lookBaked: record.lookBaked,
          revision: record.revision,
        });
      }
      const total = self.images.length;
      return self.images.map((uri, index) => {
        const known = byUri.get(uri);
        if (known) {
          return known;
        }
        const name = fileNameFromUri(uri);
        const oldestRank = total - index;
        return {
          uri,
          name,
          timestamp: timestampFromName(name, 0),
          presetId: null,
          fileNumber: fileNumberFromIndex(Math.max(1, oldestRank)),
          lookBaked: false,
          revision: 0,
        };
      });
    },
  }))
  .actions(self => {
    const remember = (photo: StoredPhoto) => {
      const withoutCurrent = self.images.filter(image => image !== photo.uri);
      self.images.replace([photo.uri, ...withoutCurrent]);
      self.lastImagePath = photo.uri;
      if (photo.meta) {
        self.records.put(recordSnapshot(photo, photo.meta));
      }
    };

    const putPhoto = (photo: StoredPhoto) => {
      if (!photo.meta) {
        return;
      }
      self.records.put(recordSnapshot(photo, photo.meta));
    };

    return {
      setCapturing(isCapturing: boolean) {
        self.isCapturing = isCapturing;
      },

      clearImages() {
        self.images.clear();
        self.records.clear();
        self.lastImagePath = '';
      },

      removeImage(path: string) {
        const index = self.images.findIndex(imagePath => imagePath === path);
        if (index === -1) {
          return;
        }
        const record = [...self.records.values()].find(
          item => item.uri === path,
        );
        self.images.splice(index, 1);
        if (record) {
          self.records.delete(record.name);
        }
        void deletePhoto(path).catch(error => {
          console.error('Error deleting image file:', error);
        });
        if (self.lastImagePath === path) {
          self.lastImagePath = self.images[0] ?? '';
        }
      },

      loadPhotos: flow(function* () {
        try {
          const photos: StoredPhoto[] = yield listPhotos();
          const ordered = [...photos].sort((a, b) =>
            compareNewestFirst(
              {
                timestamp: a.meta?.timestamp ?? a.modifiedAt,
                fileNumber: a.meta?.fileNumber ?? '',
              },
              {
                timestamp: b.meta?.timestamp ?? b.modifiedAt,
                fileNumber: b.meta?.fileNumber ?? '',
              },
            ),
          );
          self.images.replace(ordered.map(photo => photo.uri));
          self.records.clear();
          for (const photo of ordered) {
            putPhoto(photo);
          }
          self.lastImagePath = ordered[0]?.uri ?? '';
          return self.images;
        } catch (error) {
          console.error('Error loading photos:', error);
          return [];
        }
      }),

      loadLatestPhoto: flow(function* () {
        try {
          const photos: StoredPhoto[] = yield listPhotos();
          self.lastImagePath = photos[0]?.uri ?? '';
          return self.lastImagePath || null;
        } catch (error) {
          console.error('Error loading latest photo:', error);
          return null;
        }
      }),

      /**
       * Copies a capture into the library. `capture` is optional so existing
       * callers keep working. The camera screen should pass `presetId` once
       * it has baked the look.
       */
      saveCapturedPhoto: flow(function* (
        sourcePath: string,
        capture?: CaptureMetaInput,
      ) {
        try {
          const photo: StoredPhoto = yield importFile(sourcePath, capture);
          remember(photo);
          return photo.uri;
        } catch (error) {
          console.error('Error saving captured photo:', error);
          return null;
        }
      }),

      importUploadedPhoto: flow(function* (
        dataUrl: string,
        capture?: CaptureMetaInput,
      ) {
        try {
          const photo: StoredPhoto = yield importDataUrl(dataUrl, capture);
          remember(photo);
          return photo.uri;
        } catch (error) {
          console.error('Error importing uploaded photo:', error);
          return null;
        }
      }),

      /**
       * Replaces a legacy photo's bytes with a baked JPEG and records the preset.
       * The file number and capture time stay put.
       */
      replaceWithBakedPhoto: flow(function* (
        uri: string,
        encoded: {base64: string; dataUri: string},
        presetId: string,
      ) {
        try {
          const photo: StoredPhoto = yield replacePhoto(uri, encoded, {
            presetId,
          });
          const index = self.images.findIndex(image => image === uri);
          if (index !== -1 && photo.uri !== uri) {
            self.images[index] = photo.uri;
          }
          if (self.lastImagePath === uri) {
            self.lastImagePath = photo.uri;
          }
          const stale = [...self.records.values()].find(
            item => item.uri === uri,
          );
          if (stale && stale.name !== photo.name) {
            self.records.delete(stale.name);
          }
          if (photo.meta) {
            self.records.put(recordSnapshot(photo, photo.meta));
          }
          return photo.uri;
        } catch (error) {
          console.error('Error baking a look into the photo:', error);
          throw error;
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
