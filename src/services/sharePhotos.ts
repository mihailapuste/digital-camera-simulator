import {File, Paths} from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import {downloadFiles} from '../gallery/download';
import {sharePlaybackPhotosWith, type ShareDriver} from '../gallery/sharePlan';
import type {ShareablePhoto, ShareFile} from '../gallery/types';

function utiFor(file: ShareFile): string {
  return file.mimeType === 'image/png' ? 'public.png' : 'public.jpeg';
}

async function stageShareFile(file: ShareFile): Promise<string> {
  if (!file.uri.startsWith('file://') && !file.uri.startsWith('/')) {
    return file.uri;
  }
  try {
    const source = new File(
      file.uri.startsWith('/') ? `file://${file.uri}` : file.uri,
    );
    const destination = new File(Paths.cache, file.filename);
    if (destination.exists) {
      destination.delete();
    }
    await source.copy(destination);
    return destination.uri;
  } catch (error) {
    console.error('Could not rename the photo for sharing:', error);
    return file.uri;
  }
}

function nativeDriver(): ShareDriver {
  return {
    shareOne: async (file, dialogTitle) => {
      const uri = await stageShareFile(file);
      await Sharing.shareAsync(uri, {
        mimeType: file.mimeType,
        dialogTitle,
        UTI: utiFor(file),
      });
    },
    download: async files => {
      downloadFiles(files);
    },
  };
}

/**
 * Opens the system share sheet through expo-sharing.
 * One photo is one sheet. Several photos are one sheet each, in order,
 * because `shareAsync` accepts a single file URL.
 */
export async function sharePlaybackPhotos(photos: ShareablePhoto[]) {
  let available = false;
  try {
    available = await Sharing.isAvailableAsync();
  } catch (error) {
    console.error('Error checking the share sheet:', error);
  }
  return sharePlaybackPhotosWith(
    photos,
    {platform: 'native', webShare: false, available},
    nativeDriver(),
  );
}
