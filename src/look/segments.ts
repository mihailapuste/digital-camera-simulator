import type {StampMark, StampPlan} from './types';

export type SegmentId = 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g';

/** Classic 7-segment patterns. Segment `a` is the top bar, `g` the middle. */
export const DIGIT_SEGMENTS: Record<string, readonly SegmentId[]> = {
  '0': ['a', 'b', 'c', 'd', 'e', 'f'],
  '1': ['b', 'c'],
  '2': ['a', 'b', 'd', 'e', 'g'],
  '3': ['a', 'b', 'c', 'd', 'g'],
  '4': ['b', 'c', 'f', 'g'],
  '5': ['a', 'c', 'd', 'f', 'g'],
  '6': ['a', 'c', 'd', 'e', 'f', 'g'],
  '7': ['a', 'b', 'c'],
  '8': ['a', 'b', 'c', 'd', 'e', 'f', 'g'],
  '9': ['a', 'b', 'c', 'd', 'f', 'g'],
};

export type StampGlyphKind = 'digit' | 'apostrophe' | 'dot' | 'slash' | 'space';

export interface StampGlyph {
  kind: StampGlyphKind;
  char: string;
  digit?: string;
}

const DIGIT_ASPECT = 0.58;
const THICKNESS = 0.155;
const GLYPH_GAP = 0.18;

export function parseStampText(text: string): StampGlyph[] {
  const glyphs: StampGlyph[] = [];
  for (const char of text) {
    if (char >= '0' && char <= '9') {
      glyphs.push({kind: 'digit', char, digit: char});
    } else if (char === "'") {
      glyphs.push({kind: 'apostrophe', char});
    } else if (char === '.') {
      glyphs.push({kind: 'dot', char});
    } else if (char === '/') {
      glyphs.push({kind: 'slash', char});
    } else if (char === ' ') {
      glyphs.push({kind: 'space', char});
    } else {
      throw new Error(`Unsupported date-stamp character "${char}"`);
    }
  }
  return glyphs;
}

function digitWidthFor(digitHeight: number): number {
  return digitHeight * DIGIT_ASPECT;
}

function emptyMark(): StampMark {
  return {x: 0, y: 0, width: 1, height: 1, radius: 0};
}

function segmentMarks(
  segments: readonly SegmentId[],
  digitHeight: number,
): StampMark[] {
  const width = digitWidthFor(digitHeight);
  const height = digitHeight;
  const thickness = Math.max(1, height * THICKNESS);
  const inset = thickness * 0.45;
  const radius = thickness * 0.45;
  const horizontal = (y: number): StampMark => ({
    x: inset,
    y,
    width: Math.max(1, width - inset * 2),
    height: thickness,
    radius,
  });
  const upperHeight = Math.max(1, height / 2 - thickness);
  const lowerY = height / 2 + thickness * 0.2;
  const lowerHeight = Math.max(1, height - lowerY - inset * 0.2);
  const vertical = (x: number, y: number, markHeight: number): StampMark => ({
    x,
    y,
    width: thickness,
    height: markHeight,
    radius,
  });
  const layout: Record<SegmentId, StampMark> = {
    a: horizontal(0),
    b: vertical(width - thickness, inset * 0.4, upperHeight),
    c: vertical(width - thickness, lowerY, lowerHeight),
    d: horizontal(height - thickness),
    e: vertical(0, lowerY, lowerHeight),
    f: vertical(0, inset * 0.4, upperHeight),
    g: horizontal(height / 2 - thickness / 2),
  };
  return segments.map(segment => layout[segment] ?? emptyMark());
}

function glyphAdvance(kind: StampGlyphKind, digitWidth: number): number {
  switch (kind) {
    case 'digit':
      return digitWidth;
    case 'apostrophe':
      return digitWidth * 0.34;
    case 'dot':
      return digitWidth * 0.34;
    case 'slash':
      return digitWidth * 0.48;
    case 'space':
      return digitWidth * 0.55;
    default: {
      const unknown: never = kind;
      return unknown;
    }
  }
}

