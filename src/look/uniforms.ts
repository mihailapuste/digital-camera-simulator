import type {CcdPreset} from './types';
import type {CcdUniformName} from './shaderSource';

export interface CcdUniforms {
  resolution: [number, number];
  sensorScale: number;
  softness: number;
  saturation: number;
  temperature: number;
  contrast: number;
  highlightClip: number;
  grain: number;
  chromaNoise: number;
  jpegBlock: number;
  vignette: number;
  flash: number;
  mono: number;
  blackLift: number;
  seed: number;
  matrix0: [number, number, number];
  matrix1: [number, number, number];
  matrix2: [number, number, number];
}

export type UniformRecord = Record<CcdUniformName, number | readonly number[]>;

export function stableSeed(key: string): number {
  let hash = 17;
  for (let index = 0; index < key.length; index += 1) {
    hash = (hash * 31 + key.charCodeAt(index)) % 1000003;
  }
  return hash % 997;
}

export function ccdUniformValues(args: {
  preset: CcdPreset;
  width: number;
  height: number;
  sensorScale: number;
  seed: number;
}): CcdUniforms {
  const matrix = args.preset.colorMatrix;
  return {
    resolution: [args.width, args.height],
    sensorScale: args.sensorScale,
    softness: args.preset.softness,
    saturation: args.preset.saturation,
    temperature: args.preset.temperature,
    contrast: args.preset.contrast,
    highlightClip: args.preset.highlightClip,
    grain: args.preset.grain,
    chromaNoise: args.preset.chromaNoise,
    jpegBlock: args.preset.jpegBlock,
    vignette: args.preset.vignette,
    flash: args.preset.flash,
    mono: args.preset.mono,
    blackLift: args.preset.blackLift,
    seed: args.seed,
    matrix0: [matrix[0], matrix[1], matrix[2]],
    matrix1: [matrix[3], matrix[4], matrix[5]],
    matrix2: [matrix[6], matrix[7], matrix[8]],
  };
}

export function asUniformRecord(values: CcdUniforms): UniformRecord {
  return values;
}

export interface UniformSlotInfo {
  slot: number;
  columns: number;
  rows: number;
}

/**
 * Minimal slice of SkRuntimeEffect used to pack uniforms. Tests pass a fake.
 * Tight packs follow Skia's processUniforms; slot gaps fall back to `slot`.
 */
export interface UniformEffectInfo {
  getUniformCount(): number;
  getUniformName(index: number): string;
  getUniform(index: number): UniformSlotInfo;
  getUniformFloatCount(): number;
}

function numbersFor(value: number | readonly number[]): number[] {
  return typeof value === 'number' ? [value] : [...value];
}

export function packUniforms(
  effect: UniformEffectInfo,
  uniforms: UniformRecord,
): number[] {
  const count = effect.getUniformCount();
  const packed: number[] = [];
  for (let index = 0; index < count; index += 1) {
    const name = effect.getUniformName(index);
    const value = uniforms[name as CcdUniformName];
    if (value === undefined) {
      throw new Error(`CCD shader is missing a value for uniform "${name}"`);
    }
    packed.push(...numbersFor(value));
  }
  const expected = effect.getUniformFloatCount();
  if (packed.length === expected) {
    return packed;
  }
  const slotted = new Array<number>(expected).fill(0);
  for (let index = 0; index < count; index += 1) {
    const name = effect.getUniformName(index);
    const info = effect.getUniform(index);
    const value = uniforms[name as CcdUniformName];
    if (value === undefined) {
      throw new Error(`CCD shader is missing a value for uniform "${name}"`);
    }
    const nums = numbersFor(value);
    for (let component = 0; component < nums.length; component += 1) {
      slotted[info.slot + component] = nums[component] ?? 0;
    }
  }
  return slotted;
}
