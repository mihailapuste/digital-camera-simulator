import {boltNode} from '../lcd/icons';
import {centeredPixelText, pixelTextNodes, pixelTextWidth} from '../lcd/pixelFont';
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
  punchedRoundRect,
  type RoundBox,
} from './shapes';
import type {DesignRect, SkinLayout} from './types';

/**
 * Landscape back of the LUMEN L-80, in the orientation you would hold the
 * camera to take a landscape photo. `rotation: 90` turns this clockwise onto
 * a portrait phone: SET/MENU down the left edge, viewfinder on the right,
 * and the control deck along the bottom.
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
  lcd: {x: 96, y: 62, width: 236, height: 236},
  controls: {
    shutter: {x: 466, y: 32, width: 108, height: 108},
    zoomOut: {x: 615, y: 32, width: 55, height: 48},
    zoomIn: {x: 681, y: 32, width: 55, height: 48},
    viewfinder: {x: 362, y: 18, width: 67.5, height: 57.5},
    set: {x: 229, y: 306, width: 54, height: 46},
    menu: {x: 353, y: 306, width: 54, height: 46},
    mode: {x: 615, y: 100, width: 55, height: 48},
    review: {x: 681, y: 100, width: 55, height: 48},
    flash: {x: 494, y: 199, width: 52, height: 52},
    func: {x: 615, y: 176, width: 121, height: 52},
    display: {x: 615, y: 248, width: 121, height: 52},
  },
};

/**
 * Engraved body text in landscape pixels. Button labels are drawn on the
 * keys themselves.
 */
export const silverCompactLabels = {
  dcIn: {text: 'DC IN', x: 100, y: 338, width: pixelTextWidth('DC IN', 2), height: 14},
} as const;

export const silverCompactCutout: RoundBox = {
  ...silverCompactLayout.lcd,
  radius: 6,
};

const INK = '#2C2C2C';
const ENGRAVED = '#5C5852';
const BLUE = '#2F74B8';
const RED = '#D64545';

const shell: RoundBox = {x: 0, y: 0, width: 780, height: 360, radius: 0};
const face: RoundBox = {x: 0, y: 2, width: 780, height: 356, radius: 0};

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

function viewfinder(box: DesignRect): SceneNode {
  const {x: cx, y: cy} = center(box);
  const glassSize = 42.5;
  return group([
    rect(box.x, box.y, box.width, box.height, {
      rx: 11,
      fill: 'url(#key-face)',
      stroke: '#6E6A62',
      strokeWidth: 1,
    }),
    rect(cx - glassSize / 2, cy - glassSize / 2, glassSize, glassSize, {
      rx: 4,
      fill: 'url(#finder-glass)',
    }),
    path(
      `M${cx - 9} ${cy - 3} v-6 h6 M${cx + 3} ${cy - 9} h6 v6 M${cx + 9} ${cy + 3} v6 h-6 M${cx - 3} ${cy + 9} h-6 v-6`,
      {fill: 'none', stroke: '#E6E9ED', strokeWidth: 1.75},
    ),
  ]);
}

function led(cx: number, cy: number, core: string): SceneNode {
  return group([
    circle(cx, cy, 5.4, {fill: '#3A3A3A', stroke: '#6E6A62', strokeWidth: 0.7}),
    circle(cx, cy, 2.5, {fill: core}),
    circle(cx - 0.8, cy - 0.9, 0.7, {fill: '#FFFFFF', opacity: 0.8}),
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

function engraved(text: string, x: number, y: number, color: string): SceneNode {
  return group(pixelTextNodes(text, x, y, 2, color));
}

function labeledKey(box: DesignRect, label: string): SceneNode {
  return group([
    pillKey(box.x, box.y, box.width, box.height),
    centeredPixelText(label, box, 2, INK),
  ]);
}

function center(box: DesignRect) {
  return {x: box.x + box.width / 2, y: box.y + box.height / 2};
}

function buildSilverCompactScene(): Scene {
  const {lcd, controls} = silverCompactLayout;
  const panel: RoundBox = {
    x: lcd.x - 16,
    y: lcd.y - 10,
    width: lcd.width + 30,
    height: lcd.height + 15,
    radius: 12,
  };
  const shutter = controls.shutter;
  const {zoomOut, zoomIn} = controls;
  const zoomPanelInset = 8;
  const camera = center(controls.mode);
  const playback = center(controls.review);
  const flash = center(controls.flash);

  return {
    viewBox: silverCompactLayout.viewBox,
    gradients,
    nodes: [
      punchedRoundRect(shell, silverCompactCutout, {fill: 'url(#body-edge)'}),
      punchedRoundRect(face, silverCompactCutout, {fill: 'url(#body-face)'}),
      ...brush(24, 18, 200, 40),
      rect(444, 18, 306, 310, {
        rx: 24,
        fill: 'url(#panel-face)',
        stroke: '#B2AA9D',
        strokeWidth: 1,
      }),
      punchedRoundRect(panel, silverCompactCutout, {
        fill: 'url(#panel-face)',
        stroke: '#8A8478',
        strokeWidth: 1,
      }),
      bezelRing(silverCompactCutout, 7, '#23272B'),
      bezelRing(silverCompactCutout, 3, '#5E656C'),
      bezelRing(silverCompactCutout, 1, '#C5CCD2'),
      viewfinder(controls.viewfinder),
      led(331, 28, '#3FAE67'),
      led(347, 28, '#E0A24A'),
      shutterButton(
        shutter.x + shutter.width / 2,
        shutter.y + shutter.height / 2,
        shutter.width / 2 - 4,
      ),
      rect(
        zoomOut.x - zoomPanelInset,
        zoomOut.y - zoomPanelInset,
        zoomIn.x + zoomIn.width - zoomOut.x + zoomPanelInset * 2,
        zoomOut.height + zoomPanelInset * 2,
        {rx: 23, fill: '#CEC8BC', stroke: '#A29A8E', strokeWidth: 1},
      ),
      labeledKey(zoomOut, 'W'),
      labeledKey(zoomIn, 'T'),
      rect(94, 330, 72, 24, {
        rx: 4,
        fill: '#B7B1A4',
        stroke: '#6E6A62',
        strokeWidth: 0.8,
      }),
      rect(100, 336, 60, 4, {rx: 1, fill: '#8A8478'}),
      engraved(silverCompactLabels.dcIn.text, silverCompactLabels.dcIn.x, silverCompactLabels.dcIn.y, ENGRAVED),
      labeledKey(controls.set, 'SET'),
      labeledKey(controls.menu, 'MENU'),
      pillKey(controls.mode.x, controls.mode.y, controls.mode.width, controls.mode.height),
      pillKey(controls.review.x, controls.review.y, controls.review.width, controls.review.height),
      cameraGlyph(camera.x - 9, camera.y - 8, RED),
      playGlyph(playback.x, playback.y, BLUE),
      roundKey(flash.x, flash.y, 19),
      boltNode(flash.x - 11, flash.y - 10, 20, INK),
      labeledKey(controls.func, 'FUNC'),
      labeledKey(controls.display, 'DISP'),
      centeredPixelText('LUMEN', {x: 98, y: 19, width: 70, height: 16}, 2, ENGRAVED),
      centeredPixelText('L-80', {x: 174, y: 20, width: 54, height: 14}, 2, '#8A8478'),
    ],
  };
}

export const silverCompactScene: Scene = buildSilverCompactScene();
