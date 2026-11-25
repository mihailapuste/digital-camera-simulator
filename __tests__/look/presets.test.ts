import {
  assertValidPreset,
  getPreset,
  listPresets,
  resolvePreset,
} from '../../src/look/presets';

test('lists four to six plain preset objects with unique ids and names', () => {
  const presets = listPresets();
  expect(presets.length).toBeGreaterThanOrEqual(4);
  expect(presets.length).toBeLessThanOrEqual(6);
  expect(new Set(presets.map(preset => preset.id)).size).toBe(presets.length);
  expect(new Set(presets.map(preset => preset.name)).size).toBe(presets.length);

  for (const preset of presets) {
    expect(typeof preset.description).toBe('string');
    expect(preset.description.length).toBeGreaterThan(0);
    expect(() => assertValidPreset(preset)).not.toThrow();
    expect(JSON.parse(JSON.stringify(preset))).toEqual(preset);
    expect(preset).not.toBe(getPreset(preset.id));
  }
});

test('catalog copies do not leak mutations', () => {
  const first = listPresets();
  first[0].name = 'Mutated';
  first[0].colorMatrix[0] = 9;
  expect(listPresets()[0].name).not.toBe('Mutated');
  expect(listPresets()[0].colorMatrix[0]).not.toBe(9);
});

test('named looks match the digicam characters they advertise', () => {
  expect(getPreset('ccd-classic').name).toBe('CCD Classic');
  expect(getPreset('ccd-classic').flash).toBe(0);
  expect(getPreset('night-flash').name).toBe('Night Flash');
  expect(getPreset('night-flash').flash).toBeGreaterThanOrEqual(0.8);
  expect(getPreset('cool-cyber').temperature).toBeLessThan(0);
  expect(getPreset('warm-power').temperature).toBeGreaterThan(0);
  expect(getPreset('bw-mode').name).toBe('B&W Mode');
  expect(getPreset('bw-mode').mono).toBe(1);
  expect(getPreset('indoor-tungsten').temperature).toBeGreaterThan(0.4);
});

test('resolves ids and rejects unknown presets', () => {
  expect(resolvePreset(undefined).id).toBe('ccd-classic');
  expect(resolvePreset('warm-power').name).toBe('Warm Power');
  expect(() => getPreset('not-a-look')).toThrow(/Unknown CCD preset/);
  expect(() =>
    assertValidPreset({
      ...getPreset('ccd-classic'),
      jpegQuality: 1,
    }),
  ).toThrow(/jpegQuality/);
});
