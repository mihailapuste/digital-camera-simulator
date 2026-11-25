import {downloadFiles} from '../gallery/download';
import {sharePlaybackPhotosWith} from '../gallery/sharePlan';
import type {ShareablePhoto, ShareFile} from '../gallery/types';

function canUseWebShare(): boolean {
  return (
    typeof navigator !== 'undefined' && typeof navigator.share === 'function'
  );
}

async function fileFromShare(file: ShareFile): Promise<File> {
  const response = await fetch(file.uri);
  const blob = await response.blob();
  return new File([blob], file.filename, {type: file.mimeType});
}

/**
 * Prefers the browser share sheet, including a multi-file payload when the
 * browser accepts it. Otherwise each photo downloads.
 */
export async function sharePlaybackPhotos(photos: ShareablePhoto[]) {
  return sharePlaybackPhotosWith(
    photos,
    {platform: 'web', webShare: canUseWebShare()},
    {
      shareOne: async () => {
        throw new Error('The web share path does not use the native sheet.');
      },
      download: async files => {
        downloadFiles(files);
      },
      webShare: async files => {
        if (!canUseWebShare()) {
          return false;
        }
        try {
          const payload = await Promise.all(
            files.map(file => fileFromShare(file)),
          );
          const data = {files: payload};
          if (
            typeof navigator.canShare === 'function' &&
            !navigator.canShare(data)
          ) {
            return false;
          }
          await navigator.share(data);
          return true;
        } catch (error) {
          if (error instanceof DOMException && error.name === 'AbortError') {
            return true;
          }
          console.error('Web share failed:', error);
          return false;
        }
      },
    },
  );
}
