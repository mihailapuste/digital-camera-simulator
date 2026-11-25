/**
 * Small record kept beside each stored photo. Existing files that predate
 * this record still open; they simply have no preset and no baked look.
 */
export type PhotoMeta = {
  /** Capture time in milliseconds. */
  timestamp: number;
  /** CCD preset id, when the camera or the viewer recorded one. */
  presetId: string | null;
  /** DCF-style name such as `100-0042`. */
  fileNumber: string;
  /** True once `renderLook` has been baked into the file. */
  lookBaked: boolean;
  /** Bumps when the pixels change so cached thumbnails refresh. */
  revision: number;
};

/**
 * Optional note the camera screen can pass when it saves a capture.
 * Omitted fields stay compatible with the previous `saveCapturedPhoto(path)` call.
 * Pass `presetId` (or `lookBaked: true`) after baking, otherwise the photo
 * stays a legacy frame and playback offers Apply look.
 */
export type CaptureMetaInput = {
  timestamp?: number;
  presetId?: string | null;
  lookBaked?: boolean;
  fileNumber?: string;
};

export type GalleryPhoto = {
  uri: string;
  name: string;
  timestamp: number;
  presetId: string | null;
  fileNumber: string;
  lookBaked: boolean;
  revision: number;
};

export type ShareFile = {
  uri: string;
  filename: string;
  mimeType: 'image/jpeg' | 'image/png';
};

export type ShareablePhoto = {
  uri: string;
  name: string;
  fileNumber: string;
};
