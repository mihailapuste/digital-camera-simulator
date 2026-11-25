import {
  formatShortYear,
  formatStampText,
  isValidStampDate,
  resolveStamp,
  resolveStampDate,
} from '../../src/look/dateStamp';
import {STAMP_FORMATS} from '../../src/look/types';
import {parseStampText} from '../../src/look/segments';

const classic = {year: 2004, month: 11, day: 24};
const now = new Date(2026, 10, 25);

test('formats the classic LCD strings', () => {
  expect(formatStampText(classic, 'yy mm dd')).toBe("'04 11 24");
  expect(formatStampText(classic, 'yyyy.mm.dd')).toBe('2004.11.24');
  expect(formatStampText(classic, 'yy.mm.dd')).toBe("'04.11.24");
  expect(formatStampText(classic, 'dd.mm.yy')).toBe("24.11.'04");
  expect(formatStampText(classic, 'mm/dd/yy')).toBe("11/24/'04");
  expect(formatStampText({year: 2004, month: 1, day: 2}, 'yyyy.mm.dd')).toBe(
    '2004.01.02',
  );
  expect(formatShortYear(1999)).toBe("'99");
  expect(formatShortYear(2000)).toBe("'00");
  expect(formatShortYear(2010)).toBe("'10");
});

test('every format only uses characters the stamp can draw', () => {
  for (const format of STAMP_FORMATS) {
    expect(() =>
      parseStampText(formatStampText(classic, format)),
    ).not.toThrow();
  }
});

test('current, retro-year, and fixed clocks', () => {
  expect(resolveStampDate({kind: 'current'}, now)).toEqual({
    year: 2026,
    month: 11,
    day: 25,
  });
  expect(resolveStampDate({kind: 'retro-year', year: 2004}, now)).toEqual({
    year: 2004,
    month: 11,
    day: 25,
  });
  expect(
    resolveStampDate({kind: 'fixed', year: 2004, month: 11, day: 24}, now),
  ).toEqual(classic);
  expect(
    resolveStamp(
      {
        clock: {kind: 'fixed', year: 2004, month: 11, day: 24},
        format: 'yyyy.mm.dd',
      },
      now,
    )?.text,
  ).toBe('2004.11.24');
});

test('defaults to a 2004 retro year and can be turned off', () => {
  expect(resolveStamp(undefined, now)?.text).toBe("'04 11 25");
  expect(resolveStamp(undefined, now)?.format).toBe('yy mm dd');
  expect(resolveStamp(null, now)).toBeNull();
  expect(resolveStamp({enabled: false}, now)).toBeNull();
});

test('rejects impossible dates and clamps a non-leap retro February 29', () => {
  expect(isValidStampDate({year: 2004, month: 2, day: 29})).toBe(true);
  expect(isValidStampDate({year: 2003, month: 2, day: 29})).toBe(false);
  expect(isValidStampDate({year: 2004, month: 4, day: 31})).toBe(false);
  expect(isValidStampDate({year: 2004, month: 0, day: 1})).toBe(false);
  expect(
    resolveStampDate({kind: 'retro-year', year: 2003}, new Date(2024, 1, 29)),
  ).toEqual({year: 2003, month: 2, day: 28});
  expect(
    resolveStampDate({kind: 'retro-year', year: 2004}, new Date(2024, 1, 29)),
  ).toEqual({year: 2004, month: 2, day: 29});
  expect(() =>
    resolveStampDate({kind: 'fixed', year: 2003, month: 2, day: 29}, now),
  ).toThrow(/Invalid stamp date 2003-02-29/);
  expect(() =>
    formatStampText({year: 2004.5, month: 11, day: 24}, 'yy mm dd'),
  ).toThrow(/Invalid stamp date/);
});
