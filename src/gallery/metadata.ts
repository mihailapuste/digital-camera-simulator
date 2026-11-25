import {
  fileNumberFromIndex,
  indexFromFileNumber,
  isFileNumber,
} from './fileNumber';
import type {CaptureMetaInput, PhotoMeta} from './types';

export type PhotoIndex = {
  version: 1;
  /** Next 1-based DCF index. Never moves backward, so deleted frames are not reused. */
  nextIndex: number;
  entries: Record<string, PhotoMeta>;
};

export type IndexPhoto = {
  name: string;
  modifiedAt: number;
};

export function emptyPhotoIndex(): PhotoIndex {
  return {version: 1, nextIndex: 1, entries: {}};
}

export function fileNameFromUri(uri: string): string {
  if (uri.startsWith('data:')) {
    return 'photo.jpg';
  }
  const clean = uri.split('?')[0];
  const name = clean.split('/').pop() ?? '';
  try {
    return decodeURIComponent(name) || 'photo.jpg';
  } catch {
    return name || 'photo.jpg';
  }
}

/** `DigiCamSim_<milliseconds>_<n>.jpg` keeps the capture time in the file name. */
export function timestampFromName(name: string, fallback: number): number {
  const match = /DigiCamSim_(\d{11,})_/.exec(name);
  if (match) {
    const value = Number(match[1]);
    if (Number.isFinite(value) && value > 0) {
      return value;
    }
  }
  if (Number.isFinite(fallback) && fallback > 0) {
    return fallback;
  }
  return Date.now();
}

export function isPhotoMeta(value: unknown): value is PhotoMeta {
  return sanitizeMeta(value) != null;
}

export function sanitizeMeta(value: unknown): PhotoMeta | null {
  if (!value || typeof value !== 'object') {
    return null;
  }
  const entry = value as Partial<PhotoMeta>;
  if (typeof entry.fileNumber !== 'string' || !isFileNumber(entry.fileNumber)) {
    return null;
  }
  if (
    typeof entry.timestamp !== 'number' ||
    !Number.isFinite(entry.timestamp)
  ) {
    return null;
  }
  const revision =
    typeof entry.revision === 'number' && entry.revision >= 0
      ? Math.round(entry.revision)
      : 0;
  return {
    timestamp: entry.timestamp,
    presetId: typeof entry.presetId === 'string' ? entry.presetId : null,
    fileNumber: entry.fileNumber,
    lookBaked: entry.lookBaked === true,
    revision,
  };
}

export function parsePhotoIndex(raw: string | null | undefined): PhotoIndex {
  if (!raw) {
    return emptyPhotoIndex();
  }
  try {
    const value = JSON.parse(raw) as Partial<PhotoIndex> | null;
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      return emptyPhotoIndex();
    }
    const entries: Record<string, PhotoMeta> = {};
    if (value.entries && typeof value.entries === 'object') {
      for (const [name, entry] of Object.entries(value.entries)) {
        const meta = sanitizeMeta(entry);
        if (meta) {
          entries[name] = meta;
        }
      }
    }
    const stored = value.nextIndex;
    const nextIndex =
      typeof stored === 'number' && Number.isInteger(stored) && stored >= 1
        ? stored
        : 1;
    return {version: 1, nextIndex, entries};
  } catch {
    return emptyPhotoIndex();
  }
}

function bumpNext(
  nextIndex: number,
  entries: Record<string, PhotoMeta>,
): number {
  let next = nextIndex >= 1 ? nextIndex : 1;
  for (const meta of Object.values(entries)) {
    const index = indexFromFileNumber(meta.fileNumber);
    if (index != null && index >= next) {
      next = index + 1;
    }
  }
  return next;
}

/**
 * Fills file numbers for photos that have none, oldest first.
 * Photos that already have a record keep it. Missing files drop out of the
 * index; their numbers are not handed out again.
 */
export function hydratePhotoIndex(
  index: PhotoIndex,
  photos: IndexPhoto[],
): {index: PhotoIndex; changed: boolean} {
  const known = new Set(photos.map(photo => photo.name));
  const entries = {...index.entries};
  let changed = false;
  for (const name of Object.keys(entries)) {
    if (!known.has(name)) {
      delete entries[name];
      changed = true;
    }
  }
  let nextIndex = bumpNext(index.nextIndex, entries);
  if (nextIndex !== index.nextIndex) {
    changed = true;
  }
  const missing = photos
    .filter(photo => !entries[photo.name])
    .sort(
      (a, b) => a.modifiedAt - b.modifiedAt || a.name.localeCompare(b.name),
    );
  for (const photo of missing) {
    entries[photo.name] = {
      timestamp: timestampFromName(photo.name, photo.modifiedAt),
      presetId: null,
      fileNumber: fileNumberFromIndex(nextIndex),
      lookBaked: false,
      revision: 0,
    };
    nextIndex += 1;
    changed = true;
  }
  return {
    index: {version: 1, nextIndex, entries},
    changed,
  };
}

export function metaForNewPhoto(
  index: PhotoIndex,
  name: string,
  modifiedAt: number,
  input?: CaptureMetaInput,
): {index: PhotoIndex; meta: PhotoMeta} {
  const timestamp =
    input?.timestamp != null && Number.isFinite(input.timestamp)
      ? input.timestamp
      : timestampFromName(name, modifiedAt);
  const presetId = input?.presetId ?? null;
  const lookBaked = input?.lookBaked ?? presetId != null;
  let nextIndex = bumpNext(index.nextIndex, index.entries);
  let fileNumber = input?.fileNumber;
  if (!fileNumber || !isFileNumber(fileNumber)) {
    fileNumber = fileNumberFromIndex(nextIndex);
    nextIndex += 1;
  } else {
    const parsed = indexFromFileNumber(fileNumber);
    if (parsed != null && parsed >= nextIndex) {
      nextIndex = parsed + 1;
    }
  }
  const meta: PhotoMeta = {
    timestamp,
    presetId,
    fileNumber,
    lookBaked,
    revision: 0,
  };
  return {
    index: {
      version: 1,
      nextIndex,
      entries: {...index.entries, [name]: meta},
    },
    meta,
  };
}

export function metaAfterBake(current: PhotoMeta, presetId: string): PhotoMeta {
  return {
    timestamp: current.timestamp,
    presetId,
    fileNumber: current.fileNumber,
    lookBaked: true,
    revision: current.revision + 1,
  };
}
