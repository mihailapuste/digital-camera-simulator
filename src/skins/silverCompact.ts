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
  circleRing,
  powerGlyph,
  punchedRoundRect,
  type RoundBox,
} from './shapes';
import type {SkinLayout} from './types';

/**
 * Portrait adaptation of the champagne compact's back.
 *
 * The phone is portrait-locked. Rotating the whole back 90° would swing the
 * flip-out hinge across the top of the screen and park the viewfinder on the
 * side, so the camera stops reading as this object. This layout keeps the
 * hinge on the left of a large 4:3 panel and stacks the photo's right-hand
 * control deck underneath it. The top plate (dial, viewfinder, shutter) stays
 * the top of the camera.
 *
 * Hit targets, in the existing layout descriptor:
 * - shutter: top-edge button (the reference only shows the back)
 * - zoomOut / zoomIn: the two halves of the top dial
 * - power: top plate, beside the dial
 * - mode / review: camera and gallery halves of the slide switch
 * - flash: lightning key on the pad
 * - set / menu: pills under the LCD (confirm, settings)
 * - func / display: FUNC. (looks) and DISP. (overlay)
 */
export const silverCompactMeta = {
  id: 'silver-compact',
  name: 'Silver Compact',
  description:
    'Brushed champagne compact with a left-hinged LCD and the control deck below.',
  lcdTheme: 'classic' as const,
};

