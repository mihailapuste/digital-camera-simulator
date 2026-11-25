export const ALBUM_NAME = 'DigiCamSim';

export type LibraryPermission = {
  status?: string;
  granted?: boolean;
  canAskAgain?: boolean;
  accessPrivileges?: 'all' | 'limited' | 'none' | string;
};

export type SaveLibraryResult =
  | {ok: true; assetIds: string[]; channel: 'album' | 'download'}
  | {
      ok: false;
      reason: 'denied';
      canAskAgain: boolean;
      message: string;
    }
  | {ok: false; reason: 'failed'; message: string};

export type AlbumHandle = {
  add: (assets: {id: string}[]) => Promise<void>;
};

export type AlbumIO = {
  getPermission: () => Promise<LibraryPermission>;
  requestPermission: () => Promise<LibraryPermission>;
  createAsset: (uri: string) => Promise<{id: string}>;
  getAlbum: (name: string) => Promise<AlbumHandle | null>;
  createAlbum: (name: string, assets: {id: string}[]) => Promise<void>;
};

export function canSaveToLibrary(permission: LibraryPermission): boolean {
  if (permission.granted === true || permission.status === 'granted') {
    return true;
  }
  return (
    permission.accessPrivileges === 'all' ||
    permission.accessPrivileges === 'limited'
  );
}

export function interpretSavePermission(
  permission: LibraryPermission,
): Extract<SaveLibraryResult, {ok: false; reason: 'denied'}> | {ok: true} {
  if (canSaveToLibrary(permission)) {
    return {ok: true};
  }
  const canAskAgain = permission.canAskAgain !== false;
  return {
    ok: false,
    reason: 'denied',
    canAskAgain,
    message: canAskAgain
      ? 'Photo library permission is needed to save photos to the DigiCamSim album.'
      : 'Photo library access is off. Enable it in Settings to save photos.',
  };
}

/**
 * Saves into the DigiCamSim album. Asks only when the current permission
 * cannot add photos, and does not create assets after a denial.
 */
export async function saveWithLibrary(
  uris: string[],
  io: AlbumIO,
): Promise<SaveLibraryResult> {
  if (uris.length === 0) {
    return {ok: false, reason: 'failed', message: 'No photos to save.'};
  }
  try {
    const current = await io.getPermission();
    const permission = canSaveToLibrary(current)
      ? current
      : await io.requestPermission();
    const access = interpretSavePermission(permission);
    if (!access.ok) {
      return access;
    }
    const assets = [];
    for (const uri of uris) {
      assets.push(await io.createAsset(uri));
    }
    const album = await io.getAlbum(ALBUM_NAME);
    if (album) {
      await album.add(assets);
    } else {
      await io.createAlbum(ALBUM_NAME, assets);
    }
    return {
      ok: true,
      assetIds: assets.map(asset => asset.id),
      channel: 'album',
    };
  } catch (error) {
    console.error('Error saving to the DigiCamSim album:', error);
    return {
      ok: false,
      reason: 'failed',
      message: 'Could not save to the DigiCamSim album.',
    };
  }
}
