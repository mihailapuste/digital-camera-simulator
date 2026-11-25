import {
  clearLibrary,
  deletePhoto,
  importDataUrl,
  listPhotos,
  replacePhoto,
} from '../src/services/photoLibrary.web';

const STORAGE_KEY = 'digicamsim.photos.v1';

class MemoryStorage {
  private items = new Map<string, string>();

  getItem(key: string) {
    return this.items.get(key) ?? null;
  }

  setItem(key: string, value: string) {
    this.items.set(key, value);
  }

  removeItem(key: string) {
    this.items.delete(key);
  }
}

beforeEach(async () => {
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: new MemoryStorage(),
  });
  await clearLibrary();
});

test('keeps an uploaded photo in the web library', async () => {
  const photo = await importDataUrl('data:image/jpeg;base64,aaaa');
  const photos = await listPhotos();
  expect(photos.some(item => item.uri === photo.uri)).toBe(true);
  expect(photo.meta?.lookBaked).toBe(false);
  expect(photo.meta?.fileNumber).toMatch(/^\d{3}-\d{4}$/);

  await deletePhoto(photo.uri);
  const after = await listPhotos();
  expect(after.some(item => item.uri === photo.uri)).toBe(false);
});

test('records a preset on upload and keeps it across a reload', async () => {
  const photo = await importDataUrl('data:image/jpeg;base64,bbbb', {
    presetId: 'ccd-classic',
    timestamp: new Date(2004, 10, 24, 18, 42).getTime(),
  });
  const stored = globalThis.localStorage.getItem(STORAGE_KEY);
  expect(stored).toContain('ccd-classic');
  await clearLibrary();
  globalThis.localStorage.setItem(STORAGE_KEY, stored ?? '');
  const photos = await listPhotos();
  expect(photos[0].meta).toMatchObject({
    presetId: 'ccd-classic',
    lookBaked: true,
    fileNumber: photo.meta?.fileNumber,
  });
});

test('still lists a legacy card entry and can bake a look onto it', async () => {
  globalThis.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify([
      {
        uri: 'data:image/jpeg;base64,cccc',
        name: 'DigiCamSim_1101340800000_1.jpg',
        modifiedAt: 1101340800000,
      },
    ]),
  );
  const [legacy] = await listPhotos();
  expect(legacy.meta?.lookBaked).toBe(false);
  expect(legacy.meta?.fileNumber).toBe('100-0001');
  expect(legacy.uri).toBe('data:image/jpeg;base64,cccc');

  const baked = await replacePhoto(
    legacy.uri,
    {base64: 'dddd', dataUri: 'data:image/jpeg;base64,dddd'},
    {presetId: 'warm-power'},
  );
  expect(baked.uri).toBe('data:image/jpeg;base64,dddd');
  expect(baked.meta).toMatchObject({
    fileNumber: '100-0001',
    presetId: 'warm-power',
    lookBaked: true,
    timestamp: 1101340800000,
  });
  const listed = await listPhotos();
  expect(listed).toHaveLength(1);
  expect(listed[0].uri).toBe(baked.uri);
});
