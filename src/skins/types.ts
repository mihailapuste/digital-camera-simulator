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
  'power',
] as const;

export type SkinControlId = (typeof SKIN_CONTROLS)[number];

/**
 * Layout in the skin's viewBox. `resolveSkinLayout` maps these rects onto
 * any viewport with the same contain-fit the SVG uses, so a camera preview
 * lands on the LCD cutout at any screen size.
 */
export type SkinLayout = {
  viewBox: {width: number; height: number};
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
  onShutter?: () => void;
  onFlash?: () => void;
  onMode?: () => void;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onReview?: () => void;
  onPower?: () => void;
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
