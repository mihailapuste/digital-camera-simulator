import {downloadFiles} from '../../src/gallery/download';
import {
  planShare,
  runSharePlan,
  sharePlaybackPhotosWith,
  type ShareDriver,
} from '../../src/gallery/sharePlan';
import {
  ALBUM_NAME,
  saveWithLibrary,
  type AlbumIO,
} from '../../src/gallery/saveAlbum';
import type {ShareablePhoto} from '../../src/gallery/types';

const shot = (
  fileNumber: string,
  name = `${fileNumber}.jpg`,
): ShareablePhoto => ({
  uri: `file:///${fileNumber}.jpg`,
  name,
  fileNumber,
});

function driver(overrides: Partial<ShareDriver> = {}): ShareDriver & {
  calls: {title: string; filename: string}[];
  downloads: number;
} {
  const calls: {title: string; filename: string}[] = [];
  let downloads = 0;
  return {
    calls,
    get downloads() {
      return downloads;
    },
    shareOne: async (file, title) => {
      calls.push({title, filename: file.filename});
    },
    download: async () => {
      downloads += 1;
    },
    ...overrides,
  };
}

test('plans a native sheet for one photo and for a selection', () => {
  expect(
    planShare([shot('100-0042')], {platform: 'native', webShare: false}),
  ).toEqual({
    channel: 'native-sheet',
    dialogTitle: 'Share 100-0042',
    files: [
      {
        uri: 'file:///100-0042.jpg',
        filename: '100-0042.jpg',
        mimeType: 'image/jpeg',
      },
    ],
  });

  const many = planShare([shot('100-0042'), shot('100-0043', 'frame.png')], {
    platform: 'native',
    webShare: false,
  });
  expect(many.channel).toBe('native-sheet');
  if (many.channel === 'native-sheet') {
    expect(many.dialogTitle).toBe('Share 2 photos');
    expect(many.files.map(file => file.filename)).toEqual([
      '100-0042.jpg',
      '100-0043.png',
    ]);
    expect(many.files[1].mimeType).toBe('image/png');
  }
});

test('uses the browser share sheet when it exists, otherwise a download', () => {
  expect(
    planShare([shot('100-0001'), shot('100-0002')], {
      platform: 'web',
      webShare: true,
    }).channel,
  ).toBe('web-share');
  expect(
    planShare([shot('100-0001')], {platform: 'web', webShare: false}).channel,
  ).toBe('web-download');
});

test('presents one native sheet per file and falls back when web share declines', async () => {
  const native = driver();
  const plan = planShare([shot('100-0001'), shot('100-0002')], {
    platform: 'native',
    webShare: false,
  });
  const outcome = await runSharePlan(plan, native);
  expect(outcome).toEqual({ok: true, channel: 'sheet', count: 2});
  expect(native.calls).toEqual([
    {title: 'Share 1 of 2', filename: '100-0001.jpg'},
    {title: 'Share 2 of 2', filename: '100-0002.jpg'},
  ]);

  const web = driver({
    webShare: async () => false,
  });
  const webPlan = planShare([shot('100-0004')], {
    platform: 'web',
    webShare: true,
  });
  const downloaded = await runSharePlan(webPlan, web);
  expect(downloaded).toEqual({ok: true, channel: 'download', count: 1});
  expect(web.downloads).toBe(1);
});

test('reports an empty selection and a missing share sheet without calling the driver', async () => {
  const idle = driver();
  expect(
    await sharePlaybackPhotosWith(
      [],
      {platform: 'native', webShare: false},
      idle,
    ),
  ).toMatchObject({ok: false, reason: 'empty'});
  expect(
    await sharePlaybackPhotosWith(
      [shot('100-0001')],
      {platform: 'native', webShare: false, available: false},
      idle,
    ),
  ).toMatchObject({ok: false, reason: 'unavailable'});
  expect(idle.calls).toEqual([]);
});

test('a thrown share becomes a failed outcome', async () => {
  const spy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
  const broken = driver({
    shareOne: async () => {
      throw new Error('sheet failed');
    },
  });
  const outcome = await sharePlaybackPhotosWith(
    [shot('100-0008')],
    {platform: 'native', webShare: false, available: true},
    broken,
  );
  expect(outcome).toMatchObject({ok: false, reason: 'failed'});
  spy.mockRestore();
});

