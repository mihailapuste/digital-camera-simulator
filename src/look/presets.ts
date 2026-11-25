import type {CcdPreset, ColorMatrix3x3} from './types';

const identity: ColorMatrix3x3 = [1, 0, 0, 0, 1, 0, 0, 0, 1];

/**
 * Named looks a settings screen can render as a list. Numbers are tuned for
 * a 2004 compact: punchy, a little soft, and quick to clip.
 */
export const CCD_PRESETS: readonly CcdPreset[] = [
  {
    id: 'ccd-classic',
    name: 'CCD Classic',
    description:
      'Daylight compact from 2004: punchy color, soft detail, mild grain, and clipped highlights.',
    sensorScale: 0.72,
    softness: 0.85,
    saturation: 1.22,
    temperature: 0.12,
    contrast: 1.12,
    highlightClip: 0.7,
    grain: 0.045,
    chromaNoise: 0.032,
    jpegBlock: 0.38,
    vignette: 0.28,
    flash: 0,
    mono: 0,
    blackLift: 0.035,
    jpegQuality: 78,
    colorMatrix: [1.08, -0.04, -0.02, -0.03, 1.05, -0.01, -0.02, -0.05, 1.04],
  },
  {
    id: 'night-flash',
    name: 'Night Flash',
    description:
      'Direct on-camera flash: blown center, flat skin, dark corners, and coarse chroma noise.',
    sensorScale: 0.6,
    softness: 1.05,
    saturation: 0.9,
    temperature: -0.06,
    contrast: 0.86,
    highlightClip: 0.74,
    grain: 0.07,
    chromaNoise: 0.08,
    jpegBlock: 0.52,
    vignette: 0.62,
    flash: 0.95,
    mono: 0,
    blackLift: 0.04,
    jpegQuality: 68,
    colorMatrix: [1.02, 0.01, 0.02, 0.0, 1.0, 0.02, 0.01, 0.02, 1.06],
  },
  {
    id: 'cool-cyber',
    name: 'Cool Cyber',
    description:
      'Cybershot-style cool cast, snappier contrast, and cleaner blues.',
    sensorScale: 0.78,
    softness: 0.6,
    saturation: 1.3,
    temperature: -0.46,
    contrast: 1.2,
    highlightClip: 0.64,
    grain: 0.03,
    chromaNoise: 0.026,
    jpegBlock: 0.3,
    vignette: 0.22,
    flash: 0,
    mono: 0,
    blackLift: 0.028,
    jpegQuality: 82,
    colorMatrix: [0.96, 0.0, 0.03, -0.02, 1.04, 0.02, 0.0, 0.05, 1.14],
  },
  {
    id: 'warm-power',
    name: 'Warm Power',
    description:
      'PowerShot-style golden color, gentle contrast, and a soft vignette.',
    sensorScale: 0.7,
    softness: 1,
    saturation: 1.16,
    temperature: 0.52,
    contrast: 1.05,
    highlightClip: 0.58,
    grain: 0.038,
    chromaNoise: 0.028,
    jpegBlock: 0.34,
    vignette: 0.36,
    flash: 0,
    mono: 0,
    blackLift: 0.04,
    jpegQuality: 76,
    colorMatrix: [1.12, 0.03, 0.0, 0.0, 1.03, -0.02, -0.04, -0.02, 0.9],
  },
  {
    id: 'bw-mode',
    name: 'B&W Mode',
    description:
      'The in-camera monochrome scene mode, with grain and a heavier vignette.',
    sensorScale: 0.68,
    softness: 0.75,
    saturation: 0,
    temperature: 0,
    contrast: 1.24,
    highlightClip: 0.7,
    grain: 0.09,
    chromaNoise: 0.01,
    jpegBlock: 0.42,
    vignette: 0.42,
    flash: 0,
    mono: 1,
    blackLift: 0.03,
    jpegQuality: 74,
    colorMatrix: identity,
  },
  {
    id: 'indoor-tungsten',
    name: 'Indoor Tungsten',
    description:
      'Warm household bulbs, extra noise, mushy JPEG detail, and a hint of flash.',
    sensorScale: 0.58,
    softness: 1.2,
    saturation: 1.12,
    temperature: 0.64,
    contrast: 1.06,
    highlightClip: 0.76,
    grain: 0.08,
    chromaNoise: 0.07,
    jpegBlock: 0.58,
    vignette: 0.48,
    flash: 0.18,
    mono: 0,
    blackLift: 0.045,
    jpegQuality: 66,
    colorMatrix: [1.16, 0.04, 0.0, 0.02, 0.98, -0.03, -0.05, -0.03, 0.82],
  },
];

