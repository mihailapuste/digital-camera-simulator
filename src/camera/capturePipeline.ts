import {renderSkImage, type DateStampOptions} from '../look';
import {
  frameCapture,
  type CaptureOrientation,
} from './frameCapture';
import type {SkImage} from '@shopify/react-native-skia';

export type BakeCaptureInput = {
  source: SkImage | string | Uint8Array;
  orientation?: CaptureOrientation;
  preset: string;
  stamp: DateStampOptions | null;
  saveToRoll: boolean;
  now?: Date;
};

export type BakedPhotoStore = {
  importUploadedPhoto: (
    dataUrl: string,
    capture?: {presetId?: string | null},
  ) => Promise<string | null>;
  saveCapturedPhoto: (
    path: string,
    capture?: {presetId?: string | null},
  ) => Promise<string | null>;
};

/**
 * A baked JPEG is a data URL on the web and may be a file path on native.
 * Either way the gallery needs `presetId` so the frame is not left legacy.
 */
export async function storeBakedPhoto(
  store: BakedPhotoStore,
  location: string,
  presetId: string,
): Promise<string | null> {
  const capture = {presetId};
  if (location.startsWith('data:')) {
    return store.importUploadedPhoto(location, capture);
  }
  return store.saveCapturedPhoto(location, capture);
}

export type BakeCaptureDeps = {
  frame?: typeof frameCapture;
  render?: typeof renderSkImage;
  saveInApp: (dataUri: string) => Promise<string | null>;
  saveRoll?: (uri: string) => Promise<string | null>;
};

export type BakedCapture = {
  uri: string;
  savedToRoll: boolean;
  width: number;
  height: number;
  presetId: string;
  stampText: string | null;
};

/**
 * Frames a capture as landscape 4:3, bakes the CCD look and date stamp,
 * stores it in the in-app gallery, and optionally copies it to the camera roll.
 */
export async function bakeCapture(
  input: BakeCaptureInput,
  deps: BakeCaptureDeps,
): Promise<BakedCapture> {
  const frame = deps.frame ?? frameCapture;
  const render = deps.render ?? renderSkImage;
  const framed = await frame({
    source: input.source,
    orientation: input.orientation,
  });
  try {
    const jpeg = render(framed, {
      preset: input.preset,
      stamp: input.stamp,
      now: input.now,
    });
    const uri = await deps.saveInApp(jpeg.dataUri);
    if (!uri) {
      throw new Error('The in-app gallery did not keep the photo');
    }
    let savedToRoll = false;
    if (input.saveToRoll && deps.saveRoll) {
      try {
        const rollId = await deps.saveRoll(uri);
        savedToRoll = rollId != null;
      } catch (error) {
        console.error('Could not copy the photo to the camera roll:', error);
      }
    }
    return {
      uri,
      savedToRoll,
      width: jpeg.width,
      height: jpeg.height,
      presetId: jpeg.presetId,
      stampText: jpeg.stampText,
    };
  } finally {
    framed.dispose();
  }
}
