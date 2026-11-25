import {boltNode} from '../lcd/icons';
import {centeredPixelText} from '../lcd/pixelFont';
import {
  circle,
  ellipse,
  group,
  line,
  path,
  rect,
  type Scene,
  type SceneGradient,
  type SceneNode,
} from './sceneModel';
import {
  bezelRing,
  powerGlyph,
  punchedRoundRect,
  type RoundBox,
} from './shapes';
import type {SkinLayout} from './types';

/**
 * Landscape back of the LUMEN L-80, in the orientation you would hold the
 * camera to take a landscape photo. `rotation: 90` turns this clockwise onto
 * a portrait phone: hinge along the top, SET/MENU down the left edge,
 * viewfinder on the right, and the control deck along the bottom.
 *
 * Coordinates here are the unrotated design. `resolveSkinLayout` maps them.
 */
export const silverCompactMeta = {
  id: 'silver-compact',
  name: 'Silver Compact',
  description:
    'Brushed champagne compact. The landscape back is drawn turned 90° clockwise so it fills a portrait phone.',
  lcdTheme: 'classic' as const,
};

export const silverCompactLayout: SkinLayout = {
  viewBox: {width: 780, height: 360},
  rotation: 90,
  lcd: {x: 150, y: 68, width: 312, height: 234},
  controls: {
    shutter: {x: 474, y: 8, width: 108, height: 108},
    zoomOut: {x: 656, y: 14, width: 56, height: 46},
    zoomIn: {x: 716, y: 14, width: 56, height: 46},
    power: {x: 392, y: 12, width: 48, height: 48},
    set: {x: 164, y: 306, width: 78, height: 46},
    menu: {x: 252, y: 306, width: 96, height: 46},
    mode: {x: 586, y: 62, width: 64, height: 46},
    review: {x: 586, y: 10, width: 64, height: 46},
    flash: {x: 504, y: 172, width: 52, height: 56},
    func: {x: 676, y: 228, width: 58, height: 50},
    display: {x: 676, y: 292, width: 58, height: 50},
  },
};

export const silverCompactCutout: RoundBox = {
  ...silverCompactLayout.lcd,
  radius: 6,
};

const INK = '#2C2C2C';
const ENGRAVED = '#5C5852';
const BLUE = '#2F74B8';
const RED = '#D64545';

const shell: RoundBox = {x: 8, y: 6, width: 764, height: 348, radius: 28};
const face: RoundBox = {x: 16, y: 12, width: 748, height: 336, radius: 24};

const gradients: SceneGradient[] = [
  {
    id: 'body-edge',
    kind: 'linear',
    x1: 0,
    y1: 0,
    x2: 0,
    y2: 1,
    stops: [
      {offset: '0', color: '#FBF8F3'},
      {offset: '0.45', color: '#C9C3B6'},
      {offset: '1', color: '#8E8980'},
    ],
  },
  {
    id: 'body-face',
    kind: 'linear',
    x1: 0,
    y1: 0,
    x2: 0,
    y2: 1,
    stops: [
      {offset: '0', color: '#F4F0E8'},
      {offset: '0.22', color: '#E3DCD0'},
      {offset: '0.7', color: '#D4CDC0'},
      {offset: '1', color: '#C2BBB0'},
    ],
  },
  {
    id: 'panel-face',
    kind: 'linear',
    x1: 0,
    y1: 0,
    x2: 0,
    y2: 1,
    stops: [
      {offset: '0', color: '#F7F4EE'},
      {offset: '0.4', color: '#E7E1D6'},
      {offset: '1', color: '#C9C3B6'},
    ],
  },
  {
    id: 'hinge-metal',
    kind: 'linear',
    x1: 0,
    y1: 0,
    x2: 1,
    y2: 0,
    stops: [
      {offset: '0', color: '#B7B1A4'},
      {offset: '0.35', color: '#F4F0E8'},
      {offset: '0.7', color: '#C9C3B6'},
      {offset: '1', color: '#8A8478'},
    ],
  },
  {
    id: 'dial-face',
    kind: 'linear',
    x1: 0,
    y1: 0,
    x2: 1,
    y2: 0,
    stops: [
      {offset: '0', color: '#FBF8F3'},
      {offset: '0.45', color: '#D9D3C6'},
      {offset: '1', color: '#A39E92'},
    ],
  },
  {
    id: 'key-face',
    kind: 'radial',
    cx: 0.38,
    cy: 0.32,
    r: 0.75,
    stops: [
      {offset: '0', color: '#FBF8F3'},
      {offset: '0.55', color: '#E4DED2'},
      {offset: '1', color: '#B3ADA1'},
    ],
  },
  {
    id: 'shutter-cap',
    kind: 'radial',
    cx: 0.4,
    cy: 0.34,
    r: 0.72,
    stops: [
      {offset: '0', color: '#FFFCF7'},
      {offset: '0.5', color: '#E7E1D4'},
      {offset: '1', color: '#A8A296'},
    ],
  },
  {
    id: 'finder-glass',
    kind: 'radial',
    cx: 0.4,
    cy: 0.35,
    r: 0.72,
    stops: [
      {offset: '0', color: '#F4F8FC'},
      {offset: '0.28', color: '#9AADC0'},
      {offset: '0.7', color: '#3A4858'},
      {offset: '1', color: '#141A22'},
    ],
  },
  {
    id: 'pad-ring',
    kind: 'linear',
    x1: 0,
    y1: 0,
    x2: 1,
    y2: 1,
    stops: [
      {offset: '0', color: '#F7F4EE'},
      {offset: '0.45', color: '#D5CFC3'},
      {offset: '1', color: '#A9A396'},
    ],
  },
];

