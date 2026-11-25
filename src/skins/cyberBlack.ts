import {boltNode} from '../lcd/icons';
import {centeredPixelText} from '../lcd/pixelFont';
import {
  bezelRing,
  gripGrooves,
  labeledKey,
  modeDial,
  playTriangle,
  punchedRoundRect,
  roundShutter,
  screw,
  zoomRocker,
  type RoundBox,
} from './shapes';
import {
  circle,
  ellipse,
  line,
  rect,
  group,
  type Scene,
  type SceneGradient,
} from './sceneModel';
import type {SkinLayout} from './types';

export const cyberBlackMeta = {
  id: 'cyber-black',
  name: 'Cyber Black',
  description:
    'Gloss black body, mode dial, and a thumb shutter on the lower right.',
  lcdTheme: 'ice' as const,
};

export const cyberBlackLayout: SkinLayout = {
  viewBox: {width: 360, height: 780},
  lcd: {x: 22, y: 108, width: 240, height: 180},
  controls: {
    flash: {x: 22, y: 32, width: 108, height: 52},
    power: {x: 262, y: 34, width: 76, height: 44},
    mode: {x: 274, y: 108, width: 66, height: 66},
    zoomOut: {x: 276, y: 186, width: 62, height: 46},
    zoomIn: {x: 276, y: 232, width: 62, height: 46},
    review: {x: 276, y: 290, width: 62, height: 52},
    shutter: {x: 186, y: 500, width: 136, height: 136},
  },
};

export const cyberBlackCutout: RoundBox = {...cyberBlackLayout.lcd, radius: 5};

const shell: RoundBox = {x: 8, y: 8, width: 344, height: 764, radius: 32};
const face: RoundBox = {x: 16, y: 16, width: 328, height: 748, radius: 26};

const gradients: SceneGradient[] = [
  {
    id: 'cyber-chrome',
    kind: 'linear',
    x1: 0,
    y1: 0,
    x2: 1,
    y2: 1,
    stops: [
      {offset: '0', color: '#F2F3F6'},
      {offset: '0.45', color: '#9AA0A8'},
      {offset: '1', color: '#5E646C'},
    ],
  },
  {
    id: 'cyber-face',
    kind: 'linear',
    x1: 0,
    y1: 0,
    x2: 0.2,
    y2: 1,
    stops: [
      {offset: '0', color: '#2A2D33'},
      {offset: '0.35', color: '#14161A'},
      {offset: '1', color: '#07080A'},
    ],
  },
];

function buildCyberBlackScene(): Scene {
  const {controls} = cyberBlackLayout;
  const shutter = controls.shutter;
  const mode = controls.mode;
  const power = controls.power;
  const flash = controls.flash;
  const zoom = {
    x: controls.zoomOut.x,
    y: controls.zoomOut.y,
    width: controls.zoomOut.width,
    height: controls.zoomIn.y + controls.zoomIn.height - controls.zoomOut.y,
  };
  return {
    viewBox: cyberBlackLayout.viewBox,
    gradients,
    nodes: [
      punchedRoundRect(shell, cyberBlackCutout, {fill: 'url(#cyber-chrome)'}),
      punchedRoundRect(face, cyberBlackCutout, {fill: 'url(#cyber-face)'}),
      ellipse(150, 70, 90, 22, {fill: '#FFFFFF', opacity: 0.08}),
      rect(28, 22, 200, 4, {rx: 2, fill: '#E23B3B'}),
      screw(32, 28, 3.6),
      screw(328, 28, 3.6),
      screw(32, 748, 3.6),
      screw(328, 748, 3.6),
      labeledKey({
        x: flash.x,
        y: flash.y,
        width: flash.width,
        height: flash.height,
        radius: 10,
        face: '#2A2E36',
        edge: '#0C0D10',
        ink: '#E8E8EA',
      }),
      boltNode(flash.x + flash.width / 2 - 8, flash.y + 12, 22, '#F4F6F8'),
      rect(power.x, power.y + 8, power.width, 28, {
        rx: 14,
        fill: '#0C0D10',
        stroke: '#3A3E46',
        strokeWidth: 1.5,
      }),
      circle(power.x + power.width - 18, power.y + 22, 10, {fill: '#E23B3B'}),
      circle(power.x + 16, power.y + 22, 3, {fill: '#3A3E46'}),
      bezelRing(cyberBlackCutout, 8, '#050506'),
      bezelRing(cyberBlackCutout, 2.5, '#8B9098'),
      modeDial(
        mode.x + mode.width / 2,
        mode.y + mode.height / 2,
        24,
        '#2C313A',
        '#C8CCD4',
      ),
      zoomRocker({
        ...zoom,
        horizontal: false,
        face: '#23262C',
        edge: '#0C0D10',
        ink: '#E6E6E8',
      }),
      group([
        labeledKey({
          ...controls.review,
          radius: 10,
          face: '#23262C',
          edge: '#0C0D10',
          ink: '#E6E6E8',
        }),
        playTriangle(
          controls.review.x,
          controls.review.y,
          controls.review.width,
          controls.review.height,
          '#E6E6E8',
        ),
      ]),
      centeredPixelText(
        'NITE',
        {x: 28, y: 400, width: 140, height: 28},
        4,
        '#E8E8EA',
      ),
      centeredPixelText(
        'CX-9',
        {x: 36, y: 436, width: 120, height: 20},
        2,
        '#9AA0A8',
      ),
      gripGrooves(30, 480, 130, 8, 10, 'rgba(255,255,255,0.14)'),
      line(30, 470, 160, 560, {
        stroke: 'rgba(255,255,255,0.08)',
        strokeWidth: 8,
        strokeLinecap: 'round',
      }),
      roundShutter(
        shutter.x + shutter.width / 2,
        shutter.y + shutter.height / 2,
        shutter.width / 2 - 4,
        {well: '#050506', ring: '#E23B3B', cap: '#1A1C20'},
      ),
    ],
  };
}

export const cyberBlackScene: Scene = buildCyberBlackScene();
