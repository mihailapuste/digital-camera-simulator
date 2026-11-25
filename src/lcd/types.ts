export type FlashMode = 'auto' | 'on' | 'off' | 'red-eye';

export type FocusState = 'idle' | 'searching' | 'locked';

export type LcdMode = 'live' | 'review';

export type LcdThemeName = 'classic' | 'amber' | 'ice';

export type LcdTheme = {
  text: string;
  shadow: string;
  bracket: string;
  bracketLocked: string;
  reviewScrim: string;
  reviewFrame: string;
  battery: string;
  batteryLow: string;
  icon: string;
  redEye: string;
  /** Dark plate behind white status glyphs. */
  iconWell: string;
};

export type LcdOverlayProps = {
  /** Defaults to 100% so the overlay fills the skin's LCD slot. */
  width?: number | string;
  height?: number | string;
  theme?: LcdThemeName | Partial<LcdTheme>;
  square?: boolean;
  /** 0–1. At or below 0.2 the cells turn the theme's low color. */
  batteryLevel?: number;
  shotsRemaining?: number;
  /** Opens playback when the shots counter is pressed. */
  onOpenPlayback?: () => void;
  flashMode?: FlashMode;
  /** A Date is formatted as YYYY.MM.DD in UTC. A string is drawn as given. */
  date?: Date | string;
  focus?: FocusState;
  mode?: LcdMode;
  /**
   * Searching brackets blink. Locked brackets spring inward.
   * Turn this off for stable snapshots.
   */
  animated?: boolean;
};

export const LCD_VIEWBOX = {width: 400, height: 300};
