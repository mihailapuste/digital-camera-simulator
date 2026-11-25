import {centeredPixelText} from '../lcd/pixelFont';
import {
  circle,
  ellipse,
  fmt,
  group,
  line,
  path,
  rect,
  type Paint,
  type SceneNode,
} from './sceneModel';

export type RoundBox = {
  x: number;
  y: number;
  width: number;
  height: number;
  radius: number;
};

export function roundedRectPath(box: RoundBox): string {
  const {x, y, width, height} = box;
  const r = Math.min(Math.max(box.radius, 0), width / 2, height / 2);
  const f = fmt;
  return [
    `M${f(x + r)} ${f(y)}`,
    `H${f(x + width - r)}`,
    `A${f(r)} ${f(r)} 0 0 1 ${f(x + width)} ${f(y + r)}`,
    `V${f(y + height - r)}`,
    `A${f(r)} ${f(r)} 0 0 1 ${f(x + width - r)} ${f(y + height)}`,
    `H${f(x + r)}`,
    `A${f(r)} ${f(r)} 0 0 1 ${f(x)} ${f(y + height - r)}`,
    `V${f(y + r)}`,
    `A${f(r)} ${f(r)} 0 0 1 ${f(x + r)} ${f(y)}`,
    'Z',
  ].join(' ');
}

export function punchedRoundRect(
  outer: RoundBox,
  hole: RoundBox,
  paint: Paint,
): SceneNode {
  return path(`${roundedRectPath(outer)} ${roundedRectPath(hole)}`, {
    ...paint,
    fillRule: 'evenodd',
  });
}

export function bezelRing(
  opening: RoundBox,
  thickness: number,
  color: string,
): SceneNode {
  return punchedRoundRect(
    {
      x: opening.x - thickness,
      y: opening.y - thickness,
      width: opening.width + thickness * 2,
      height: opening.height + thickness * 2,
      radius: opening.radius + thickness,
    },
    opening,
    {fill: color},
  );
}

export function screw(cx: number, cy: number, r = 4.6): SceneNode {
  return group([
    circle(cx, cy, r, {fill: '#6F6B63', stroke: '#2E2C29', strokeWidth: 0.6}),
    circle(cx, cy, r * 0.62, {fill: '#8E8980'}),
    rect(cx - 0.45, cy - r * 0.36, 0.9, r * 0.72, {fill: '#322F2C'}),
    rect(cx - r * 0.36, cy - 0.45, r * 0.72, 0.9, {fill: '#322F2C'}),
  ]);
}

export function speakerHoles(
  x: number,
  y: number,
  count: number,
  gap: number,
  r: number,
  color: string,
): SceneNode {
  return group(
    Array.from({length: count}, (_item, index) =>
      circle(x + index * gap, y, r, {fill: color}),
    ),
  );
}

export function powerGlyph(
  cx: number,
  cy: number,
  r: number,
  color: string,
): SceneNode[] {
  const sw = Math.max(1.5, r * 0.22);
  const spread = Math.sin(0.75) * r;
  const rise = Math.cos(0.75) * r;
  return [
    path(`M${fmt(cx)} ${fmt(cy - r)} L${fmt(cx)} ${fmt(cy - r * 0.12)}`, {
      fill: 'none',
      stroke: color,
      strokeWidth: sw,
      strokeLinecap: 'round',
    }),
    path(
      `M${fmt(cx + spread)} ${fmt(cy - rise)} A${fmt(r)} ${fmt(r)} 0 1 1 ${fmt(cx - spread)} ${fmt(cy - rise)}`,
      {
        fill: 'none',
        stroke: color,
        strokeWidth: sw,
        strokeLinecap: 'round',
      },
    ),
  ];
}

export function roundShutter(
  cx: number,
  cy: number,
  r: number,
  colors: {well: string; ring: string; cap: string},
): SceneNode {
  return group([
    circle(cx, cy, r, {fill: colors.well}),
    circle(cx, cy, r * 0.9, {fill: '#141414'}),
    circle(cx, cy, r * 0.84, {fill: colors.ring}),
    circle(cx, cy, r * 0.7, {fill: colors.cap}),
    ellipse(cx - r * 0.18, cy - r * 0.32, r * 0.34, r * 0.15, {
      fill: '#FFFFFF',
      opacity: 0.55,
    }),
  ]);
}

export function labeledKey(options: {
  x: number;
  y: number;
  width: number;
  height: number;
  radius: number;
  label?: string;
  labelScale?: number;
  face: string;
  edge: string;
  ink: string;
}): SceneNode {
  const {x, y, width, height, radius, face, edge, ink} = options;
  const nodes: SceneNode[] = [
    rect(x, y, width, height, {rx: radius, fill: edge}),
    rect(x + 2.5, y + 2.5, width - 5, height - 5, {
      rx: Math.max(0, radius - 2),
      fill: face,
    }),
    rect(x + 7, y + 4, width - 14, Math.max(3, height * 0.22), {
      rx: 3,
      fill: '#FFFFFF',
      opacity: 0.28,
    }),
  ];
  if (options.label) {
    nodes.push(
      centeredPixelText(
        options.label,
        {x, y, width, height},
        options.labelScale ?? 2,
        ink,
      ),
    );
  }
  return group(nodes);
}

