import {downloadFiles} from '../gallery/download';
import {
  hydratePhotoIndex,
  metaAfterBake,
  metaForNewPhoto,
  sanitizeMeta,
} from '../gallery/metadata';
import type {SaveLibraryResult} from '../gallery/saveAlbum';
import type {CaptureMetaInput, PhotoMeta} from '../gallery/types';
import {StoredPhoto} from './photoLibrary.types';

const STORAGE_KEY = 'digicamsim.photos.v1';
const PHOTO_PREFIX = 'DigiCamSim_';

type WebState = {
  nextIndex: number;
  photos: StoredPhoto[];
};

let sequence = 0;
let memory: WebState | null = null;

function nextName(extension: 'jpg' | 'png'): string {
  sequence += 1;
  return `${PHOTO_PREFIX}${Date.now()}_${sequence}.${extension}`;
}

function indexFromPhotos(state: WebState) {
  const entries: Record<string, PhotoMeta> = {};
  for (const photo of state.photos) {
    const meta = sanitizeMeta(photo.meta);
    if (meta) {
      entries[photo.name] = meta;
    }
  }
  return {version: 1 as const, nextIndex: state.nextIndex, entries};
}

function readState(): WebState {
  if (!memory) {
    memory = loadState();
  }
  const hydrated = hydratePhotoIndex(
    indexFromPhotos(memory),
    memory.photos.map(photo => ({
      name: photo.name,
      modifiedAt: photo.modifiedAt,
    })),
  );
  if (!hydrated.changed) {
    return memory;
  }
  const photos = memory.photos.map(photo => ({
    ...photo,
    meta: hydrated.index.entries[photo.name],
  }));
  return writeState({nextIndex: hydrated.index.nextIndex, photos});
}

function loadState(): WebState {
  try {
    const raw = globalThis.localStorage?.getItem(STORAGE_KEY);
    if (!raw) {
      return {nextIndex: 1, photos: []};
    }
    const parsed = JSON.parse(raw) as unknown;
    if (Array.isArray(parsed)) {
      return {nextIndex: 1, photos: parsed as StoredPhoto[]};
    }
    if (
      parsed &&
      typeof parsed === 'object' &&
      Array.isArray((parsed as {photos?: unknown}).photos)
    ) {
      const record = parsed as {nextIndex?: unknown; photos: StoredPhoto[]};
      const nextIndex =
        typeof record.nextIndex === 'number' && record.nextIndex >= 1
          ? record.nextIndex
          : 1;
      return {nextIndex, photos: record.photos};
    }
  } catch {
    // A broken library falls back to an empty card rather than crashing playback.
  }
  return {nextIndex: 1, photos: []};
}

function writeState(state: WebState): WebState {
  memory = state;
  try {
    globalThis.localStorage?.setItem(
      STORAGE_KEY,
      JSON.stringify({
        version: 1,
        nextIndex: state.nextIndex,
        photos: state.photos,
      }),
    );
  } catch (error) {
    console.error('Could not persist the web photo library:', error);
  }
  return state;
}

export async function listPhotos(): Promise<StoredPhoto[]> {
  return [...readState().photos].sort((a, b) => {
    const left = a.meta?.timestamp ?? a.modifiedAt;
    const right = b.meta?.timestamp ?? b.modifiedAt;
    return (
      right - left ||
      (b.meta?.fileNumber ?? '').localeCompare(a.meta?.fileNumber ?? '')
    );
  });
}

export async function importDataUrl(
  dataUrl: string,
  capture?: CaptureMetaInput,
): Promise<StoredPhoto> {
  const matched = dataUrl.match(/^data:image\/(\w+);base64,/);
  const extension = matched?.[1] === 'png' ? 'png' : 'jpg';
  const state = readState();
  const name = nextName(extension);
  const modifiedAt = capture?.timestamp ?? Date.now();
  const created = metaForNewPhoto(
    indexFromPhotos(state),
    name,
    modifiedAt,
    capture,
  );
  const photo: StoredPhoto = {
    uri: dataUrl,
    name,
    modifiedAt,
    meta: created.meta,
  };
  writeState({
    nextIndex: created.index.nextIndex,
    photos: [photo, ...state.photos],
  });
  return photo;
}

export async function importFile(
  sourcePath: string,
  capture?: CaptureMetaInput,
): Promise<StoredPhoto> {
  if (sourcePath.startsWith('data:')) {
    return importDataUrl(sourcePath, capture);
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
  return importDataUrl(dataUrl, capture);
}

export async function deletePhoto(uri: string): Promise<void> {
  const state = readState();
  writeState({
    nextIndex: state.nextIndex,
    photos: state.photos.filter(photo => photo.uri !== uri),
  });
}

export async function replacePhoto(
  uri: string,
  encoded: {base64: string; dataUri: string},
  patch: {presetId: string},
): Promise<StoredPhoto> {
  const state = readState();
  const index = state.photos.findIndex(photo => photo.uri === uri);
  if (index === -1) {
    throw new Error('Photo not found');
  }
  const current = state.photos[index];
  const known = sanitizeMeta(current.meta);
  const base = known
    ? indexFromPhotos(state)
    : metaForNewPhoto(indexFromPhotos(state), current.name, current.modifiedAt)
        .index;
  const meta = metaAfterBake(base.entries[current.name], patch.presetId);
  const updated: StoredPhoto = {
    ...current,
    uri: encoded.dataUri,
    meta,
  };
  const photos = state.photos.slice();
  photos[index] = updated;
  writeState({nextIndex: base.nextIndex, photos});
  return updated;
}

export async function savePhotosToAlbum(
  items: {uri: string; filename?: string}[],
): Promise<SaveLibraryResult> {
  if (items.length === 0) {
    return {ok: false, reason: 'failed', message: 'No photos to save.'};
  }
  if (typeof document === 'undefined') {
    return {
      ok: false,
      reason: 'failed',
      message: 'Downloads are only available in the browser.',
    };
  }
  downloadFiles(
    items.map((item, index) => ({
      uri: item.uri,
      filename: item.filename ?? `DigiCamSim_${Date.now()}_${index + 1}.jpg`,
    })),
  );
  return {
    ok: true,
    assetIds: items.map(item => item.uri),
    channel: 'download',
  };
}

export async function saveToDeviceLibrary(uri: string): Promise<string | null> {
  const result = await savePhotosToAlbum([{uri}]);
  return result.ok ? uri : null;
}

/** Test helper. Drops the in-memory card so the next read uses storage. */
export async function clearLibrary(): Promise<void> {
  sequence = 0;
  memory = null;
  try {
    globalThis.localStorage?.removeItem(STORAGE_KEY);
  } catch {
    // Ignore missing storage in tests.
  }
}