function brush(x: number, y: number, width: number, height: number): SceneNode[] {
  const nodes: SceneNode[] = [];
  const step = 4;
  for (let row = 0; row < height; row += step) {
    const light = Math.round(row / step) % 2 === 0;
    nodes.push(
      line(x, y + row, x + width, y + row, {
        stroke: light ? '#FFFFFF' : '#7A756C',
        strokeWidth: 0.6,
        opacity: light ? 0.14 : 0.06,
      }),
    );
  }
  return nodes;
}

function hinge(x: number, y: number, width: number, height: number): SceneNode {
  const barrels = 3;
  const gap = 8;
  const barrelH = (height - gap * (barrels - 1)) / barrels;
  const nodes: SceneNode[] = [];
  for (let index = 0; index < barrels; index += 1) {
    const by = y + index * (barrelH + gap);
    nodes.push(
      rect(x, by, width, barrelH, {
        rx: 4,
        fill: 'url(#hinge-metal)',
        stroke: '#6E6A62',
        strokeWidth: 0.8,
      }),
    );
  }
  return group(nodes);
}

function roundKey(cx: number, cy: number, r: number): SceneNode {
  return group([
    circle(cx, cy + 1.4, r, {fill: '#8A8478'}),
    circle(cx, cy, r, {
      fill: 'url(#key-face)',
      stroke: '#6E6A62',
      strokeWidth: 1.1,
    }),
    circle(cx, cy, r * 0.72, {fill: '#E6E0D4'}),
    ellipse(cx - r * 0.18, cy - r * 0.28, r * 0.34, r * 0.12, {
      fill: '#FFFFFF',
      opacity: 0.5,
    }),
  ]);
}

function pillKey(x: number, y: number, width: number, height: number): SceneNode {
  return group([
    rect(x, y + 1.6, width, height, {rx: height / 2, fill: '#8A8478'}),
    rect(x, y, width, height, {
      rx: height / 2,
      fill: 'url(#key-face)',
      stroke: '#6E6A62',
      strokeWidth: 1,
    }),
    rect(x + 5, y + 3, width - 10, height * 0.36, {
      rx: height / 3,
      fill: '#FFFFFF',
      opacity: 0.28,
    }),
  ]);
}

function shutterButton(cx: number, cy: number, r: number): SceneNode {
  return group([
    circle(cx, cy + 3, r, {fill: '#5C5954'}),
    circle(cx, cy, r * 0.98, {fill: 'url(#shutter-cap)'}),
    circle(cx, cy, r * 0.74, {
      fill: 'none',
      stroke: '#8E8980',
      strokeWidth: 2.4,
    }),
    circle(cx, cy, r * 0.58, {fill: '#E4DED2'}),
    ellipse(cx - r * 0.12, cy - r * 0.28, r * 0.3, r * 0.12, {
      fill: '#FFFFFF',
      opacity: 0.7,
    }),
  ]);
}

