/** A row-major 3x3 color matrix applied in the CCD shader. */
export type ColorMatrix3x3 = [
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
];

/**
 * Plain data describing one digicam look. The UI can list these objects
 * directly; nothing here is a function or a Skia handle.
 */
export interface CcdPreset {
  id: string;
  name: string;
  description: string;
  /**
   * Fraction of linear resolution kept before the image is scaled back up.
   * Lower values are softer, like a smaller CCD.
   */
  sensorScale: number;
  /** Blur radius in sensor pixels. */
  softness: number;
  /** 1 keeps saturation, above 1 is the punchy compact look. */
  saturation: number;
  /** -1 cools toward cyan, +1 warms toward amber. */
  temperature: number;
  /** Contrast around mid grey. 1 leaves contrast alone. */
  contrast: number;
  /** 0 is a soft shoulder, 1 clips highlights hard. */
  highlightClip: number;
  /** Luma grain amplitude. */
  grain: number;
  /** Chroma noise amplitude. Shadows pick up more of it. */
  chromaNoise: number;
  /** JPEG-ish block smoothing and channel quantization, 0 to 1. */
  jpegBlock: number;
  /** Optical corner darkening, 0 to 1. */
  vignette: number;
  /** Harsh on-camera flash, 0 to 1. */
  flash: number;
  /** 1 is the in-camera monochrome scene mode. */
  mono: number;
  /** Raises the black point the way a cheap CCD never reaches true black. */
  blackLift: number;
  /** JPEG quality used when the look is baked. */
  jpegQuality: number;
  colorMatrix: ColorMatrix3x3;
}

export interface StampDate {
  /** Full year, for example 2004. */
  year: number;
  /** Month from 1 to 12. */
  month: number;
  /** Day of the month. */
  day: number;
}

/** Where the orange date stamp gets its calendar day. */
export type StampClock =
  | {kind: 'current'}
  | {kind: 'fixed'; year: number; month: number; day: number}
  | {kind: 'retro-year'; year: number};

/**
 * `'yy mm dd'` renders as `'04 11 24`.
 * `yyyy.mm.dd` renders as `2004.11.24`.
 */
export const STAMP_FORMATS = [
  'yy mm dd',
  'yyyy.mm.dd',
  'yy.mm.dd',
  'dd.mm.yy',
  'mm/dd/yy',
] as const;

export type StampFormat = (typeof STAMP_FORMATS)[number];

export interface DateStampOptions {
  /** Set false to bake the look with no stamp. Defaults to on. */
  enabled?: boolean;
  /**
   * `current` uses `now`. `retro-year` keeps that month and day but forces
   * the year. `fixed` uses an exact date. Defaults to a 2004 retro year.
   */
  clock?: StampClock;
  /** Defaults to `'yy mm dd'`. */
  format?: StampFormat;
  /** CSS color of the LCD segments. Defaults to amber. */
  color?: string;
  /** 0 to 1. Defaults to a slightly translucent burned-in stamp. */
  opacity?: number;
  /** 0 to 1 glow/bleed around the segments. */
  glow?: number;
}

export interface ResolvedStamp {
  text: string;
  date: StampDate;
  format: StampFormat;
  color: string;
  opacity: number;
  glow: number;
}

export interface StampMark {
  x: number;
  y: number;
  width: number;
  height: number;
  radius: number;
}

/** Segment rectangles for the burned-in date, in pixel space. */
export interface StampPlan {
  text: string;
  color: string;
  opacity: number;
  glow: number;
  glowRadius: number;
  marks: StampMark[];
}
