import {
  buildGalleryRows,
  flatSectionPhotos,
  groupPhotosByDay,
} from '../../src/gallery/groupPhotos';
import type {GalleryPhoto} from '../../src/gallery/types';

function photo(
  fileNumber: string,
  timestamp: number,
  name = `${fileNumber}.jpg`,
): GalleryPhoto {
  return {
    uri: `file:///${name}`,
    name,
    timestamp,
    presetId: 'ccd-classic',
    fileNumber,
    lookBaked: true,
    revision: 0,
  };
}

test('groups by local day, newest day and newest frame first', () => {
  const morning = new Date(2004, 10, 24, 9, 15).getTime();
  const evening = new Date(2004, 10, 24, 21, 2).getTime();
  const nextDay = new Date(2004, 10, 25, 8, 0).getTime();
  const sections = groupPhotosByDay([
    photo('100-0001', morning),
    photo('100-0003', nextDay),
    photo('100-0002', evening),
  ]);

  expect(sections.map(section => section.label)).toEqual([
    '04.11.25',
    '04.11.24',
  ]);
  expect(sections[0].photos.map(item => item.fileNumber)).toEqual(['100-0003']);
  expect(sections[1].photos.map(item => item.fileNumber)).toEqual([
    '100-0002',
    '100-0001',
  ]);
  expect(
    flatSectionPhotos([
      photo('100-0001', morning),
      photo('100-0003', nextDay),
      photo('100-0002', evening),
    ]).map(item => item.fileNumber),
  ).toEqual(['100-0003', '100-0002', '100-0001']);
});

test('builds a day header and rows of three, with a short final row', () => {
  const day = new Date(2004, 10, 24, 12, 0).getTime();
  const photos = [1, 2, 3, 4].map(index =>
    photo(`100-000${index}`, day + index * 1000),
  );
  const rows = buildGalleryRows(photos, 3);

  expect(rows.map(row => row.kind)).toEqual(['day', 'photos', 'photos']);
  expect(rows[0]).toMatchObject({kind: 'day', label: '04.11.24', count: 4});
  if (rows[1].kind === 'photos' && rows[2].kind === 'photos') {
    expect(rows[1].photos.map(item => item.fileNumber)).toEqual([
      '100-0004',
      '100-0003',
      '100-0002',
    ]);
    expect(rows[2].photos.map(item => item.fileNumber)).toEqual(['100-0001']);
  }
});

test('an empty card has no rows', () => {
  expect(groupPhotosByDay([])).toEqual([]);
  expect(buildGalleryRows([])).toEqual([]);
});
