import {useMemo} from 'react';
import type {SkRuntimeEffect} from '@shopify/react-native-skia';

import {resolveStamp} from './dateStamp';
import {getCcdRuntimeEffect} from './effect';
import {resolvePreset} from './presets';
import {planDateStamp} from './segments';
import type {CcdPreset, DateStampOptions, StampPlan} from './types';
import {
  asUniformRecord,
  ccdUniformValues,
  stableSeed,
  type UniformRecord,
} from './uniforms';

export interface LookPreviewState {
  effect: SkRuntimeEffect;
  uniforms: UniformRecord;
  stampPlan: StampPlan | null;
  preset: CcdPreset;
  stampText: string | null;
}

export interface UseLookPreviewArgs {
  preset?: CcdPreset | string;
  width: number;
  height: number;
  stamp?: DateStampOptions | null;
  seed?: number;
  now?: Date;
}

/**
 * Live-preview inputs for a Skia `<Shader>`. The grade is the same shader the
 * bake uses. `sensorScale` stays on the preset value so a viewfinder pixel
 * covers the same fraction of the frame as a baked sensor pixel.
 */
export function useLookPreview({
  preset: presetInput,
  width,
  height,
  stamp,
  seed,
  now,
}: UseLookPreviewArgs): LookPreviewState {
  const effect = useMemo(() => getCcdRuntimeEffect(), []);
  const clock = now ?? new Date();
  const year = clock.getFullYear();
  const month = clock.getMonth();
  const day = clock.getDate();

  return useMemo(() => {
    const preset = resolvePreset(presetInput);
    const uniforms = asUniformRecord(
      ccdUniformValues({
        preset,
        width,
        height,
        sensorScale: preset.sensorScale,
        seed: seed ?? stableSeed(preset.id),
      }),
    );
    const resolvedStamp = resolveStamp(stamp, new Date(year, month, day));
    const stampPlan = resolvedStamp
      ? planDateStamp(resolvedStamp.text, width, height, {
          color: resolvedStamp.color,
          opacity: resolvedStamp.opacity,
          glow: resolvedStamp.glow,
        })
      : null;
    return {
      effect,
      uniforms,
      stampPlan,
      preset,
      stampText: resolvedStamp ? resolvedStamp.text : null,
    };
  }, [effect, presetInput, width, height, stamp, seed, year, month, day]);
}
