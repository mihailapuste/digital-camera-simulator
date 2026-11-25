import {containRect, fitOutputSize, sensorSize} from '../../src/look/frame';
import {getPreset} from '../../src/look/presets';
import {CCD_SKSL, CCD_UNIFORM_NAMES} from '../../src/look/shaderSource';
import {
  asUniformRecord,
  ccdUniformValues,
  packUniforms,
  stableSeed,
  type UniformEffectInfo,
  type UniformRecord,
} from '../../src/look/uniforms';

test('fits the long edge without enlarging and keeps even JPEG dimensions', () => {
  expect(fitOutputSize(4000, 3000, 1600)).toEqual({width: 1600, height: 1200});
  expect(fitOutputSize(800, 600, 1600)).toEqual({width: 800, height: 600});
  expect(fitOutputSize(1920, 1280, 1024)).toEqual({width: 1024, height: 682});
  expect(fitOutputSize(3, 5, 1600)).toEqual({width: 2, height: 4});
  expect(() => fitOutputSize(0, 10)).toThrow(/no pixels/);
  expect(sensorSize(1600, 1200, 0.5)).toEqual({width: 800, height: 600});
  const contained = containRect(1920, 1280, 400, 400);
  expect(contained.width).toBeCloseTo(400);
  expect(contained.height).toBeCloseTo((1280 * 400) / 1920);
  expect(contained.x).toBeCloseTo(0);
  expect(contained.y).toBeGreaterThan(0);
});

test('builds named uniforms from a preset', () => {
  const preset = getPreset('night-flash');
  const values = ccdUniformValues({
    preset,
    width: 320,
    height: 240,
    sensorScale: 1,
    seed: 7,
  });
  expect(values.resolution).toEqual([320, 240]);
  expect(values.sensorScale).toBe(1);
  expect(values.flash).toBe(preset.flash);
  expect(values.seed).toBe(7);
  expect(values.matrix0).toEqual([
    preset.colorMatrix[0],
    preset.colorMatrix[1],
    preset.colorMatrix[2],
  ]);
  expect(
    ccdUniformValues({
      preset: getPreset('bw-mode'),
      width: 8,
      height: 8,
      sensorScale: 0.68,
      seed: 1,
    }).mono,
  ).toBe(1);
  expect(stableSeed('ccd-classic')).toBe(stableSeed('ccd-classic'));
  expect(stableSeed('ccd-classic')).not.toBe(stableSeed('night-flash'));
});

test('packs uniforms tightly, and by slot when the runtime inserts gaps', () => {
  const values = asUniformRecord(
    ccdUniformValues({
      preset: getPreset('ccd-classic'),
      width: 320,
      height: 240,
      sensorScale: 0.72,
      seed: 9,
    }),
  );
  const tight: UniformEffectInfo = {
    getUniformCount: () => 2,
    getUniformName: index => (index === 0 ? 'resolution' : 'flash'),
    getUniform: index => ({
      slot: index === 0 ? 0 : 2,
      columns: index === 0 ? 2 : 1,
      rows: 1,
    }),
    getUniformFloatCount: () => 3,
  };
  expect(packUniforms(tight, values)).toEqual([320, 240, 0]);

  const gapped: UniformEffectInfo = {
    getUniformCount: () => 2,
    getUniformName: index => (index === 0 ? 'resolution' : 'seed'),
    getUniform: index => ({
      slot: index === 0 ? 0 : 4,
      columns: index === 0 ? 2 : 1,
      rows: 1,
    }),
    getUniformFloatCount: () => 5,
  };
  expect(packUniforms(gapped, values)).toEqual([320, 240, 0, 0, 9]);
});

test('refuses to pack a uniform the preset did not provide', () => {
  const values = asUniformRecord(
    ccdUniformValues({
      preset: getPreset('ccd-classic'),
      width: 2,
      height: 2,
      sensorScale: 1,
      seed: 0,
    }),
  );
  const effect: UniformEffectInfo = {
    getUniformCount: () => 1,
    getUniformName: () => 'not-a-uniform',
    getUniform: () => ({slot: 0, columns: 1, rows: 1}),
    getUniformFloatCount: () => 1,
  };
  expect(() => packUniforms(effect, values)).toThrow(/not-a-uniform/);
});

test('shader source declares the image child and every float uniform', () => {
  expect(CCD_SKSL).toContain('uniform shader image');
  expect(CCD_SKSL).toContain('half4 main');
  for (const name of CCD_UNIFORM_NAMES) {
    expect(CCD_SKSL).toContain(name);
  }
  expect(CCD_SKSL.split('{').length).toBe(CCD_SKSL.split('}').length);
  const record: UniformRecord = asUniformRecord(
    ccdUniformValues({
      preset: getPreset('cool-cyber'),
      width: 4,
      height: 4,
      sensorScale: 1,
      seed: 1,
    }),
  );
  expect(Object.keys(record).sort()).toEqual([...CCD_UNIFORM_NAMES].sort());
});
