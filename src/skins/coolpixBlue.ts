import {centeredPixelText} from '../lcd/pixelFont';
import {
  bezelRing,
  circleRing,
  flashDome,
  labeledKey,
  playTriangle,
  powerGlyph,
  punchedRoundRect,
  roundShutter,
  zoomRocker,
  type RoundBox,
} from './shapes';
import {
  circle,
  ellipse,
  group,
  rect,
  type Scene,
  type SceneGradient,
} from './sceneModel';
import type {SkinLayout} from './types';

export const coolpixBlueMeta = {
  id: 'coolpix-blue',
  name: 'Coolpix-ish Blue',
  description:
    'Chunky translucent blue shell with a gel shutter and round keys.',
  lcdTheme: 'amber' as const,
};

export const coolpixBlueLayout: SkinLayout = {
  viewBox: {width: 360, height: 780},
  lcd: {x: 46, y: 172, width: 268, height: 201},
  controls: {
    flash: {x: 28, y: 34, width: 80, height: 80},
    power: {x: 248, y: 46, width: 80, height: 54},
    mode: {x: 22, y: 404, width: 76, height: 60},
    zoomOut: {x: 112, y: 400, width: 64, height: 68},
    zoomIn: {x: 176, y: 400, width: 64, height: 68},
    review: {x: 254, y: 404, width: 82, height: 60},
    shutter: {x: 100, y: 508, width: 160, height: 160},
  },
};

export const coolpixBlueCutout: RoundBox = {
  ...coolpixBlueLayout.lcd,
  radius: 10,
};

const shell: RoundBox = {x: 8, y: 8, width: 344, height: 764, radius: 54};
const face: RoundBox = {x: 18, y: 18, width: 324, height: 744, radius: 46};

const gradients: SceneGradient[] = [
  {
    id: 'blue-shell',
    kind: 'linear',
    x1: 0,
    y1: 0,
    x2: 0,
    y2: 1,
    stops: [
      {offset: '0', color: '#1A4EAA'},
      {offset: '1', color: '#0A2760'},
    ],
  },
  {
    id: 'blue-face',
    kind: 'linear',
    x1: 0,
    y1: 0,
    x2: 0,
    y2: 1,
    stops: [
      {offset: '0', color: '#7EBEFF'},
      {offset: '0.38', color: '#1F6AF0'},
      {offset: '1', color: '#123888'},
    ],
  },
  {
    id: 'blue-glow',
    kind: 'radial',
    cx: 0.5,
    cy: 0.45,
    r: 0.55,
    stops: [
      {offset: '0', color: '#FFFFFF', opacity: 0.75},
      {offset: '1', color: '#FFFFFF', opacity: 0},
    ],
  },
];

function buildCoolpixBlueScene(): Scene {
  const {controls} = coolpixBlueLayout;
  const flash = controls.flash;
  const power = controls.power;
  const shutter = controls.shutter;
  const zoom = {
    x: controls.zoomOut.x,
    y: controls.zoomOut.y,
    width: controls.zoomIn.x + controls.zoomIn.width - controls.zoomOut.x,
    height: controls.zoomOut.height,
  };
  const dots: Scene['nodes'] = [];
  for (let row = 0; row < 3; row += 1) {
    for (let column = 0; column < 10; column += 1) {
      dots.push(
        circle(48 + column * 28, 700 + row * 16, 2.4, {
          fill: 'rgba(255,255,255,0.28)',
        }),
      );
    }
  }
  return {
    viewBox: coolpixBlueLayout.viewBox,
    gradients,
    nodes: [
      punchedRoundRect(shell, coolpixBlueCutout, {fill: 'url(#blue-shell)'}),
      punchedRoundRect(face, coolpixBlueCutout, {fill: 'url(#blue-face)'}),
      ellipse(180, 78, 120, 36, {fill: 'url(#blue-glow)'}),
      flashDome(flash.x + flash.width / 2, flash.y + flash.height / 2, 32),
      labeledKey({
        ...power,
        radius: 18,
        face: '#F4F7FB',
        edge: '#0E2C6E',
        ink: '#163A8C',
      }),
      ...powerGlyph(
        power.x + power.width / 2,
        power.y + power.height / 2,
        8,
        '#163A8C',
      ),
      circle(power.x + power.width - 10, power.y + 8, 4, {fill: '#3DFF6E'}),
      centeredPixelText(
        'AZURA',
        {x: 100, y: 122, width: 160, height: 24},
        3,
        '#F4FBFF',
      ),
      centeredPixelText(
        'B3',
        {x: 140, y: 148, width: 80, height: 16},
        2,
        '#D6E8FF',
      ),
      bezelRing(coolpixBlueCutout, 12, '#F7F8FB'),
      bezelRing(coolpixBlueCutout, 4, '#9BB6E8'),
      labeledKey({
        ...controls.mode,
        radius: 18,
        label: 'M',
        labelScale: 3,
        face: '#F4F7FB',
        edge: '#0E2C6E',
        ink: '#163A8C',
      }),
      zoomRocker({
        ...zoom,
        horizontal: true,
        face: '#F4F7FB',
        edge: '#0E2C6E',
        ink: '#163A8C',
      }),
      group([
        labeledKey({
          ...controls.review,
          radius: 18,
          face: '#F4F7FB',
          edge: '#0E2C6E',
          ink: '#163A8C',
        }),
        playTriangle(
          controls.review.x,
          controls.review.y,
          controls.review.width,
          controls.review.height,
          '#163A8C',
        ),
      ]),
      roundShutter(
        shutter.x + shutter.width / 2,
        shutter.y + shutter.height / 2,
        shutter.width / 2 - 8,
        {well: '#0C2C70', ring: '#F5C542', cap: '#F7F1E4'},
      ),
      ...dots,
      rect(300, 640, 28, 46, {
        rx: 8,
        fill: 'none',
        stroke: '#D6E6FF',
        strokeWidth: 2,
      }),
      circleRing(314, 663, 6, 3, '#D6E6FF'),
    ],
  };
}

export const coolpixBlueScene: Scene = buildCoolpixBlueScene();