export const silverCompactLayout: SkinLayout = {
  viewBox: {width: 360, height: 780},
  lcd: {x: 22, y: 118, width: 320, height: 240},
  controls: {
    zoomOut: {x: 12, y: 16, width: 52, height: 50},
    zoomIn: {x: 64, y: 16, width: 52, height: 50},
    power: {x: 126, y: 18, width: 46, height: 46},
    shutter: {x: 252, y: 2, width: 102, height: 102},
    set: {x: 116, y: 390, width: 66, height: 46},
    menu: {x: 194, y: 390, width: 80, height: 46},
    mode: {x: 16, y: 452, width: 92, height: 48},
    review: {x: 108, y: 452, width: 92, height: 48},
    flash: {x: 148, y: 508, width: 64, height: 46},
    func: {x: 20, y: 688, width: 74, height: 48},
    display: {x: 112, y: 688, width: 74, height: 48},
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

const shell: RoundBox = {x: 6, y: 24, width: 348, height: 740, radius: 30};
const face: RoundBox = {x: 12, y: 30, width: 336, height: 726, radius: 26};

const gradients: SceneGradient[] = [
  {
    id: 'body-edge',
    kind: 'linear',
    x1: 0,
    y1: 0,
    x2: 1,
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
      {offset: '0.18', color: '#E3DCD0'},
      {offset: '0.55', color: '#D4CDC0'},
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
    x2: 0,
    y2: 1,
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
      {offset: '0', color: '#FFFcf7'},
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
    x2: 0,
    y2: 1,
    stops: [
      {offset: '0', color: '#F7F4EE'},
      {offset: '0.45', color: '#D5CFC3'},
      {offset: '1', color: '#A9A396'},
    ],
  },
];

function brush(
  x: number,
  y: number,
  width: number,
  height: number,
): SceneNode[] {
  const nodes: SceneNode[] = [];
  const step = 3;
  for (let row = 0; row < height; row += step) {
    const light = Math.round(row / step) % 2 === 0;
    nodes.push(
      line(x, y + row, x + width, y + row, {
        stroke: light ? '#FFFFFF' : '#7A756C',
        strokeWidth: 0.6,
        opacity: light ? 0.16 : 0.07,
      }),
    );
  }
  return nodes;
}

function hinge(x: number, y: number, width: number, height: number): SceneNode {
  const barrels = 3;
  const gap = 7;
  const barrelH = (height - gap * (barrels - 1)) / barrels;
  const nodes: SceneNode[] = [];
  for (let index = 0; index < barrels; index += 1) {
    const by = y + index * (barrelH + gap);
    nodes.push(
      rect(x, by, width, barrelH, {
        rx: 3,
        fill: 'url(#hinge-metal)',
        stroke: '#6E6A62',
        strokeWidth: 0.7,
      }),
      rect(x + width * 0.38, by + 5, width * 0.18, barrelH - 10, {
        rx: 2,
        fill: '#FFFFFF',
        opacity: 0.45,
      }),
    );
  }
  nodes.push(
    circle(x + width / 2, y - 1, 3.1, {
      fill: '#8A8478',
      stroke: '#4A4742',
      strokeWidth: 0.6,
    }),
    circle(x + width / 2, y + height + 1, 3.1, {
      fill: '#8A8478',
      stroke: '#4A4742',
      strokeWidth: 0.6,
    }),
  );
  return group(nodes);
}

function knurledDial(
  x: number,
  y: number,
  width: number,
  height: number,
): SceneNode {
  const ridges: SceneNode[] = [];
  const count = 12;
  const inset = 22;
  for (let index = 0; index < count; index += 1) {
    const rx = x + inset + (index * (width - inset * 2)) / (count - 1);
    ridges.push(
      line(rx, y + 7, rx, y + height - 7, {
        stroke: index % 2 === 0 ? '#FBF8F3' : '#7A756C',
        strokeWidth: 1.6,
        strokeLinecap: 'round',
      }),
    );
  }
  return group([
    rect(x, y + 2, width, height, {
      rx: height / 2,
      fill: '#8A8478',
    }),
    rect(x, y, width, height, {
      rx: height / 2,
      fill: 'url(#dial-face)',
      stroke: '#6E6A62',
      strokeWidth: 1.2,
    }),
    ...ridges,
  ]);
}

function roundKey(cx: number, cy: number, r: number): SceneNode {
  return group([
    circle(cx, cy + 1.6, r, {fill: '#8A8478'}),
    circle(cx, cy, r, {
      fill: 'url(#key-face)',
      stroke: '#6E6A62',
      strokeWidth: 1.1,
    }),
    circle(cx, cy, r * 0.72, {fill: '#E6E0D4'}),
    ellipse(cx - r * 0.18, cy - r * 0.32, r * 0.36, r * 0.14, {
      fill: '#FFFFFF',
      opacity: 0.55,
    }),
  ]);
}

function pillKey(
  x: number,
  y: number,
  width: number,
  height: number,
): SceneNode {
  return group([
    rect(x, y + 1.5, width, height, {rx: height / 2, fill: '#8A8478'}),
    rect(x, y, width, height, {
      rx: height / 2,
      fill: 'url(#key-face)',
      stroke: '#6E6A62',
      strokeWidth: 1,
    }),
    rect(x + 4, y + 3, width - 8, height * 0.38, {
      rx: height / 3,
      fill: '#FFFFFF',
      opacity: 0.28,
    }),
  ]);
}

function shutterButton(cx: number, cy: number, r: number): SceneNode {
  return group([
    ellipse(cx, cy + r * 0.78, r * 1.02, r * 0.22, {
      fill: '#000000',
      opacity: 0.16,
    }),
    circle(cx, cy + 3, r, {fill: '#5C5954'}),
    circle(cx, cy, r * 0.98, {fill: 'url(#shutter-cap)'}),
    circle(cx, cy, r * 0.98, {
      fill: 'none',
      stroke: '#FFFFFF',
      strokeWidth: 1.4,
      opacity: 0.65,
    }),
    circle(cx, cy, r * 0.74, {
      fill: 'none',
      stroke: '#8E8980',
      strokeWidth: 2.2,
    }),
    circle(cx, cy, r * 0.6, {fill: '#E4DED2'}),
    ellipse(cx - r * 0.12, cy - r * 0.28, r * 0.32, r * 0.12, {
      fill: '#FFFFFF',
      opacity: 0.7,
    }),
    circle(cx, cy + r * 0.06, r * 0.1, {
      fill: '#C9C3B6',
      stroke: '#8A8478',
      strokeWidth: 0.8,
    }),
  ]);
}

function viewfinder(cx: number, cy: number): SceneNode {
  return group([
    circle(cx, cy + 1.5, 27, {fill: '#8A8478'}),
    circle(cx, cy, 26, {
      fill: 'url(#key-face)',
      stroke: '#6E6A62',
      strokeWidth: 1,
    }),
    circle(cx, cy, 18, {fill: '#141A22'}),
    circle(cx, cy, 16, {fill: 'url(#finder-glass)'}),
    ellipse(cx - 5, cy - 6, 7, 3.2, {fill: '#FFFFFF', opacity: 0.75}),
  ]);
}

function led(cx: number, cy: number, core: string): SceneNode {
  return group([
    circle(cx, cy, 5.2, {fill: '#3A3A3A', stroke: '#6E6A62', strokeWidth: 0.8}),
    circle(cx, cy, 2.4, {fill: core}),
    circle(cx - 1, cy - 1.1, 0.8, {fill: '#FFFFFF', opacity: 0.7}),
  ]);
}

function cameraGlyph(x: number, y: number, color: string): SceneNode {
  return group([
    rect(x, y + 4, 22, 14, {rx: 2, fill: color}),
    rect(x + 5, y, 9, 5, {rx: 1, fill: color}),
    circle(x + 11, y + 11, 4.2, {fill: '#F4F1EA'}),
    circle(x + 11, y + 11, 2.1, {fill: color}),
  ]);
}

function playGlyph(cx: number, cy: number, color: string): SceneNode {
  return path(`M${cx - 5} ${cy - 7} L${cx - 5} ${cy + 7} L${cx + 8} ${cy} Z`, {
    fill: color,
  });
}

function tulip(cx: number, cy: number, color: string): SceneNode {
  const stroke = {
    fill: 'none' as const,
    stroke: color,
    strokeWidth: 1.5,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };
  return group([
    path(
      `M${cx - 7} ${cy} C${cx - 7} ${cy - 11}, ${cx - 2.5} ${cy - 11}, ${cx} ${cy - 5} C${cx + 2.5} ${cy - 11}, ${cx + 7} ${cy - 11}, ${cx + 7} ${cy}`,
      stroke,
    ),
    line(cx, cy - 5, cx, cy + 8, stroke),
    path(`M${cx} ${cy + 2} Q${cx - 8} ${cy}, ${cx - 6} ${cy + 6}`, stroke),
    path(`M${cx} ${cy + 3} Q${cx + 8} ${cy + 1}, ${cx + 6} ${cy + 7}`, stroke),
  ]);
}

function printerGlyph(x: number, y: number, color: string): SceneNode {
  return group([
    rect(x + 5, y + 1, 10, 6, {
      rx: 0.6,
      fill: '#F7F4EE',
      stroke: color,
      strokeWidth: 1.1,
    }),
    rect(x, y + 6, 20, 8, {rx: 1.6, fill: color}),
    rect(x + 4, y + 12, 12, 5, {fill: 'none', stroke: color, strokeWidth: 1.3}),
    path(`M${x + 18} ${y + 2} L${x + 24} ${y + 2} L${x + 24} ${y + 8}`, {
      fill: 'none',
      stroke: color,
      strokeWidth: 1.5,
      strokeLinecap: 'round',
      strokeLinejoin: 'round',
    }),
    path(`M${x + 21} ${y - 1} L${x + 24} ${y + 2} L${x + 21} ${y + 5}`, {
      fill: 'none',
      stroke: color,
      strokeWidth: 1.5,
      strokeLinecap: 'round',
      strokeLinejoin: 'round',
    }),
  ]);
}

function holeGrid(
  x: number,
  y: number,
  cols: number,
  rows: number,
  gap: number,
  r: number,
  color: string,
): SceneNode {
  const nodes: SceneNode[] = [];
  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      nodes.push(circle(x + col * gap, y + row * gap, r, {fill: color}));
    }
  }
  return group(nodes);
}

