import {formatShots} from './format';
import {batteryIcon, flashIcon, focusBrackets} from './icons';
import {pixelTextBlock, pixelTextHeight, rightPixelText} from './pixelFont';
import type {BuildableLcd} from './sceneOptions';
import {LCD_VIEWBOX, type LcdTheme} from './types';
import {group, rect, type Scene} from '../skins/sceneModel';

export type {BuildableLcd} from './sceneOptions';

const BRACKET = {
  idle: {insetX: 118, insetY: 70, arm: 34, thickness: 3},
  searching: {insetX: 118, insetY: 70, arm: 34, thickness: 3},
  locked: {insetX: 142, insetY: 90, arm: 24, thickness: 3.5},
};

export function buildFocusBracketScene(
  theme: LcdTheme,
  focus: 'idle' | 'searching' | 'locked',
): Scene {
  const spec = BRACKET[focus];
  const color = focus === 'locked' ? theme.bracketLocked : theme.bracket;
  return {
    viewBox: LCD_VIEWBOX,
    gradients: [],
    nodes: [
      focusBrackets(
        LCD_VIEWBOX.width,
        LCD_VIEWBOX.height,
        spec.insetX,
        spec.insetY,
        spec.arm,
        spec.thickness,
        color,
      ),
    ],
  };
}

export function buildLcdScene(options: BuildableLcd): Scene {
  const {theme, mode} = options;
  const shots = formatShots(options.shotsRemaining);
  const dateScale = 3;
  const shotScale = 6;
  const nodes = [
    flashIcon(options.flashMode, 14, 12, 26, theme.icon, theme.redEye),
    batteryIcon(330, 14, 56, 20, options.batteryLevel, {
      fill: theme.battery,
      low: theme.batteryLow,
      outline: theme.icon,
    }),
    ...pixelTextBlock(
      options.dateText,
      14,
      262,
      dateScale,
      theme.text,
      theme.shadow,
    ),
    ...rightPixelText(
      shots,
      386,
      LCD_VIEWBOX.height - 12 - pixelTextHeight(shotScale),
      shotScale,
      theme.text,
      theme.shadow,
    ),
  ];

  if (mode === 'review') {
    const label = 'REVIEW';
    const scale = 4;
    const width = label.length * 6 * scale - scale;
    nodes.unshift(
      rect(0, 0, LCD_VIEWBOX.width, LCD_VIEWBOX.height, {
        fill: theme.reviewScrim,
      }),
    );
    nodes.push(
      rect(10, 10, LCD_VIEWBOX.width - 20, LCD_VIEWBOX.height - 20, {
        fill: 'none',
        stroke: theme.reviewFrame,
        strokeWidth: 3,
      }),
      group(
        pixelTextBlock(
          label,
          (LCD_VIEWBOX.width - width) / 2,
          (LCD_VIEWBOX.height - pixelTextHeight(scale)) / 2,
          scale,
          theme.text,
          theme.shadow,
        ),
      ),
    );
  } else if (options.showBrackets) {
    const spec = BRACKET[options.focus];
    const color =
      options.focus === 'locked' ? theme.bracketLocked : theme.bracket;
    nodes.push(
      focusBrackets(
        LCD_VIEWBOX.width,
        LCD_VIEWBOX.height,
        spec.insetX,
        spec.insetY,
        spec.arm,
        spec.thickness,
        color,
      ),
    );
  }

  return {viewBox: LCD_VIEWBOX, gradients: [], nodes};
}
