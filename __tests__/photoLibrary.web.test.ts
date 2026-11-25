import {
  deletePhoto,
  importDataUrl,
  listPhotos,
} from '../src/services/photoLibrary.web';

test('keeps an uploaded photo in the web library', async () => {
  const photo = await importDataUrl('data:image/jpeg;base64,aaaa');
  const photos = await listPhotos();
  expect(photos.some(item => item.uri === photo.uri)).toBe(true);

  await deletePhoto(photo.uri);
  const after = await listPhotos();
  expect(after.some(item => item.uri === photo.uri)).toBe(false);
});
