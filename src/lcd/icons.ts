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

export function focusBrackets(
  viewWidth: number,
  viewHeight: number,
  insetX: number,
  insetY: number,
  arm: number,
  thickness: number,
  color: string,
): SceneNode {
  const corners: [number, number, number, number, number, number][] = [
    [insetX, insetY, arm, thickness, insetX, insetY],
    [
      viewWidth - insetX - arm,
      insetY,
      arm,
      thickness,
      viewWidth - insetX - thickness,
      insetY,
    ],
    [
      insetX,
      viewHeight - insetY - thickness,
      arm,
      thickness,
      insetX,
      viewHeight - insetY - arm,
    ],
    [
      viewWidth - insetX - arm,
      viewHeight - insetY - thickness,
      arm,
      thickness,
      viewWidth - insetX - thickness,
      viewHeight - insetY - arm,
    ],
  ];
  return group(
    corners.flatMap(([hx, hy, hw, hh, vx, vy]) => [
      rect(hx, hy, hw, hh, {fill: color}),
      rect(vx, vy, thickness, arm, {fill: color}),
    ]),
  );
}