const RANGE: Record<
  keyof Omit<CcdPreset, 'id' | 'name' | 'description' | 'colorMatrix'>,
  readonly [number, number]
> = {
  sensorScale: [0.35, 1],
  softness: [0, 4],
  saturation: [0, 2],
  temperature: [-1, 1],
  contrast: [0.5, 1.8],
  highlightClip: [0, 1],
  grain: [0, 0.25],
  chromaNoise: [0, 0.25],
  jpegBlock: [0, 1],
  vignette: [0, 1],
  flash: [0, 1],
  mono: [0, 1],
  blackLift: [0, 0.12],
  jpegQuality: [40, 95],
};

function copyMatrix(matrix: readonly number[]): ColorMatrix3x3 {
  if (matrix.length !== 9) {
    throw new Error('colorMatrix must have 9 numbers');
  }
  return [
    matrix[0],
    matrix[1],
    matrix[2],
    matrix[3],
    matrix[4],
    matrix[5],
    matrix[6],
    matrix[7],
    matrix[8],
  ];
}

export function copyPreset(preset: CcdPreset): CcdPreset {
  return {
    ...preset,
    colorMatrix: copyMatrix(preset.colorMatrix),
  };
}

export function assertValidPreset(preset: CcdPreset): void {
  if (!preset || typeof preset.id !== 'string' || preset.id.trim() === '') {
    throw new Error('A CCD preset needs an id');
  }
  if (typeof preset.name !== 'string' || preset.name.trim() === '') {
    throw new Error(`Preset "${preset.id}" needs a name`);
  }
  if (
    typeof preset.description !== 'string' ||
    preset.description.trim() === ''
  ) {
    throw new Error(`Preset "${preset.id}" needs a description`);
  }
  const fields = Object.keys(RANGE) as (keyof typeof RANGE)[];
  for (const field of fields) {
    const value = preset[field];
    const [min, max] = RANGE[field];
    if (typeof value !== 'number' || !Number.isFinite(value)) {
      throw new Error(`Preset "${preset.id}" field ${field} must be a number`);
    }
    if (value < min || value > max) {
      throw new Error(
        `Preset "${preset.id}" field ${field} must be between ${min} and ${max}`,
      );
    }
  }
  if (!Array.isArray(preset.colorMatrix) || preset.colorMatrix.length !== 9) {
    throw new Error(`Preset "${preset.id}" colorMatrix must have 9 numbers`);
  }
  for (const entry of preset.colorMatrix) {
    if (typeof entry !== 'number' || !Number.isFinite(entry)) {
      throw new Error(
        `Preset "${preset.id}" colorMatrix must contain finite numbers`,
      );
    }
    if (entry < -0.5 || entry > 2) {
      throw new Error(
        `Preset "${preset.id}" colorMatrix entries must stay within -0.5 and 2`,
      );
    }
  }
}

/** Copies suitable for a settings list. Mutating a result does not change the catalog. */
export function listPresets(): CcdPreset[] {
  return CCD_PRESETS.map(preset => copyPreset(preset));
}

export function getPreset(id: string): CcdPreset {
  const found = CCD_PRESETS.find(preset => preset.id === id);
  if (!found) {
    const known = CCD_PRESETS.map(preset => preset.id).join(', ');
    throw new Error(`Unknown CCD preset "${id}". Known presets: ${known}`);
  }
  return copyPreset(found);
}

export function resolvePreset(
  preset: CcdPreset | string | undefined,
): CcdPreset {
  if (preset == null) {
    return getPreset('ccd-classic');
  }
  if (typeof preset === 'string') {
    return getPreset(preset);
  }
  assertValidPreset(preset);
  return preset;
}
