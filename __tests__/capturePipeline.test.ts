import type {SkImage} from '@shopify/react-native-skia';
import {bakeCapture, storeBakedPhoto} from '../src/camera/capturePipeline';
import {
  landscapeCropRect,
  orientedSize,
  uprightQuarterTurns,
} from '../src/camera/frameCapture';
import {hardwareFlash} from '../src/camera/hardwareFlash';
import {restingZoom, stepZoom} from '../src/camera/zoom';
import {lcdDateLabel, stampFromSettings} from '../src/camera/stampOptions';

test('a portrait 3:4 buffer becomes a centered landscape 4:3 crop', () => {
  expect(uprightQuarterTurns(undefined)).toBe(0);
  expect(uprightQuarterTurns('up')).toBe(0);
  expect(uprightQuarterTurns('left')).toBe(1);
  expect(uprightQuarterTurns('down')).toBe(2);
  expect(uprightQuarterTurns('right')).toBe(3);
  expect(orientedSize(1944, 2592, 1)).toEqual({width: 2592, height: 1944});

  const portrait = landscapeCropRect(3024, 4032);
  expect(portrait.x).toBe(0);
  expect(portrait.width).toBe(3024);
  expect(portrait.width / portrait.height).toBeCloseTo(4 / 3, 2);
  expect(portrait.y).toBe((4032 - portrait.height) / 2);

  const already = landscapeCropRect(4032, 3024);
  expect(already).toEqual({x: 0, y: 0, width: 4032, height: 3024});
});

test('red-eye forces the flash and a lens with no flash stays dark', () => {
  expect(hardwareFlash('red-eye', true)).toEqual({
    flashMode: 'on',
    enableRedEyeReduction: true,
  });
  expect(hardwareFlash('auto', true)).toEqual({
    flashMode: 'auto',
    enableRedEyeReduction: false,
  });
  expect(hardwareFlash('on', false)).toEqual({
    flashMode: 'off',
    enableRedEyeReduction: false,
  });
  expect(stepZoom(1, 'in', 0.5, 4)).toBe(1.25);
  expect(stepZoom(1, 'out', 1, 4)).toBe(1);
  expect(restingZoom(0.5, 8)).toBe(1);
});

test('the stamp clock matches the LCD date', () => {
  const now = new Date(2026, 10, 25);
  expect(
    lcdDateLabel(
      {
        dateStampEnabled: true,
        dateStampFormat: 'yy mm dd',
        dateStampClock: 'retro-year',
        retroYear: 2004,
      },
      now,
    ),
  ).toBe('2004.11.25');
  expect(
    stampFromSettings({
      dateStampEnabled: false,
      dateStampFormat: 'yy mm dd',
      dateStampClock: 'current',
      retroYear: 2004,
    }),
  ).toBeNull();
});

test('bake stores the graded jpeg and copies it to the roll only when asked', async () => {
  const framed = {dispose: jest.fn()} as unknown as SkImage;
  const render = jest.fn(() => ({
    bytes: new Uint8Array([1]),
    base64: 'abc',
    dataUri: 'data:image/jpeg;base64,abc',
    width: 1600,
    height: 1200,
    presetId: 'night-flash',
    stampText: "'04 11 25",
    jpegQuality: 68,
  }));
  const saveInApp = jest.fn(async () => 'file:///gallery/shot.jpg');
  let finishCopy!: (id: string) => void;
  const saveRoll = jest.fn(() => new Promise<string>(resolve => {
    finishCopy = resolve;
  }));
  const stamp = {
    enabled: true as const,
    format: 'yy mm dd' as const,
    clock: {kind: 'retro-year' as const, year: 2004},
  };

  const kept = await bakeCapture(
    {
      source: 'file:///tmp/raw.jpg',
      orientation: 'right',
      preset: 'night-flash',
      stamp,
      saveToRoll: true,
      now: new Date(2026, 10, 25),
    },
    {
      frame: jest.fn(async () => framed),
      render,
      saveInApp,
      saveRoll,
    },
  );

  expect(render).toHaveBeenCalledWith(framed, {
    preset: 'night-flash',
    stamp,
    now: new Date(2026, 10, 25),
  });
  expect(saveInApp).toHaveBeenCalledWith('data:image/jpeg;base64,abc');
  expect(saveRoll).toHaveBeenCalledWith('file:///gallery/shot.jpg');
  expect(kept).toMatchObject({
    uri: 'file:///gallery/shot.jpg',
    width: 1600,
    height: 1200,
    presetId: 'night-flash',
  });
  expect(framed.dispose).toHaveBeenCalledTimes(1);

  finishCopy('asset-1');
  await expect(kept.savedToRoll).resolves.toBe(true);

  saveRoll.mockClear();
  await bakeCapture(
    {
      source: new Uint8Array([4]),
      preset: 'ccd-classic',
      stamp: null,
      saveToRoll: false,
    },
    {
      frame: async () => ({dispose() {}}) as SkImage,
      render,
      saveInApp,
      saveRoll,
    },
  );
  expect(saveRoll).not.toHaveBeenCalled();
});

test('a baked frame is stored with its preset so playback does not treat it as legacy', async () => {
  const importUploadedPhoto = jest.fn(async () => 'data:image/jpeg;base64,abc');
  const saveCapturedPhoto = jest.fn(async () => 'file:///gallery/shot.jpg');
  const store = {importUploadedPhoto, saveCapturedPhoto};

  await storeBakedPhoto(store, 'data:image/jpeg;base64,abc', 'night-flash');
  expect(importUploadedPhoto).toHaveBeenCalledWith(
    'data:image/jpeg;base64,abc',
    {presetId: 'night-flash'},
  );
  expect(saveCapturedPhoto).not.toHaveBeenCalled();

  await storeBakedPhoto(store, 'file:///tmp/baked.jpg', 'ccd-classic');
  expect(saveCapturedPhoto).toHaveBeenCalledWith('file:///tmp/baked.jpg', {
    presetId: 'ccd-classic',
  });
});
