import {formatStampText} from '../../src/look/dateStamp';
import {
  DIGIT_SEGMENTS,
  parseStampText,
  planDateStamp,
} from '../../src/look/segments';
import {STAMP_FORMATS} from '../../src/look/types';

test('digits use the classic 7-segment patterns', () => {
  expect(DIGIT_SEGMENTS['0']).toEqual(['a', 'b', 'c', 'd', 'e', 'f']);
  expect(DIGIT_SEGMENTS['1']).toEqual(['b', 'c']);
  expect(DIGIT_SEGMENTS['2']).toEqual(['a', 'b', 'd', 'e', 'g']);
  expect(DIGIT_SEGMENTS['4']).toEqual(['b', 'c', 'f', 'g']);
  expect(DIGIT_SEGMENTS['8']).toHaveLength(7);
  expect(DIGIT_SEGMENTS['8']).not.toEqual(DIGIT_SEGMENTS['0']);
});

test("lays '04 11 24 into the bottom-right", () => {
  const text = "'04 11 24";
  const plan = planDateStamp(text, 800, 600);
  expect(plan.text).toBe(text);
  expect(plan.marks).toHaveLength(24);
  expect(plan.glowRadius).toBeGreaterThan(0);
  expect(plan.color).toBe('#FF8A14');

  let right = 0;
  let bottom = 0;
  for (const mark of plan.marks) {
    expect(mark.x).toBeGreaterThanOrEqual(0);
    expect(mark.y).toBeGreaterThanOrEqual(0);
    expect(mark.x + mark.width).toBeLessThanOrEqual(800);
    expect(mark.y + mark.height).toBeLessThanOrEqual(600);
    expect(mark.width).toBeGreaterThan(0);
    expect(mark.height).toBeGreaterThan(0);
    right = Math.max(right, mark.x + mark.width);
    bottom = Math.max(bottom, mark.y + mark.height);
  }
  expect(right).toBeGreaterThan(800 * 0.7);
  expect(bottom).toBeGreaterThan(600 * 0.85);
});

test('every stamp format stays inside the frame', () => {
  const date = {year: 2004, month: 11, day: 24};
  for (const format of STAMP_FORMATS) {
    const text = formatStampText(date, format);
    const plan = planDateStamp(text, 640, 480, {glow: 0});
    expect(plan.glowRadius).toBe(0);
    expect(plan.marks.length).toBeGreaterThan(0);
    for (const mark of plan.marks) {
      expect(mark.x).toBeGreaterThanOrEqual(0);
      expect(mark.y).toBeGreaterThanOrEqual(0);
      expect(mark.x + mark.width).toBeLessThanOrEqual(640);
      expect(mark.y + mark.height).toBeLessThanOrEqual(480);
    }
  }
});

test('rejects characters the LCD cannot draw', () => {
  expect(parseStampText("11/24/'04").map(glyph => glyph.kind)).toEqual([
    'digit',
    'digit',
    'slash',
    'digit',
    'digit',
    'slash',
    'apostrophe',
    'digit',
    'digit',
  ]);
  expect(() => parseStampText('04-11-24')).toThrow(
    /Unsupported date-stamp character "-"/,
  );
  expect(() => planDateStamp("'04", 0, 100)).toThrow(/positive size/);
});
