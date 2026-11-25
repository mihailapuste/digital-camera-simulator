import {StoredPhoto} from './photoLibrary.types';

const STORAGE_KEY = 'digicamsim.photos.v1';
const PHOTO_PREFIX = 'DigiCamSim_';

let sequence = 0;
let memory: StoredPhoto[] | null = null;

function nextName(extension: 'jpg' | 'png'): string {
  sequence += 1;
  return `${PHOTO_PREFIX}${Date.now()}_${sequence}.${extension}`;
}

function readAll(): StoredPhoto[] {
  if (memory) {
    return memory;
  }
  try {
    const raw = globalThis.localStorage?.getItem(STORAGE_KEY);
    memory = raw ? (JSON.parse(raw) as StoredPhoto[]) : [];
  } catch {
    memory = [];
  }
  return memory;
}

function writeAll(photos: StoredPhoto[]) {
  memory = photos;
  try {
    globalThis.localStorage?.setItem(STORAGE_KEY, JSON.stringify(photos));
  } catch (error) {
    console.error('Could not persist the web photo library:', error);
  }
}

export async function listPhotos(): Promise<StoredPhoto[]> {
  return [...readAll()].sort((a, b) => b.modifiedAt - a.modifiedAt);
}

export async function importDataUrl(dataUrl: string): Promise<StoredPhoto> {
  const matched = dataUrl.match(/^data:image\/(\w+);base64,/);
  const extension = matched?.[1] === 'png' ? 'png' : 'jpg';
  const photo: StoredPhoto = {
    uri: dataUrl,
    name: nextName(extension),
    modifiedAt: Date.now(),
  };
  writeAll([photo, ...readAll()]);
  return photo;
}

export async function importFile(sourcePath: string): Promise<StoredPhoto> {
  if (sourcePath.startsWith('data:')) {
    return importDataUrl(sourcePath);
  }
  const response = await fetch(sourcePath);
  const blob = await response.blob();
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Could not read the selected image'));
      }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
  return importDataUrl(dataUrl);
}

export async function writeBase64(
  base64: string,
  extension: 'png' | 'jpg',
): Promise<string> {
  if (base64.startsWith('data:')) {
    return base64;
  }
  const mime = extension === 'png' ? 'image/png' : 'image/jpeg';
  return `data:${mime};base64,${base64}`;
}

export async function deletePhoto(uri: string): Promise<void> {
  writeAll(readAll().filter(photo => photo.uri !== uri));
}

export async function saveToDeviceLibrary(uri: string): Promise<string | null> {
  if (typeof document === 'undefined') {
    return null;
  }
  const link = document.createElement('a');
  link.href = uri;
  link.download = `DigiCamSim_${Date.now()}.jpg`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  return uri;
}
