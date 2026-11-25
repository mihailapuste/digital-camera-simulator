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

const SHOT_SCALE = 2.65;

export function lcdHeight(square = false) {
  return square ? LCD_VIEWBOX.width : LCD_VIEWBOX.height;
}

export function shotCounterLayout(shots: string, square = false) {
  const width = pixelTextWidth(shots, SHOT_SCALE) + 9;
  const height = pixelTextHeight(SHOT_SCALE) + 6;
  return {
    x: LCD_VIEWBOX.width - 7 - width,
    y: lcdHeight(square) - 6 - height,
    width,
    height,
  };
}

const FOCUS_WINDOW = {
  idle: {x: 170, y: 117, width: 84, height: 61, stroke: 1.35},
  searching: {x: 170, y: 117, width: 84, height: 61, stroke: 1.35},
  locked: {x: 176, y: 123, width: 72, height: 49, stroke: 1.8},
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
  square = false,
): Scene {
  const spec = FOCUS_WINDOW[focus];
  const color = focus === 'locked' ? theme.bracketLocked : theme.bracket;
  return {
    viewBox: {...LCD_VIEWBOX, height: lcdHeight(square)},
    gradients: [],
    nodes: [
      focusWindow(spec.x, spec.y + (lcdHeight(square) - LCD_VIEWBOX.height) / 2, spec.width, spec.height, color, spec.stroke),
    ],
  };
}

function statusCluster(options: BuildableLcd): SceneNode[] {
  const {theme, mode} = options;
  const top = 7;
  const boxH = 19;
  const right = LCD_VIEWBOX.width - 7;
  const autoLabel = mode === 'review' ? 'PLAY' : 'AUTO';
  const autoW = 42;
  const autoX = right - autoW;
  const modeX = autoX - 6 - 26;
  const eyeX = modeX - 6 - 22;
  const flashW = 25;
  const flashX = eyeX - 8 - flashW;
  const nodes: SceneNode[] = [
    iconWell(flashX, top, flashW, boxH, theme.iconWell),
    flashIcon(
      options.flashMode,
      flashX + 4,
      top + 2,
      15,
      theme.icon,
      theme.redEye,
    ),
    iconWell(eyeX, top, 22, boxH, theme.iconWell),
    redEyeGlyph(
      eyeX,
      top,
      22,
      boxH,
      theme.icon,
      options.flashMode === 'red-eye' ? theme.redEye : theme.icon,
    ),
    iconWell(modeX, top, 26, boxH, theme.iconWell),
    mode === 'review'
      ? playGlyph(modeX + 4, top + 3, 18, theme.icon)
      : sceneModeGlyph(modeX + 5, top + 3, 16, theme.icon),
    iconWell(autoX, top, autoW, boxH, theme.iconWell),
    centeredPixelText(
      autoLabel,
      {x: autoX, y: top, width: autoW, height: boxH},
      1.55,
      theme.icon,
    ),
  ];
  return nodes;
}

export function buildLcdScene(options: BuildableLcd): Scene {
  const {theme, mode, square} = options;
  const height = lcdHeight(square);
  const shots = formatShots(options.shotsRemaining);
  const dateScale = 1.55;
  const counter = shotCounterLayout(shots, square);
  const qualityW = 66;
  const qualityH = 22;
  const qualityY = height - 6 - qualityH;
  const nodes: SceneNode[] = [
    iconWell(10, 7, 54, 21, theme.iconWell),
    batteryIcon(15, 11, 45, 13, options.batteryLevel, {
      fill: theme.battery,
      low: theme.batteryLow,
      outline: theme.icon,
    }),
    ...pixelTextBlock(
      options.dateText,
      85,
      10,
      dateScale,
      theme.text,
      theme.shadow,
    ),
    ...statusCluster(options),
    iconWell(10, qualityY, qualityW, qualityH, theme.iconWell),
    qualityGlyph(16, qualityY + 3, theme.icon),
    centeredPixelText(
      'L',
      {x: 44, y: qualityY, width: 25, height: qualityH},
      1.8,
      theme.icon,
    ),
  ];

  if (mode === 'review') {
    const label = 'REVIEW';
    const scale = 4;
    const width = label.length * 6 * scale - scale;
    nodes.unshift(
      rect(0, 0, LCD_VIEWBOX.width, height, {
        fill: theme.reviewScrim,
      }),
    );
    nodes.push(
      rect(10, 10, LCD_VIEWBOX.width - 20, height - 20, {
        fill: 'none',
        stroke: theme.reviewFrame,
        strokeWidth: 3,
      }),
      group(
        pixelTextBlock(
          label,
          (LCD_VIEWBOX.width - width) / 2,
          (height - pixelTextHeight(scale)) / 2,
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
      focusWindow(spec.x, spec.y + (height - LCD_VIEWBOX.height) / 2, spec.width, spec.height, color, spec.stroke),
    );
  }

  nodes.push(
    iconWell(
      counter.x,
      counter.y,
      counter.width,
      counter.height,
      theme.iconWell,
    ),
    ...pixelTextBlock(
      shots,
      counter.x + 4.5,
      counter.y + 3,
      SHOT_SCALE,
      theme.text,
      theme.shadow,
    ),
  );

  return {viewBox: {...LCD_VIEWBOX, height}, gradients: [], nodes};
}
