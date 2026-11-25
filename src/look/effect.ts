import {Skia, type SkRuntimeEffect} from '@shopify/react-native-skia';

import {CCD_SKSL} from './shaderSource';

let cached: SkRuntimeEffect | null = null;

/**
 * Compiles on first use. Importing this module does not touch Skia, so web
 * startup can finish LoadSkiaWeb before any shader is built.
 */
export function getCcdRuntimeEffect(): SkRuntimeEffect {
  if (cached) {
    return cached;
  }
  const effect = Skia.RuntimeEffect.Make(CCD_SKSL);
  if (!effect) {
    throw new Error(
      'CCD look shader failed to compile. On web, bake or preview only after LoadSkiaWeb has resolved.',
    );
  }
  cached = effect;
  return effect;
}
