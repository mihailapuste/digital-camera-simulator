import type {FlashMode, FocusState, LcdMode, LcdTheme} from './types';

export type BuildableLcd = {
  theme: LcdTheme;
  batteryLevel: number;
  shotsRemaining: number;
  flashMode: FlashMode;
  dateText: string;
  focus: FocusState;
  mode: LcdMode;
  /** Live viewfinder only. Review replaces the brackets with a frame. */
  showBrackets: boolean;
};