function dPad(cx: number, cy: number): SceneNode {
  return group([
    circle(cx, cy + 2, 72, {fill: '#8A8478'}),
    circle(cx, cy, 70, {
      fill: 'url(#pad-ring)',
      stroke: '#6E6A62',
      strokeWidth: 1.4,
    }),
    circle(cx, cy, 46, {fill: '#D5CFC3'}),
    circle(cx, cy, 28, {
      fill: 'url(#key-face)',
      stroke: '#8A8478',
      strokeWidth: 1.2,
    }),
    circle(cx, cy, 20, {fill: '#E6E0D4'}),
    ellipse(cx - 6, cy - 8, 8, 3.4, {fill: '#FFFFFF', opacity: 0.45}),
    line(cx - 62, cy, cx - 32, cy, {
      stroke: '#8A8478',
      strokeWidth: 1.2,
      opacity: 0.7,
    }),
    line(cx + 32, cy, cx + 62, cy, {
      stroke: '#8A8478',
      strokeWidth: 1.2,
      opacity: 0.7,
    }),
    boltNode(cx - 7, cy - 58, 16, INK),
    tulip(cx - 14, cy + 32, INK),
    centeredPixelText(
      'MF',
      {x: cx - 2, y: cy + 28, width: 28, height: 18},
      2,
      INK,
    ),
  ]);
}

function modeSwitch(): SceneNode {
  return group([
    rect(16, 454, 184, 44, {rx: 16, fill: '#4A4742'}),
    rect(19, 457, 178, 38, {rx: 14, fill: '#2E2C29'}),
    rect(20, 458, 88, 36, {
      rx: 13,
      fill: 'url(#key-face)',
      stroke: '#6E6A62',
      strokeWidth: 0.8,
    }),
    cameraGlyph(48, 466, RED),
    playGlyph(154, 476, BLUE),
  ]);
}

function strap(): SceneNode {
  return group([
    circle(338, 548, 16, {fill: '#8A8478'}),
    circleRing(338, 546, 15, 9, '#E7E1D6'),
    circleRing(338, 546, 12.5, 9.2, '#8A8478'),
    path('M346 554 C358 578, 358 640, 348 704', {
      fill: 'none',
      stroke: '#1A1A1A',
      strokeWidth: 8,
      strokeLinecap: 'round',
    }),
    path('M344 556 C354 582, 354 636, 346 698', {
      fill: 'none',
      stroke: '#5A5A5A',
      strokeWidth: 2.2,
      strokeLinecap: 'round',
    }),
  ]);
}

