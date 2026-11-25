import type {ShareablePhoto, ShareFile} from './types';

export type ShareEnv = {
  platform: 'native' | 'web';
  /** True when the browser exposes `navigator.share`. */
  webShare: boolean;
  /** False when the native share sheet cannot be presented. */
  available?: boolean;
};

export type SharePlan =
  | {channel: 'native-sheet'; files: ShareFile[]; dialogTitle: string}
  | {channel: 'web-share'; files: ShareFile[]}
  | {channel: 'web-download'; files: ShareFile[]};

export type ShareOutcome =
  | {ok: true; channel: 'sheet' | 'web-share' | 'download'; count: number}
  | {ok: false; reason: 'unavailable' | 'failed' | 'empty'; message: string};

export type ShareDriver = {
  shareOne: (file: ShareFile, dialogTitle: string) => Promise<void>;
  /**
   * Optional one-sheet handoff for several files.
   * expo-sharing's `shareAsync` accepts a single URL, so the native driver
   * leaves this unset and the runner presents the sheet once per file.
   */
  shareMany?: (files: ShareFile[], dialogTitle: string) => Promise<void>;
  download: (files: ShareFile[]) => Promise<void>;
  /** Returns false when the browser rejects the file list. */
  webShare?: (files: ShareFile[]) => Promise<boolean>;
};

export function shareFilename(photo: ShareablePhoto): string {
  const lower = photo.name.toLowerCase();
  const extension = lower.endsWith('.png') ? 'png' : 'jpg';
  return `${photo.fileNumber}.${extension}`;
}

export function mimeForName(name: string): ShareFile['mimeType'] {
  return name.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg';
}

export function planShare(photos: ShareablePhoto[], env: ShareEnv): SharePlan {
  if (photos.length === 0) {
    throw new Error('Nothing to share');
  }
  const files = photos.map(photo => ({
    uri: photo.uri,
    filename: shareFilename(photo),
    mimeType: mimeForName(photo.name),
  }));
  if (env.platform === 'web') {
    return env.webShare
      ? {channel: 'web-share', files}
      : {channel: 'web-download', files};
  }
  const dialogTitle =
    files.length === 1
      ? `Share ${photos[0].fileNumber}`
      : `Share ${files.length} photos`;
  return {channel: 'native-sheet', files, dialogTitle};
}

export async function runSharePlan(
  plan: SharePlan,
  driver: ShareDriver,
): Promise<ShareOutcome> {
  if (plan.channel === 'web-download') {
    await driver.download(plan.files);
    return {ok: true, channel: 'download', count: plan.files.length};
  }
  if (plan.channel === 'web-share') {
    const shared = driver.webShare ? await driver.webShare(plan.files) : false;
    if (!shared) {
      await driver.download(plan.files);
      return {ok: true, channel: 'download', count: plan.files.length};
    }
    return {ok: true, channel: 'web-share', count: plan.files.length};
  }
  if (plan.files.length > 1 && driver.shareMany) {
    await driver.shareMany(plan.files, plan.dialogTitle);
    return {ok: true, channel: 'sheet', count: plan.files.length};
  }
  for (let index = 0; index < plan.files.length; index += 1) {
    const file = plan.files[index];
    const title =
      plan.files.length === 1
        ? plan.dialogTitle
        : `Share ${index + 1} of ${plan.files.length}`;
    await driver.shareOne(file, title);
  }
  return {ok: true, channel: 'sheet', count: plan.files.length};
}

export async function sharePlaybackPhotosWith(
  photos: ShareablePhoto[],
  env: ShareEnv,
  driver: ShareDriver,
): Promise<ShareOutcome> {
  if (photos.length === 0) {
    return {
      ok: false,
      reason: 'empty',
      message: 'Choose a photo to share.',
    };
  }
  if (env.platform === 'native' && env.available === false) {
    return {
      ok: false,
      reason: 'unavailable',
      message: 'Sharing is not available on this device.',
    };
  }
  try {
    const plan = planShare(photos, env);
    return await runSharePlan(plan, driver);
  } catch (error) {
    console.error('Error sharing photos:', error);
    return {
      ok: false,
      reason: 'failed',
      message: 'Could not share these photos.',
    };
  }
}
