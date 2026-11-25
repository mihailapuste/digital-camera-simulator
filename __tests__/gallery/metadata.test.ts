import {
  fileNumberFromIndex,
  indexFromFileNumber,
} from '../../src/gallery/fileNumber';
import {
  emptyPhotoIndex,
  hydratePhotoIndex,
  metaForNewPhoto,
  parsePhotoIndex,
} from '../../src/gallery/metadata';

test('formats DCF file numbers and rolls the folder at 9999', () => {
  expect(fileNumberFromIndex(1)).toBe('100-0001');
  expect(fileNumberFromIndex(42)).toBe('100-0042');
  expect(fileNumberFromIndex(9999)).toBe('100-9999');
  expect(fileNumberFromIndex(10000)).toBe('101-0001');
  expect(indexFromFileNumber('100-0042')).toBe(42);
  expect(indexFromFileNumber('101-0001')).toBe(10000);
  expect(indexFromFileNumber('099-0001')).toBeNull();
  expect(() => fileNumberFromIndex(0)).toThrow(/positive integer/);
});

test('assigns missing file numbers oldest first and keeps a baked record', () => {
  const seeded = {
    version: 1 as const,
    nextIndex: 43,
    entries: {
      'keep.jpg': {
        timestamp: 5,
        presetId: 'ccd-classic',
        fileNumber: '100-0042',
        lookBaked: true,
        revision: 2,
      },
    },
  };
  const result = hydratePhotoIndex(seeded, [
    {name: 'keep.jpg', modifiedAt: 5},
    {name: 'fresh.jpg', modifiedAt: 9},
    {name: 'older.jpg', modifiedAt: 1},
  ]);

  expect(result.index.entries['keep.jpg']).toMatchObject({
    fileNumber: '100-0042',
    lookBaked: true,
    presetId: 'ccd-classic',
    revision: 2,
  });
  expect(result.index.entries['older.jpg']).toMatchObject({
    fileNumber: '100-0043',
    lookBaked: false,
    presetId: null,
  });
  expect(result.index.entries['fresh.jpg'].fileNumber).toBe('100-0044');
  expect(result.index.nextIndex).toBe(45);
  expect(seeded.entries['keep.jpg'].fileNumber).toBe('100-0042');
});

test('does not reuse a file number after that photo is removed', () => {
  const first = metaForNewPhoto(emptyPhotoIndex(), 'a.jpg', 1);
  const second = metaForNewPhoto(first.index, 'b.jpg', 2);
  const dropped = hydratePhotoIndex(second.index, [
    {name: 'a.jpg', modifiedAt: 1},
  ]);
  const third = metaForNewPhoto(dropped.index, 'c.jpg', 3);

  expect(first.meta.fileNumber).toBe('100-0001');
  expect(second.meta.fileNumber).toBe('100-0002');
  expect(dropped.index.entries['b.jpg']).toBeUndefined();
  expect(third.meta.fileNumber).toBe('100-0003');
});

test('a capture without a preset stays legacy, and a preset marks the look baked', () => {
  const legacy = metaForNewPhoto(
    emptyPhotoIndex(),
    'DigiCamSim_1100000000000_1.jpg',
    9,
  );
  expect(legacy.meta.lookBaked).toBe(false);
  expect(legacy.meta.presetId).toBeNull();
  expect(legacy.meta.timestamp).toBe(1100000000000);

  const baked = metaForNewPhoto(legacy.index, 'next.jpg', 20, {
    presetId: 'night-flash',
    timestamp: 20,
  });
  expect(baked.meta).toMatchObject({
    lookBaked: true,
    presetId: 'night-flash',
    fileNumber: '100-0002',
    timestamp: 20,
  });
});

test('an explicit file number is kept and the counter moves past it', () => {
  const created = metaForNewPhoto(emptyPhotoIndex(), 'shot.jpg', 4, {
    fileNumber: '100-0042',
    lookBaked: true,
  });
  expect(created.meta.fileNumber).toBe('100-0042');
  expect(created.meta.lookBaked).toBe(true);
  expect(created.index.nextIndex).toBe(43);
});

test('reads an older index that has no revision and ignores corrupt files', () => {
  const parsed = parsePhotoIndex(
    JSON.stringify({
      version: 1,
      nextIndex: 2,
      entries: {
        'a.jpg': {
          timestamp: 10,
          presetId: null,
          fileNumber: '100-0001',
          lookBaked: false,
        },
      },
    }),
  );
  expect(parsed.entries['a.jpg'].revision).toBe(0);
  expect(parsePhotoIndex('not json')).toEqual(emptyPhotoIndex());
  expect(parsePhotoIndex('[]').entries).toEqual({});
});
