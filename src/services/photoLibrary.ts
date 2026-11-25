import {Alert, Linking} from 'react-native';
import {Directory, File, Paths} from 'expo-file-system';
import {
  Album,
  Asset,
  getPermissionsAsync,
  requestPermissionsAsync,
} from 'expo-media-library';
import {
  emptyPhotoIndex,
  hydratePhotoIndex,
  metaAfterBake,
  metaForNewPhoto,
  parsePhotoIndex,
  type PhotoIndex,
} from '../gallery/metadata';
import {saveWithLibrary, type SaveLibraryResult} from '../gallery/saveAlbum';
import type {CaptureMetaInput} from '../gallery/types';
import {StoredPhoto} from './photoLibrary.types';

const PHOTO_DIR = 'DigiCamSim';
const PHOTO_PREFIX = 'DigiCamSim_';
const INDEX_NAME = 'index.json';

let sequence = 0;
let memoryIndex: PhotoIndex | null = null;

function nextName(extension: 'jpg' | 'png'): string {
  sequence += 1;
  return `${PHOTO_PREFIX}${Date.now()}_${sequence}.${extension}`;
}

function fileNameFromUri(uri: string): string {
  const clean = uri.split('?')[0];
  const name = clean.split('/').pop() ?? '';
  try {
    return decodeURIComponent(name);
  } catch {
    return name;
  }
}

function isStoredPhotoName(name: string): boolean {
  return (
    name.startsWith(PHOTO_PREFIX) &&
    (name.endsWith('.jpg') || name.endsWith('.jpeg') || name.endsWith('.png'))
  );
}

function toFileUri(path: string): string {
  if (
    path.startsWith('file://') ||
    path.startsWith('content://') ||
    path.startsWith('data:') ||
    path.startsWith('blob:') ||
    path.startsWith('http://') ||
    path.startsWith('https://')
  ) {
    return path;
  }
  return `file://${path}`;
}

function photoDirectory(): Directory {
  const directory = new Directory(Paths.document, PHOTO_DIR);
  if (!directory.exists) {
    directory.create({idempotent: true, intermediates: true});
  }
  return directory;
}

function readIndex(): PhotoIndex {
  if (memoryIndex) {
    return memoryIndex;
  }
  try {
    const file = new File(photoDirectory(), INDEX_NAME);
    if (!file.exists) {
      memoryIndex = emptyPhotoIndex();
      return memoryIndex;
    }
    memoryIndex = parsePhotoIndex(file.textSync());
    return memoryIndex;
  } catch (error) {
    console.error('Error reading the photo index:', error);
    memoryIndex = emptyPhotoIndex();
    return memoryIndex;
  }
}

async function writeIndex(index: PhotoIndex): Promise<void> {
  memoryIndex = index;
  const file = new File(photoDirectory(), INDEX_NAME);
  if (!file.exists) {
    file.create();
  }
  await file.write(JSON.stringify(index));
}

export async function listPhotos(): Promise<StoredPhoto[]> {
  try {
    const directory = photoDirectory();
    const photos = directory
      .list()
      .filter(entry => isStoredPhotoName(fileNameFromUri(entry.uri)))
      .map(entry => {
        const file = entry instanceof File ? entry : new File(entry.uri);
        return {
          uri: file.uri,
          name: fileNameFromUri(file.uri),
          modifiedAt: file.lastModified ?? 0,
        };
      });
    const hydrated = hydratePhotoIndex(
      readIndex(),
      photos.map(photo => ({name: photo.name, modifiedAt: photo.modifiedAt})),
    );
    if (hydrated.changed) {
      await writeIndex(hydrated.index);
    }
    return photos
      .map(photo => ({
        ...photo,
        meta: hydrated.index.entries[photo.name],
      }))
      .sort((a, b) => {
        const left = a.meta?.timestamp ?? a.modifiedAt;
        const right = b.meta?.timestamp ?? b.modifiedAt;
        return (
          right - left ||
          (b.meta?.fileNumber ?? '').localeCompare(a.meta?.fileNumber ?? '')
        );
      });
  } catch (error) {
    console.error('Error listing photos:', error);
    return [];
  }
}