function viewfinder(cx: number, cy: number): SceneNode {
  return group([
    circle(cx, cy + 1.4, 28, {fill: '#8A8478'}),
    circle(cx, cy, 27, {
      fill: 'url(#key-face)',
      stroke: '#6E6A62',
      strokeWidth: 1,
    }),
    circle(cx, cy, 18, {fill: '#141A22'}),
    circle(cx, cy, 16, {fill: 'url(#finder-glass)'}),
    ellipse(cx - 5, cy - 6, 7, 3, {fill: '#FFFFFF', opacity: 0.75}),
  ]);
}

function led(cx: number, cy: number, core: string): SceneNode {
  return group([
    circle(cx, cy, 5.4, {fill: '#3A3A3A', stroke: '#6E6A62', strokeWidth: 0.7}),
    circle(cx, cy, 2.5, {fill: core}),
    circle(cx - 0.8, cy - 0.9, 0.7, {fill: '#FFFFFF', opacity: 0.8}),
  ]);
}

function knurledDial(x: number, y: number, width: number, height: number): SceneNode {
  const ridges: SceneNode[] = [];
  const count = 14;
  for (let index = 0; index < count; index += 1) {
    const rx = x + 8 + (index * (width - 16)) / (count - 1);
    ridges.push(
      line(rx, y + 6, rx, y + height - 6, {
        stroke: index % 2 === 0 ? '#FBF8F3' : '#7A756C',
        strokeWidth: 1.5,
        strokeLinecap: 'round',
      }),
    );
  }
  return group([
    rect(x, y + 2, width, height, {rx: height / 2, fill: '#8A8478'}),
    rect(x, y, width, height, {
      rx: height / 2,
      fill: 'url(#dial-face)',
      stroke: '#6E6A62',
      strokeWidth: 1.1,
    }),
    ...ridges,
  ]);
}

function cameraGlyph(x: number, y: number, color: string): SceneNode {
  return group([
    rect(x, y + 4, 18, 12, {rx: 2, fill: color}),
    rect(x + 4, y, 8, 5, {rx: 1, fill: color}),
    circle(x + 9, y + 10, 3.4, {fill: '#F4F1EA'}),
    circle(x + 9, y + 10, 1.6, {fill: color}),
  ]);
}

function playGlyph(cx: number, cy: number, color: string): SceneNode {
  return path(`M${cx - 4} ${cy - 6} L${cx - 4} ${cy + 6} L${cx + 7} ${cy} Z`, {
    fill: color,
  });
}

function tulip(cx: number, cy: number, color: string): SceneNode {
  const stroke = {
    fill: 'none' as const,
    stroke: color,
    strokeWidth: 1.4,
    strokeLinecap: 'round' as const,
  };
  return group([
    path(
      `M${cx - 6} ${cy} C${cx - 6} ${cy - 9}, ${cx - 2} ${cy - 9}, ${cx} ${cy - 4} C${cx + 2} ${cy - 9}, ${cx + 6} ${cy - 9}, ${cx + 6} ${cy}`,
      stroke,
    ),
    line(cx, cy - 4, cx, cy + 7, stroke),
  ]);
}

function printerGlyph(x: number, y: number, color: string): SceneNode {
  return group([
    rect(x + 4, y, 10, 5, {
      rx: 0.6,
      fill: '#F7F4EE',
      stroke: color,
      strokeWidth: 1,
    }),
    rect(x, y + 4, 18, 7, {rx: 1.4, fill: color}),
    path(`M${x + 14} ${y - 1} L${x + 18} ${y + 2} L${x + 14} ${y + 5}`, {
      fill: 'none',
      stroke: color,
      strokeWidth: 1.3,
      strokeLinecap: 'round',
    }),
  ]);
}

function holeGrid(
  x: number,
  y: number,
  cols: number,
  rows: number,
  gap: number,
): SceneNode {
  const nodes: SceneNode[] = [];
  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      nodes.push(circle(x + col * gap, y + row * gap, 1.7, {fill: '#4A4742'}));
    }
  }
  return group(nodes);
}

function dPad(cx: number, cy: number): SceneNode {
  return group([
    circle(cx, cy + 2, 60, {fill: '#8A8478'}),
    circle(cx, cy, 58, {
      fill: 'url(#pad-ring)',
      stroke: '#6E6A62',
      strokeWidth: 1.3,
    }),
    circle(cx, cy, 36, {fill: '#D5CFC3'}),
    circle(cx, cy, 22, {
      fill: 'url(#key-face)',
      stroke: '#8A8478',
      strokeWidth: 1,
    }),
    boltNode(cx - 52, cy - 8, 15, INK),
    tulip(cx + 36, cy - 2, INK),
    centeredPixelText('MF', {x: cx + 28, y: cy + 6, width: 22, height: 14}, 2, INK),
  ]);
}