function buildSilverCompactScene(): Scene {
  const {lcd} = silverCompactLayout;
  const panel: RoundBox = {
    x: lcd.x - 12,
    y: lcd.y - 12,
    width: lcd.width + 26,
    height: lcd.height + 22,
    radius: 14,
  };
  const shutter = silverCompactLayout.controls.shutter;
  const shutterCx = shutter.x + shutter.width / 2;
  const shutterCy = shutter.y + shutter.height / 2;
  const power = silverCompactLayout.controls.power;
  const dial = silverCompactLayout.controls.zoomOut;
  const dialWidth =
    silverCompactLayout.controls.zoomIn.x +
    silverCompactLayout.controls.zoomIn.width -
    dial.x;

  return {
    viewBox: silverCompactLayout.viewBox,
    gradients,
    nodes: [
      ellipse(180, 758, 150, 14, {fill: '#000000', opacity: 0.12}),
      punchedRoundRect(shell, silverCompactCutout, {fill: 'url(#body-edge)'}),
      punchedRoundRect(face, silverCompactCutout, {fill: 'url(#body-face)'}),
      ...brush(20, 36, 320, 66),
      ...brush(20, 382, 320, 360),
      rect(28, 32, 150, 7, {rx: 3, fill: '#FFFFFF', opacity: 0.33}),
      punchedRoundRect(
        {
          x: panel.x + 1.5,
          y: panel.y + 3,
          width: panel.width,
          height: panel.height,
          radius: panel.radius,
        },
        {
          x: silverCompactCutout.x + 1,
          y: silverCompactCutout.y + 2,
          width: silverCompactCutout.width,
          height: silverCompactCutout.height,
          radius: silverCompactCutout.radius,
        },
        {fill: '#000000', opacity: 0.14},
      ),
      punchedRoundRect(panel, silverCompactCutout, {
        fill: 'url(#panel-face)',
        stroke: '#8A8478',
        strokeWidth: 1.1,
      }),
      bezelRing(silverCompactCutout, 8, '#23272B'),
      bezelRing(silverCompactCutout, 3.5, '#5E656C'),
      bezelRing(silverCompactCutout, 1.2, '#C5CCD2'),
      hinge(3, panel.y + 8, 18, panel.height - 16),
      knurledDial(dial.x, dial.y, dialWidth, dial.height),
      centeredPixelText(
        'W',
        {x: dial.x + 1, y: dial.y + 15, width: 20, height: 20},
        2,
        INK,
      ),
      centeredPixelText(
        'T',
        {x: dial.x + dialWidth - 21, y: dial.y + 15, width: 20, height: 20},
        2,
        INK,
      ),
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
      viewfinder(204, 54),
      led(236, 44, '#3FAE67'),
      led(250, 60, '#E0A24A'),
      shutterButton(shutterCx, shutterCy, shutter.width / 2 - 4),
      centeredPixelText(
        'DC IN',
        {x: 12, y: 370, width: 88, height: 16},
        2,
        ENGRAVED,
      ),
      rect(16, 390, 84, 32, {
        rx: 6,
        fill: '#2A2A2A',
        stroke: '#111111',
        strokeWidth: 1,
      }),
      rect(28, 402, 60, 4, {rx: 2, fill: '#4A4A4A'}),
      rect(48, 394, 16, 6, {rx: 1, fill: '#3A3A3A'}),
      centeredPixelText(
        'SET',
        {x: 116, y: 372, width: 66, height: 16},
        2,
        ENGRAVED,
      ),
      centeredPixelText(
        'MENU',
        {x: 194, y: 372, width: 80, height: 16},
        2,
        ENGRAVED,
      ),
      pillKey(116, 392, 66, 40),
      pillKey(194, 392, 80, 40),
      modeSwitch(),
      rect(216, 456, 78, 40, {rx: 8, fill: '#C9C3B6', opacity: 0.45}),
      holeGrid(226, 464, 5, 4, 8, 2.1, '#5C5852'),
      dPad(180, 578),
      centeredPixelText(
        'FUNC.',
        {x: 16, y: 664, width: 82, height: 18},
        2,
        BLUE,
      ),
      centeredPixelText(
        'DISP.',
        {x: 108, y: 664, width: 82, height: 18},
        2,
        BLUE,
      ),
      printerGlyph(228, 662, BLUE),
      roundKey(57, 712, 20),
      roundKey(149, 712, 20),
      roundKey(248, 712, 20),
      strap(),
      centeredPixelText(
        'LUMEN',
        {x: 120, y: 738, width: 120, height: 16},
        2,
        ENGRAVED,
      ),
      centeredPixelText(
        'L-80',
        {x: 140, y: 752, width: 80, height: 14},
        2,
        '#8A8478',
      ),
    ],
  };
}

export const silverCompactScene: Scene = buildSilverCompactScene();
