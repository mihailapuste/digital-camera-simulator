import type {ComponentType, ReactNode} from 'react';
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

/**
 * Layout in the skin's viewBox. `resolveSkinLayout` maps these rects onto
 * any viewport with the same contain-fit the SVG uses, so a camera preview
 * lands on the LCD cutout at any screen size.
 */
/** Clockwise quarter-turns applied when a landscape body is drawn on screen. */
export type SkinRotation = 0 | 90;

export type SkinLayout = {
  viewBox: {width: number; height: number};
  /**
   * `90` turns a landscape camera back clockwise so it fills a portrait phone.
   * Hit targets and the LCD are stored in the unrotated design and mapped
   * through the same turn.
   */
  rotation?: SkinRotation;
  lcd: DesignRect;
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
};

export type CameraSkinProps = {
  width: number;
  height: number;
  rotation?: SkinRotation;
  onShutter?: () => void;
  onFlash?: () => void;
  onMode?: () => void;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onReview?: () => void;
  onExpandViewfinder?: () => void;
  /** DISP. Toggles the LCD overlay. */
  onDisplay?: () => void;
  /** FUNC. Opens the preset / look picker. */
  onFunc?: () => void;
  /** MENU. Opens settings. */
  onMenu?: () => void;
  /** SET. Confirms the current choice. */
  onSet?: () => void;
  /** Long-press the camera side of the slide to flip front and back. */
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