export async function importFile(
  sourcePath: string,
  capture?: CaptureMetaInput,
): Promise<StoredPhoto> {
  const directory = photoDirectory();
  const name = nextName('jpg');
  const source = new File(toFileUri(sourcePath));
  const destination = new File(directory, name);
  await source.copy(destination);
  try {
    if (source.exists) {
      source.delete();
    }
  } catch (error) {
    console.error('Error removing temporary capture:', error);
  }
  const modifiedAt = destination.lastModified ?? Date.now();
  const created = metaForNewPhoto(readIndex(), name, modifiedAt, capture);
  await writeIndex(created.index);
  return {
    uri: destination.uri,
    name,
    modifiedAt,
    meta: created.meta,
  };
}

export async function importDataUrl(
  dataUrl: string,
  capture?: CaptureMetaInput,
): Promise<StoredPhoto> {
  const matched = dataUrl.match(/^data:image\/(\w+);base64,(.+)$/);
  const extension = matched?.[1] === 'png' ? 'png' : 'jpg';
  const payload = matched?.[2] ?? dataUrl;
  const directory = photoDirectory();
  const name = nextName(extension);
  const file = new File(directory, name);
  file.create();
  await file.write(payload, {encoding: 'base64'});
  const modifiedAt = file.lastModified ?? Date.now();
  const created = metaForNewPhoto(readIndex(), name, modifiedAt, capture);
  await writeIndex(created.index);
  return {
    uri: file.uri,
    name,
    modifiedAt,
    meta: created.meta,
  };
}

export async function deletePhoto(uri: string): Promise<void> {
  const file = new File(toFileUri(uri));
  if (file.exists) {
    file.delete();
  }
  const name = fileNameFromUri(uri);
  const index = readIndex();
  if (!index.entries[name]) {
    return;
  }
  const entries = {...index.entries};
  delete entries[name];
  await writeIndex({...index, entries});
}

export async function replacePhoto(
  uri: string,
  encoded: {base64: string; dataUri: string},
  patch: {presetId: string},
): Promise<StoredPhoto> {
  const file = new File(toFileUri(uri));
  const payload = encoded.base64.replace(/^data:image\/\w+;base64,/, '');
  if (!file.exists) {
    file.create();
  }
  await file.write(payload, {encoding: 'base64'});
  const name = fileNameFromUri(file.uri);
  const index = readIndex();
  const modifiedAt = file.lastModified ?? Date.now();
  const base = index.entries[name]
    ? index
    : metaForNewPhoto(index, name, modifiedAt).index;
  const current = base.entries[name];
  const meta = metaAfterBake(current, patch.presetId);
  await writeIndex({
    ...base,
    entries: {...base.entries, [name]: meta},
  });
  return {
    uri: file.uri,
    name,
    modifiedAt: file.lastModified ?? Date.now(),
    meta,
  };
}

async function ensureAlbumPermission() {
  const current = await getPermissionsAsync(true, ['photo']);
  return current;
}

export async function savePhotosToAlbum(
  items: {uri: string; filename?: string}[],
): Promise<SaveLibraryResult> {
  return saveWithLibrary(
    items.map(item => item.uri),
    {
      getPermission: () => ensureAlbumPermission(),
      requestPermission: () => requestPermissionsAsync(true, ['photo']),
      createAsset: async uri => Asset.create(toFileUri(uri)),
      getAlbum: async name => {
        const album = await Album.get(name);
        if (!album) {
          return null;
        }
        return {
          add: assets => album.add(assets as never),
        };
      },
      createAlbum: async (name, assets) => {
        await Album.create(name, assets as never, false);
      },
    },
  );
}

export async function saveToDeviceLibrary(uri: string): Promise<string | null> {
  const result = await savePhotosToAlbum([{uri}]);
  if (!result.ok) {
    if (result.reason === 'denied') {
      const buttons = result.canAskAgain
        ? [{text: 'OK'}]
        : [
            {text: 'Cancel', style: 'cancel' as const},
            {
              text: 'Open Settings',
              onPress: () => {
                void Linking.openSettings();
              },
            },
          ];
      Alert.alert('Permission Required', result.message, buttons);
    }
    return null;
  }
  return result.assetIds[0] ?? null;
}
