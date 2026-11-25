import type {ComponentType, ReactNode} from 'react';
import type {EdgeInsets} from 'react-native-safe-area-context';
import type {LcdThemeName} from '../lcd/types';

export type DesignRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export const SKIN_CONTROLS = [
  'shutter',
  'flash',
  'mode',
  'zoomIn',
  'zoomOut',
  'review',
  'viewfinder',
  'display',
  'func',
  'menu',
  'set',
] as const;

export type SkinControlId = (typeof SKIN_CONTROLS)[number];

/** Clockwise quarter-turns applied when a landscape body is drawn on screen. */
export type SkinRotation = 0 | 90;

export type SkinLayout = {
  viewBox: {width: number; height: number};
  /** Crop inside the outer trim when the body fills the device. */
  bleed?: DesignRect;
  /**
   * `90` turns a landscape camera back clockwise for a portrait viewport.
   * Hit targets and the LCD are stored in the unrotated design and mapped
   * through the same turn.
   */
  rotation?: SkinRotation;
  lcd: DesignRect;
  /** Outer artwork around the LCD, used to clear the top status bar. */
  lcdBezel?: DesignRect;
  lcdRadius?: number;
  controls: Record<SkinControlId, DesignRect>;
};

export type PixelRect = {
  left: number;
  top: number;
  width: number;
  height: number;
};

export type ResolvedSkinLayout = {
  scale: number;
  offsetX: number;
  offsetY: number;
  frame: PixelRect;
  lcd: PixelRect;
  controls: Record<SkinControlId, PixelRect>;
  artworkTiles?: {clip: PixelRect; frame: PixelRect}[];
};

export type CameraSkinProps = {
  width: number;
  height: number;
  rotation?: SkinRotation;
  /** Fill the viewport while keeping the LCD and controls inside these insets. */
  safeArea?: EdgeInsets;
  onShutter?: () => void;
  onFlash?: () => void;
  onMode?: () => void;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onReview?: () => void;
  onExpandViewfinder?: () => void;
  /** DISP. Toggles the LCD overlay. */
  onDisplay?: () => void;
  /** Opens the preset picker. */
  onFunc?: () => void;
  /** MENU. Opens settings. */
  onMenu?: () => void;
  /** SET. Opens the preset picker. */
  onSet?: () => void;
  /** Long-press the camera control to switch between front and back. */
  onModeLongPress?: () => void;
  /** Drawn inside the LCD cutout, above an optional preview. */
  children?: ReactNode;
};

export type SkinDefinition = {
  id: string;
  name: string;
  description: string;
  lcdTheme: LcdThemeName;
  layout: SkinLayout;
  Component: ComponentType<CameraSkinProps>;
};
