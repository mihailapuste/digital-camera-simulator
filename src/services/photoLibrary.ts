import {Alert} from 'react-native';
import {Directory, File, Paths} from 'expo-file-system';
import {
  Album,
  Asset,
  requestPermissionsAsync,
} from 'expo-media-library';
import {StoredPhoto} from './photoLibrary.types';

const PHOTO_DIR = 'DigiCamSim';
const PHOTO_PREFIX = 'DigiCamSim_';

let sequence = 0;

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
    photos.sort((a, b) => b.modifiedAt - a.modifiedAt);
    return photos;
  } catch (error) {
    console.error('Error listing photos:', error);
    return [];
  }
}

export async function importFile(sourcePath: string): Promise<StoredPhoto> {
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
  return {
    uri: destination.uri,
    name,
    modifiedAt: destination.lastModified ?? Date.now(),
  };
}

export async function importDataUrl(dataUrl: string): Promise<StoredPhoto> {
  const matched = dataUrl.match(/^data:image\/(\w+);base64,(.+)$/);
  const extension = matched?.[1] === 'png' ? 'png' : 'jpg';
  const payload = matched?.[2] ?? dataUrl;
  const directory = photoDirectory();
  const name = nextName(extension);
  const file = new File(directory, name);
  file.create();
  await file.write(payload, {encoding: 'base64'});
  return {
    uri: file.uri,
    name,
    modifiedAt: file.lastModified ?? Date.now(),
  };
}

export async function writeBase64(
  base64: string,
  extension: 'png' | 'jpg',
): Promise<string> {
  const payload = base64.replace(/^data:image\/\w+;base64,/, '');
  const file = new File(Paths.cache, `filtered_image_${Date.now()}.${extension}`);
  file.create();
  await file.write(payload, {encoding: 'base64'});
  return file.uri;
}

export async function deletePhoto(uri: string): Promise<void> {
  const file = new File(toFileUri(uri));
  if (file.exists) {
    file.delete();
  }
}

export async function saveToDeviceLibrary(uri: string): Promise<string | null> {
  const permission = await requestPermissionsAsync(false, ['photo']);
  if (permission.status !== 'granted') {
    Alert.alert(
      'Permission Required',
      'Photo library permission is needed to save photos to your gallery.',
      [{text: 'OK'}],
    );
    return null;
  }

  const asset = await Asset.create(toFileUri(uri));
  const existing = await Album.get('DigiCamSim');
  if (existing) {
    await existing.add(asset);
  } else {
    await Album.create('DigiCamSim', [asset], false);
  }
  return asset.id;
}