export function playTriangle(
  x: number,
  y: number,
  width: number,
  height: number,
  color: string,
): SceneNode {
  const size = Math.min(width, height) * 0.22;
  const cx = x + width * 0.54;
  const cy = y + height * 0.5;
  return path(
    `M${fmt(cx - size * 0.7)} ${fmt(cy - size)} L${fmt(cx - size * 0.7)} ${fmt(cy + size)} L${fmt(cx + size)} ${fmt(cy)} Z`,
    {fill: color},
  );
}

export function zoomRocker(options: {
  x: number;
  y: number;
  width: number;
  height: number;
  horizontal: boolean;
  face: string;
  edge: string;
  ink: string;
}): SceneNode {
  const {x, y, width, height, horizontal, face, edge, ink} = options;
  const radius = horizontal ? height / 2 : width / 2;
  const split = horizontal
    ? line(x + width / 2, y + 8, x + width / 2, y + height - 8, {
        stroke: edge,
        strokeWidth: 1.5,
      })
    : line(x + 8, y + height / 2, x + width - 8, y + height / 2, {
        stroke: edge,
        strokeWidth: 1.5,
      });
  const wide = horizontal
    ? {x, y, width: width / 2, height}
    : {x, y, width, height: height / 2};
  const tele = horizontal
    ? {x: x + width / 2, y, width: width / 2, height}
    : {x, y: y + height / 2, width, height: height / 2};
  return group([
    labeledKey({
      x,
      y,
      width,
      height,
      radius,
      face,
      edge,
      ink,
    }),
    split,
    centeredPixelText('W', wide, 3, ink),
    centeredPixelText('T', tele, 3, ink),
  ]);
}

export function modeDial(
  cx: number,
  cy: number,
  r: number,
  face: string,
  tick: string,
): SceneNode {
  const ticks: SceneNode[] = [];
  for (let index = 0; index < 8; index += 1) {
    const angle = (index / 8) * Math.PI * 2 - Math.PI / 2;
    ticks.push(
      line(
        cx + Math.cos(angle) * (r - 1),
        cy + Math.sin(angle) * (r - 1),
        cx + Math.cos(angle) * (r + 4),
        cy + Math.sin(angle) * (r + 4),
        {stroke: tick, strokeWidth: 1.6, strokeLinecap: 'round'},
      ),
    );
  }
  return group([
    ...ticks,
    circle(cx, cy, r, {fill: '#1A1C20', stroke: tick, strokeWidth: 1.4}),
    circle(cx, cy, r * 0.78, {fill: face}),
    circle(cx, cy - r * 0.48, 3.1, {fill: '#F4F4F5'}),
    circle(cx, cy, r * 0.12, {fill: '#F4F4F5'}),
  ]);
}

export function flashWindow(
  x: number,
  y: number,
  width: number,
  height: number,
): SceneNode {
  return group([
    rect(x, y, width, height, {
      rx: 8,
      fill: '#E7EEF2',
      stroke: '#8E989E',
      strokeWidth: 1.4,
    }),
    rect(x + 5, y + 4, width - 10, height * 0.38, {
      rx: 4,
      fill: '#FFFFFF',
      opacity: 0.6,
    }),
    ellipse(x + width * 0.5, y + height * 0.58, width * 0.18, height * 0.22, {
      fill: '#FFF4CC',
    }),
    ellipse(x + width * 0.5, y + height * 0.58, width * 0.08, height * 0.1, {
      fill: '#FFE08A',
    }),
  ]);
}

export function flashDome(cx: number, cy: number, r: number): SceneNode {
  return group([
    circle(cx, cy, r, {fill: '#D7E4F2', stroke: '#F7FBFF', strokeWidth: 3}),
    circle(cx, cy, r * 0.72, {fill: '#F4F8FC', opacity: 0.85}),
    circle(cx, cy, r * 0.28, {fill: '#FFF1C2'}),
    ellipse(cx - r * 0.22, cy - r * 0.28, r * 0.28, r * 0.16, {
      fill: '#FFFFFF',
      opacity: 0.8,
    }),
  ]);
}

export function circleRing(
  cx: number,
  cy: number,
  outer: number,
  inner: number,
  fill: string,
): SceneNode {
  return path(
    `M${fmt(cx + outer)} ${fmt(cy)} A${fmt(outer)} ${fmt(outer)} 0 1 0 ${fmt(cx - outer)} ${fmt(cy)} A${fmt(outer)} ${fmt(outer)} 0 1 0 ${fmt(cx + outer)} ${fmt(cy)} Z M${fmt(cx + inner)} ${fmt(cy)} A${fmt(inner)} ${fmt(inner)} 0 1 1 ${fmt(cx - inner)} ${fmt(cy)} A${fmt(inner)} ${fmt(inner)} 0 1 1 ${fmt(cx + inner)} ${fmt(cy)} Z`,
    {fill, fillRule: 'evenodd'},
  );
}

export function gripGrooves(
  x: number,
  y: number,
  width: number,
  count: number,
  gap: number,
  color: string,
): SceneNode {
  return group(
    Array.from({length: count}, (_item, index) =>
      line(x, y + index * gap, x + width, y + index * gap, {
        stroke: color,
        strokeWidth: 1.4,
        strokeLinecap: 'round',
      }),
    ),
  );
}
