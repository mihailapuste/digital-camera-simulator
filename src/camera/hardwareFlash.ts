import type {FlashMode} from '../lcd/types';

export type HardwareFlash = 'off' | 'on' | 'auto';

/**
 * The LCD cycles auto / on / off / red-eye. The sensor only has off, on,
 * and auto. Red-eye forces the flash and asks the camera to reduce red-eye
 * when that flag exists.
 */
export function hardwareFlash(
  mode: FlashMode,
  hasFlash: boolean,
): {flashMode: HardwareFlash; enableRedEyeReduction: boolean} {
  if (!hasFlash || mode === 'off') {
    return {flashMode: 'off', enableRedEyeReduction: false};
  }
  if (mode === 'red-eye') {
    return {flashMode: 'on', enableRedEyeReduction: true};
  }
  return {flashMode: mode, enableRedEyeReduction: false};
}
