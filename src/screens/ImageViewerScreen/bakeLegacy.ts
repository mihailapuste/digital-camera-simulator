import {renderLook} from '@/look';
import {stampParts} from '@/gallery/format';

/** Bakes a CCD preset into a legacy frame. The stamp uses the capture day in 2004. */
export async function bakeLegacyLook(
  uri: string,
  presetId: string,
  timestamp: number,
): Promise<{base64: string; dataUri: string}> {
  const {month, day} = stampParts(timestamp);
  const jpeg = await renderLook({
    source: uri,
    preset: presetId,
    stamp: {
      clock: {kind: 'fixed', year: 2004, month, day},
      format: 'yy mm dd',
    },
  });
  return {base64: jpeg.base64, dataUri: jpeg.dataUri};
}
