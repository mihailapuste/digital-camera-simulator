import {pixelTextNodes} from './pixelFont';
import type {FlashMode} from './types';
import {
  circle,
  ellipse,
  fmt,
  group,
  line,
  path,
  rect,
  type SceneNode,
} from '../skins/sceneModel';

export function boltNode(
  x: number,
  y: number,
  size: number,
  color: string,
): SceneNode {
  const s = size / 16;
  const p = (px: number, py: number) => `${fmt(x + px * s)} ${fmt(y + py * s)}`;
  return path(
    `M${p(9, 0)} L${p(3, 9)} L${p(7.4, 9)} L${p(5, 16)} L${p(14, 6)} L${p(9.2, 6)} Z`,
    {fill: color},
  );
}

export function flashIcon(
  mode: FlashMode,
  x: number,
  y: number,
  size: number,
  color: string,
  redEye: string,
): SceneNode {
  if (mode === 'red-eye') {
    return group([
      ellipse(x + size * 0.42, y + size * 0.48, size * 0.4, size * 0.26, {
        fill: 'none',
        stroke: color,
        strokeWidth: Math.max(1.4, size * 0.08),
      }),
      circle(x + size * 0.42, y + size * 0.48, size * 0.1, {fill: redEye}),
      boltNode(x + size * 0.62, y + size * 0.34, size * 0.48, color),
    ]);
  }

  const bolt = boltNode(x, y, size, color);
  if (mode === 'on') {
    return group([bolt]);
  }
  if (mode === 'off') {
    return group([
      bolt,
      line(x + size * 0.05, y + size * 0.95, x + size * 0.95, y + size * 0.05, {
        stroke: color,
        strokeWidth: Math.max(1.6, size * 0.1),
        strokeLinecap: 'round',
        fill: 'none',
      }),
    ]);
  }
  return group([
    bolt,
    ...pixelTextNodes('A', x + size * 0.78, y + size * 0.28, size / 8, color),
  ]);
}

export function batteryIcon(
  x: number,
  y: number,
  width: number,
  height: number,
  level: number,
  colors: {fill: string; low: string; outline: string},
): SceneNode {
  const nub = Math.max(2, width * 0.08);
  const bodyWidth = width - nub;
  const strokeWidth = Math.max(1.25, height * 0.08);
  const pad = strokeWidth + 1.4;
  const clamped = Math.max(0, Math.min(1, level));
  const active =
    clamped <= 0 ? 0 : Math.min(4, Math.max(1, Math.round(clamped * 4)));
  const color = clamped <= 0.2 ? colors.low : colors.fill;
  const innerWidth = bodyWidth - pad * 2;
  const innerHeight = height - pad * 2;
  const gap = Math.max(1, innerWidth * 0.07);
  const barWidth = (innerWidth - gap * 3) / 4;
  const bars: SceneNode[] = [];
  for (let index = 0; index < active; index += 1) {
    bars.push(
      rect(x + pad + index * (barWidth + gap), y + pad, barWidth, innerHeight, {
        fill: color,
      }),
    );
  }
  return group([
    rect(x, y, bodyWidth, height, {
      rx: 2,
      fill: 'none',
      stroke: colors.outline,
      strokeWidth,
    }),
    rect(x + bodyWidth, y + height * 0.28, nub, height * 0.44, {
      rx: 1,
      fill: colors.outline,
    }),
    ...bars,
  ]);
}

export function iconWell(
  x: number,
  y: number,
  width: number,
  height: number,
  fill: string,
): SceneNode {
  return rect(x, y, width, height, {rx: 4, ry: 4, fill});
}

/** Red-eye mark: an eye, with the pupil recolored when reduction is active. */
export function redEyeGlyph(
  x: number,
  y: number,
  width: number,
  height: number,
  color: string,
  pupil: string,
): SceneNode {
  const cx = x + width / 2;
  const cy = y + height / 2;
  const radius = Math.min(width, height) * 0.32;
  return group([
    circle(cx, cy, radius, {
      fill: 'none',
      stroke: color,
      strokeWidth: 1.7,
    }),
    circle(cx, cy, radius * 0.3, {fill: pupil}),
  ]);
}

/** Scene-mode mark: a frame with a peak inside, the third status glyph. */
export function sceneModeGlyph(
  x: number,
  y: number,
  size: number,
  color: string,
): SceneNode {
  const h = size * 0.78;
  return group([
    rect(x, y, size, h, {
      fill: 'none',
      stroke: color,
      strokeWidth: 1.6,
      rx: 1.5,
    }),
    path(
      `M${fmt(x + 1.8)} ${fmt(y + h * 0.72)} L${fmt(x + size * 0.36)} ${fmt(y + h * 0.34)} L${fmt(x + size * 0.52)} ${fmt(y + h * 0.52)} L${fmt(x + size * 0.74)} ${fmt(y + h * 0.26)} L${fmt(x + size - 1.8)} ${fmt(y + h * 0.72)} Z`,
      {fill: color},
    ),
  ]);
}

/** Large-quality mark: two stacked frames, the period "L" sits beside it. */
export function qualityGlyph(x: number, y: number, color: string): SceneNode {
  return group([
    rect(x + 5, y, 15, 12, {
      fill: 'none',
      stroke: color,
      strokeWidth: 1.4,
      rx: 1,
    }),
    rect(x, y + 5, 15, 12, {
      fill: 'none',
      stroke: color,
      strokeWidth: 1.5,
      rx: 1,
    }),
    path(
      `M${fmt(x + 2)} ${fmt(y + 14)} L${fmt(x + 6)} ${fmt(y + 9)} L${fmt(x + 9)} ${fmt(y + 12)} L${fmt(x + 13)} ${fmt(y + 8)}`,
      {
        fill: 'none',
        stroke: color,
        strokeWidth: 1.2,
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
      },
    ),
  ]);
}

export function focusWindow(
  x: number,
  y: number,
  width: number,
  height: number,
  color: string,
  strokeWidth: number,
): SceneNode {
  const right = x + width;
  const bottom = y + height;
  const arm = 11;
  return path(
    [
      `M${x} ${y + arm} V${y} H${x + arm}`,
      `M${right - arm} ${y} H${right} V${y + arm}`,
      `M${right} ${bottom - arm} V${bottom} H${right - arm}`,
      `M${x + arm} ${bottom} H${x} V${bottom - arm}`,
    ].join(' '),
    {fill: 'none', stroke: color, strokeWidth},
  );
}