function glyphMarks(
  glyph: StampGlyph,
  digitHeight: number,
  boxWidth: number,
): StampMark[] {
  const thickness = Math.max(1, digitHeight * THICKNESS);
  if (glyph.kind === 'digit' && glyph.digit) {
    return segmentMarks(DIGIT_SEGMENTS[glyph.digit] ?? [], digitHeight);
  }
  if (glyph.kind === 'apostrophe') {
    const width = thickness * 0.8;
    return [
      {
        x: boxWidth - width,
        y: 0,
        width,
        height: digitHeight * 0.28,
        radius: width / 2,
      },
    ];
  }
  if (glyph.kind === 'dot') {
    const size = thickness * 0.95;
    return [
      {
        x: (boxWidth - size) / 2,
        y: digitHeight - size,
        width: size,
        height: size,
        radius: size * 0.25,
      },
    ];
  }
  if (glyph.kind === 'slash') {
    const size = thickness * 0.72;
    const marks: StampMark[] = [];
    const steps = 4;
    for (let index = 0; index < steps; index += 1) {
      const t = index / (steps - 1);
      marks.push({
        x: t * Math.max(0, boxWidth - size),
        y: (1 - t) * Math.max(0, digitHeight - size),
        width: size,
        height: size,
        radius: size * 0.2,
      });
    }
    return marks;
  }
  return [];
}

interface MeasuredStamp {
  width: number;
  digitHeight: number;
  marks: StampMark[];
}

function measureStamp(
  glyphs: readonly StampGlyph[],
  digitHeight: number,
): MeasuredStamp {
  const digitWidth = digitWidthFor(digitHeight);
  const gap = digitWidth * GLYPH_GAP;
  const marks: StampMark[] = [];
  let cursor = 0;
  glyphs.forEach((glyph, index) => {
    const advance = glyphAdvance(glyph.kind, digitWidth);
    for (const mark of glyphMarks(glyph, digitHeight, advance)) {
      marks.push({...mark, x: mark.x + cursor});
    }
    cursor += advance;
    const next = glyphs[index + 1];
    if (next && glyph.kind !== 'space' && next.kind !== 'space') {
      cursor += gap;
    }
  });
  return {width: cursor, digitHeight, marks};
}

function offsetMarks(
  marks: readonly StampMark[],
  x: number,
  y: number,
): StampMark[] {
  return marks.map(mark => ({
    ...mark,
    x: mark.x + x,
    y: mark.y + y,
  }));
}

export interface StampStyle {
  color?: string;
  opacity?: number;
  glow?: number;
}

/**
 * Lays the 7-segment stamp into the bottom-right of a frame.
 * The returned rectangles are what both the live preview and the bake draw.
 */
export function planDateStamp(
  text: string,
  width: number,
  height: number,
  style: StampStyle = {},
): StampPlan {
  if (!(width > 0) || !(height > 0)) {
    throw new Error('Stamp frame must have a positive size');
  }
  const glyphs = parseStampText(text);
  const opacity = style.opacity ?? 0.94;
  const glow = style.glow ?? 0.8;
  const color = style.color ?? '#FF8A14';
  if (glyphs.length === 0) {
    return {
      text,
      color,
      opacity,
      glow,
      glowRadius: 0,
      marks: [],
    };
  }
  const marginX = Math.max(6, width * 0.034);
  const marginY = Math.max(6, height * 0.042);
  let digitHeight = Math.min(height * 0.058, width * 0.08);
  let measured = measureStamp(glyphs, digitHeight);
  const available = Math.max(8, width - marginX * 2);
  if (measured.width > available && measured.width > 0) {
    digitHeight *= available / measured.width;
    measured = measureStamp(glyphs, digitHeight);
  }
  const originX = width - marginX - measured.width;
  const originY = height - marginY - digitHeight;
  const glowRadius = glow <= 0 ? 0 : Math.max(0.8, digitHeight * 0.2 * glow);
  return {
    text,
    color,
    opacity,
    glow,
    glowRadius,
    marks: offsetMarks(measured.marks, originX, originY),
  };
}