function buildSilverCompactScene(): Scene {
  const {lcd, controls} = silverCompactLayout;
  const panel: RoundBox = {
    x: lcd.x - 16,
    y: lcd.y - 14,
    width: lcd.width + 30,
    height: lcd.height + 26,
    radius: 12,
  };
  const shutter = controls.shutter;
  const dialX = controls.zoomOut.x;
  const dialW =
    controls.zoomIn.x + controls.zoomIn.width - controls.zoomOut.x;
  const dialY = controls.zoomOut.y;
  const dialH = controls.zoomOut.height;
  const power = controls.power;

  return {
    viewBox: silverCompactLayout.viewBox,
    gradients,
    nodes: [
      ellipse(760, 180, 14, 150, {fill: '#000000', opacity: 0.1}),
      punchedRoundRect(shell, silverCompactCutout, {fill: 'url(#body-edge)'}),
      punchedRoundRect(face, silverCompactCutout, {fill: 'url(#body-face)'}),
      ...brush(24, 18, 200, 40),
      ...brush(470, 120, 280, 200),
      hinge(2, lcd.y + 6, 20, lcd.height - 8),
      punchedRoundRect(panel, silverCompactCutout, {
        fill: 'url(#panel-face)',
        stroke: '#8A8478',
        strokeWidth: 1,
      }),
      bezelRing(silverCompactCutout, 7, '#23272B'),
      bezelRing(silverCompactCutout, 3, '#5E656C'),
      bezelRing(silverCompactCutout, 1, '#C5CCD2'),
      viewfinder(300, 36),
      led(338, 26, '#3FAE67'),
      led(356, 42, '#E0A24A'),
      roundKey(
        power.x + power.width / 2,
        power.y + power.height / 2,
        power.width / 2 - 1,
      ),
      ...powerGlyph(
        power.x + power.width / 2,
        power.y + power.height / 2,
        7,
        INK,
      ),
      shutterButton(
        shutter.x + shutter.width / 2,
        shutter.y + shutter.height / 2,
        shutter.width / 2 - 4,
      ),
      knurledDial(dialX, dialY, dialW, dialH),
      centeredPixelText('W', {x: dialX + 4, y: dialY + 12, width: 22, height: 20}, 2, INK),
      centeredPixelText(
        'T',
        {x: dialX + dialW - 26, y: dialY + 12, width: 22, height: 20},
        2,
        INK,
      ),
      centeredPixelText('DC IN', {x: 78, y: 314, width: 70, height: 16}, 2, ENGRAVED),
      centeredPixelText('SET', {x: 118, y: 318, width: 42, height: 16}, 2, ENGRAVED),
      centeredPixelText('MENU', {x: 206, y: 318, width: 44, height: 16}, 2, ENGRAVED),
      pillKey(controls.set.x, controls.set.y, controls.set.width, controls.set.height),
      pillKey(
        controls.menu.x,
        controls.menu.y,
        controls.menu.width,
        controls.menu.height,
      ),
      rect(584, 8, 68, 102, {rx: 16, fill: '#2E2C29'}),
      rect(588, 12, 60, 46, {
        rx: 14,
        fill: 'url(#key-face)',
        stroke: '#6E6A62',
        strokeWidth: 0.8,
      }),
      cameraGlyph(604, 78, RED),
      playGlyph(618, 34, BLUE),
      dPad(588, 200),
      centeredPixelText('FUNC.', {x: 642, y: 240, width: 32, height: 28}, 2, BLUE),
      centeredPixelText('DISP.', {x: 642, y: 302, width: 32, height: 28}, 2, BLUE),
      roundKey(705, 253, 22),
      roundKey(705, 317, 22),
      printerGlyph(688, 176, BLUE),
      roundKey(730, 192, 16),
      holeGrid(704, 78, 4, 3, 8),
      centeredPixelText('LUMEN', {x: 36, y: 168, width: 70, height: 16}, 2, ENGRAVED),
      centeredPixelText('L-80', {x: 44, y: 186, width: 54, height: 14}, 2, '#8A8478'),
    ],
  };
}

export const silverCompactScene: Scene = buildSilverCompactScene();
