import {CameraStore} from '../src/stores/CameraStore';
import {
  deletePhoto,
  importFile,
  listPhotos,
} from '../src/services/photoLibrary';

const meta = {
  timestamp: 20,
  presetId: 'night-flash' as string | null,
  fileNumber: '100-0007',
  lookBaked: true,
  revision: 0,
};

beforeEach(() => {
  jest.mocked(listPhotos).mockReset();
  jest.mocked(importFile).mockReset();
  jest.mocked(deletePhoto).mockClear();
});

test('keeps image paths as strings and stores playback metadata beside them', async () => {
  jest.mocked(listPhotos).mockResolvedValue([
    {
      uri: 'file:///older.jpg',
      name: 'older.jpg',
      modifiedAt: 10,
      meta: {
        timestamp: 10,
        presetId: null,
        fileNumber: '100-0001',
        lookBaked: false,
        revision: 0,
      },
    },
    {
      uri: 'file:///newer.jpg',
      name: 'newer.jpg',
      modifiedAt: 20,
      meta,
    },
  ]);
  const store = CameraStore.create({});
  await store.loadPhotos();

  expect(store.images.slice()).toEqual([
    'file:///newer.jpg',
    'file:///older.jpg',
  ]);
  expect(store.images.every(image => typeof image === 'string')).toBe(true);
  expect(store.playbackPhotos.map(photo => photo.fileNumber)).toEqual([
    '100-0007',
    '100-0001',
  ]);
  expect(store.playbackPhotos[1].lookBaked).toBe(false);
  expect(store.lastImagePath).toBe('file:///newer.jpg');
});

test('a photo with no metadata record stays viewable as a legacy frame', async () => {
  jest
    .mocked(listPhotos)
    .mockResolvedValue([
      {uri: 'file:///legacy.jpg', name: 'legacy.jpg', modifiedAt: 4},
    ]);
  const store = CameraStore.create({});
  await store.loadPhotos();

  expect(store.images.slice()).toEqual(['file:///legacy.jpg']);
  expect(store.playbackPhotos[0]).toMatchObject({
    uri: 'file:///legacy.jpg',
    lookBaked: false,
    presetId: null,
  });
  expect(store.playbackPhotos[0].fileNumber).toMatch(/^\d{3}-\d{4}$/);
});

test('forwards optional capture metadata without changing the saved uri', async () => {
  jest.mocked(importFile).mockResolvedValue({
    uri: 'file:///saved.jpg',
    name: 'DigiCamSim_20_1.jpg',
    modifiedAt: 20,
    meta,
  });
  const store = CameraStore.create({});
  const capture = {presetId: 'night-flash', lookBaked: true, timestamp: 20};
  const uri = await store.saveCapturedPhoto('file:///tmp/shot.jpg', capture);

  expect(uri).toBe('file:///saved.jpg');
  expect(importFile).toHaveBeenCalledWith('file:///tmp/shot.jpg', capture);
  expect(store.playbackPhotos[0]).toMatchObject({
    fileNumber: '100-0007',
    presetId: 'night-flash',
    lookBaked: true,
  });
});

test('removing a photo drops its record and deletes the file', async () => {
  jest.mocked(listPhotos).mockResolvedValue([
    {
      uri: 'file:///only.jpg',
      name: 'only.jpg',
      modifiedAt: 20,
      meta,
    },
  ]);
  const store = CameraStore.create({});
  await store.loadPhotos();
  store.removeImage('file:///only.jpg');

  expect(store.images.slice()).toEqual([]);
  expect(store.playbackPhotos).toEqual([]);
  expect(deletePhoto).toHaveBeenCalledWith('file:///only.jpg');
});
