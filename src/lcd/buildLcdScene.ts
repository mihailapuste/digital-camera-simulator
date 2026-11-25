import {formatShots} from './format';
import {
  batteryIcon,
  flashIcon,
  focusWindow,
  iconWell,
  qualityGlyph,
  redEyeGlyph,
  sceneModeGlyph,
} from './icons';
import {
  centeredPixelText,
  pixelTextBlock,
  pixelTextHeight,
  pixelTextWidth,
} from './pixelFont';
import type {BuildableLcd} from './sceneOptions';
import {LCD_VIEWBOX, type LcdTheme} from './types';
import {
  fmt,
  group,
  path,
  rect,
  type Scene,
  type SceneNode,
} from '../skins/sceneModel';

export type {BuildableLcd} from './sceneOptions';

const FOCUS_WINDOW = {
  idle: {x: 16, y: 92, width: 54, height: 40, stroke: 2.2},
  searching: {x: 16, y: 92, width: 54, height: 40, stroke: 2.2},
  locked: {x: 22, y: 98, width: 42, height: 30, stroke: 2.8},
};

function playGlyph(
  x: number,
  y: number,
  size: number,
  color: string,
): SceneNode {
  const cx = x + size * 0.55;
  const cy = y + size * 0.4;
  const s = size * 0.28;
  return path(
    `M${fmt(cx - s * 0.7)} ${fmt(cy - s)} L${fmt(cx - s * 0.7)} ${fmt(cy + s)} L${fmt(cx + s)} ${fmt(cy)} Z`,
    {fill: color},
  );
}

export function buildFocusBracketScene(
  theme: LcdTheme,
  focus: 'idle' | 'searching' | 'locked',
): Scene {
  const spec = FOCUS_WINDOW[focus];
  const color = focus === 'locked' ? theme.bracketLocked : theme.bracket;
  return {
    viewBox: LCD_VIEWBOX,
    gradients: [],
    nodes: [
      focusWindow(spec.x, spec.y, spec.width, spec.height, color, spec.stroke),
    ],
  };
}

function statusCluster(options: BuildableLcd): SceneNode[] {
  const {theme, mode} = options;
  const top = 8;
  const boxH = 30;
  const right = LCD_VIEWBOX.width - 8;
  const autoLabel = mode === 'review' ? 'PLAY' : 'AUTO';
  const autoW = Math.max(54, pixelTextWidth(autoLabel, 2) + 12);
  const autoX = right - autoW;
  const modeX = autoX - 4 - 32;
  const eyeX = modeX - 4 - 32;
  const flashW = 46;
  const flashX = eyeX - 4 - flashW;
  const nodes: SceneNode[] = [
    iconWell(flashX, top, flashW, boxH, theme.iconWell),
    flashIcon(
      options.flashMode,
      flashX + 5,
      top + 5,
      18,
      theme.icon,
      theme.redEye,
    ),
    iconWell(eyeX, top, 32, boxH, theme.iconWell),
    redEyeGlyph(
      eyeX,
      top,
      32,
      boxH,
      theme.icon,
      options.flashMode === 'red-eye' ? theme.redEye : theme.icon,
    ),
    iconWell(modeX, top, 32, boxH, theme.iconWell),
    mode === 'review'
      ? playGlyph(modeX + 4, top + 4, 24, theme.icon)
      : sceneModeGlyph(modeX + 5, top + 6, 22, theme.icon),
    iconWell(autoX, top, autoW, boxH, theme.iconWell),
    centeredPixelText(
      autoLabel,
      {x: autoX, y: top, width: autoW, height: boxH},
      2,
      theme.icon,
    ),
  ];
  return nodes;
}

export function buildLcdScene(options: BuildableLcd): Scene {
  const {theme, mode} = options;
  const shots = formatShots(options.shotsRemaining);
  const dateScale = 2;
  const shotScale = 5;
  const shotW = pixelTextWidth(shots, shotScale);
  const shotH = pixelTextHeight(shotScale);
  const shotBoxW = shotW + 16;
  const shotBoxH = shotH + 12;
  const shotBoxX = LCD_VIEWBOX.width - 8 - shotBoxW;
  const shotBoxY = LCD_VIEWBOX.height - 8 - shotBoxH;
  const qualityW = 96;
  const qualityH = 36;
  const qualityY = LCD_VIEWBOX.height - 8 - qualityH;
  const nodes: SceneNode[] = [
    iconWell(8, 8, 78, 30, theme.iconWell),
    batteryIcon(14, 13, 64, 18, options.batteryLevel, {
      fill: theme.battery,
      low: theme.batteryLow,
      outline: theme.icon,
    }),
    ...pixelTextBlock(
      options.dateText,
      8,
      44,
      dateScale,
      theme.text,
      theme.shadow,
    ),
    ...statusCluster(options),
    iconWell(8, qualityY, qualityW, qualityH, theme.iconWell),
    qualityGlyph(16, qualityY + 8, theme.icon),
    centeredPixelText(
      'L',
      {x: 52, y: qualityY, width: 40, height: qualityH},
      3,
      theme.icon,
    ),
    iconWell(shotBoxX, shotBoxY, shotBoxW, shotBoxH, theme.iconWell),
    ...pixelTextBlock(
      shots,
      shotBoxX + 8,
      shotBoxY + 6,
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
    const spec = FOCUS_WINDOW[options.focus];
    const color =
      options.focus === 'locked' ? theme.bracketLocked : theme.bracket;
    nodes.push(
      focusWindow(spec.x, spec.y, spec.width, spec.height, color, spec.stroke),
    );
  }

  return {viewBox: LCD_VIEWBOX, gradients: [], nodes};
}