test('downloads through an anchor for each file', () => {
  const anchors: {href: string; download: string}[] = [];
  const doc = {
    createElement: () => {
      const anchor = {
        href: '',
        download: '',
        click: () => {
          anchors.push({href: anchor.href, download: anchor.download});
        },
        remove: () => undefined,
      };
      return anchor;
    },
    body: {appendChild: () => undefined},
  };
  downloadFiles(
    [
      {uri: 'data:image/jpeg;base64,aa', filename: '100-0001.jpg'},
      {uri: 'data:image/jpeg;base64,bb', filename: '100-0002.jpg'},
    ],
    doc,
  );
  expect(anchors).toEqual([
    {href: 'data:image/jpeg;base64,aa', download: '100-0001.jpg'},
    {href: 'data:image/jpeg;base64,bb', download: '100-0002.jpg'},
  ]);
});

function albumIO(permission: {
  status: string;
  granted?: boolean;
  canAskAgain?: boolean;
  accessPrivileges?: 'all' | 'limited' | 'none';
}): AlbumIO & {
  requested: boolean;
  created: {id: string}[][];
  albumName: string | null;
} {
  const io = {
    requested: false,
    created: [] as {id: string}[][],
    albumName: null as string | null,
    getPermission: async () => permission,
    requestPermission: async () => {
      io.requested = true;
      return {status: 'granted', granted: true};
    },
    createAsset: async (uri: string) => ({id: uri}),
    getAlbum: async () => null,
    createAlbum: async (name: string, assets: {id: string}[]) => {
      io.albumName = name;
      io.created.push(assets);
    },
  };
  return io;
}

test('saves into a new DigiCamSim album only after permission is granted', async () => {
  const fresh = albumIO({
    status: 'undetermined',
    granted: false,
    canAskAgain: true,
  });
  const saved = await saveWithLibrary(
    ['file:///a.jpg', 'file:///b.jpg'],
    fresh,
  );
  expect(fresh.requested).toBe(true);
  expect(saved).toMatchObject({
    ok: true,
    channel: 'album',
    assetIds: ['file:///a.jpg', 'file:///b.jpg'],
  });
  expect(fresh.albumName).toBe(ALBUM_NAME);
  expect(fresh.created).toEqual([
    [{id: 'file:///a.jpg'}, {id: 'file:///b.jpg'}],
  ]);
});

test('adds to the existing album and skips the permission prompt when access is already granted', async () => {
  const added: {id: string}[][] = [];
  const io: AlbumIO = {
    getPermission: async () => ({status: 'granted', granted: true}),
    requestPermission: async () => {
      throw new Error('should not ask again');
    },
    createAsset: async uri => ({id: uri}),
    getAlbum: async name => {
      expect(name).toBe(ALBUM_NAME);
      return {
        add: async assets => {
          added.push(assets);
        },
      };
    },
    createAlbum: async () => {
      throw new Error('album already exists');
    },
  };
  const saved = await saveWithLibrary(['file:///a.jpg'], io);
  expect(saved.ok).toBe(true);
  expect(added).toEqual([[{id: 'file:///a.jpg'}]]);
});

test('limited library access can still save, and a denial creates nothing', async () => {
  const limited = albumIO({
    status: 'granted',
    granted: false,
    accessPrivileges: 'limited',
  });
  expect((await saveWithLibrary(['file:///a.jpg'], limited)).ok).toBe(true);
  expect(limited.requested).toBe(false);

  let created = false;
  const denied = await saveWithLibrary(['file:///a.jpg'], {
    getPermission: async () => ({
      status: 'denied',
      granted: false,
      canAskAgain: false,
    }),
    requestPermission: async () => ({
      status: 'denied',
      granted: false,
      canAskAgain: false,
    }),
    createAsset: async () => {
      created = true;
      return {id: 'nope'};
    },
    getAlbum: async () => null,
    createAlbum: async () => undefined,
  });
  expect(denied).toMatchObject({
    ok: false,
    reason: 'denied',
    canAskAgain: false,
  });
  expect(created).toBe(false);
});
