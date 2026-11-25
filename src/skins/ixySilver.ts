import {centeredPixelText} from '../lcd/pixelFont';
import {
  bezelRing,
  flashWindow,
  gripGrooves,
  labeledKey,
  playTriangle,
  powerGlyph,
  punchedRoundRect,
  roundShutter,
  screw,
  speakerHoles,
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

export const ixySilverMeta = {
  id: 'ixy-silver',
  name: 'Ixy Silver',
  description:
    'Champagne metal compact with a centered 4:3 LCD and a round shutter.',
  lcdTheme: 'classic' as const,
};

export const ixySilverLayout: SkinLayout = {
  viewBox: {width: 360, height: 780},
  lcd: {x: 44, y: 168, width: 272, height: 204},
  controls: {
    flash: {x: 32, y: 40, width: 118, height: 62},
    power: {x: 270, y: 44, width: 56, height: 56},
    mode: {x: 28, y: 404, width: 86, height: 54},
    zoomOut: {x: 124, y: 400, width: 56, height: 62},
    zoomIn: {x: 180, y: 400, width: 56, height: 62},
    review: {x: 246, y: 404, width: 86, height: 54},
    shutter: {x: 110, y: 496, width: 140, height: 140},
  },
};

export const ixySilverCutout: RoundBox = {...ixySilverLayout.lcd, radius: 6};

const shell: RoundBox = {x: 10, y: 10, width: 340, height: 760, radius: 46};
const face: RoundBox = {x: 22, y: 22, width: 316, height: 736, radius: 36};

const gradients: SceneGradient[] = [
  {
    id: 'ixy-shell',
    kind: 'linear',
    x1: 0,
    y1: 0,
    x2: 0,
    y2: 1,
    stops: [
      {offset: '0', color: '#FBF8F2'},
      {offset: '0.42', color: '#D9D3C6'},
      {offset: '1', color: '#A39E92'},
    ],
  },
];

function buildIxySilverScene(): Scene {
  const {controls, lcd} = ixySilverLayout;
  const shutter = controls.shutter;
  const shutterCx = shutter.x + shutter.width / 2;
  const shutterCy = shutter.y + shutter.height / 2;
  const power = controls.power;
  const zoom = {
    x: controls.zoomOut.x,
    y: controls.zoomOut.y,
    width: controls.zoomIn.x + controls.zoomIn.width - controls.zoomOut.x,
    height: controls.zoomOut.height,
  };
  return {
    viewBox: ixySilverLayout.viewBox,
    gradients,
    nodes: [
      punchedRoundRect(shell, ixySilverCutout, {fill: 'url(#ixy-shell)'}),
      punchedRoundRect(face, ixySilverCutout, {fill: '#E6E1D5'}),
      rect(78, 16, 204, 10, {rx: 5, fill: '#FFFFFF', opacity: 0.45}),
      screw(40, 42),
      screw(320, 42),
      screw(40, 738),
      screw(320, 738),
      flashWindow(
        controls.flash.x + 4,
        controls.flash.y + 6,
        controls.flash.width - 8,
        controls.flash.height - 12,
      ),
      circle(power.x + power.width / 2, power.y + power.height / 2, 18, {
        fill: '#C9C3B6',
        stroke: '#6E6A62',
        strokeWidth: 2,
      }),
      circle(power.x + power.width / 2, power.y + power.height / 2, 14, {
        fill: '#E7E2D6',
      }),
      ...powerGlyph(
        power.x + power.width / 2,
        power.y + power.height / 2,
        7,
        '#3C3934',
      ),
      circle(power.x + power.width - 6, power.y + 8, 3.2, {fill: '#2EE56A'}),
      centeredPixelText(
        'SILVA',
        {x: 90, y: 116, width: 180, height: 24},
        3,
        '#3C3934',
      ),
      centeredPixelText(
        'SV-40',
        {x: 120, y: 142, width: 120, height: 18},
        2,
        '#6E6A62',
      ),
      bezelRing(ixySilverCutout, 9, '#2A2C2E'),
      bezelRing(ixySilverCutout, 3, '#6A6E72'),
      speakerHoles(lcd.x + lcd.width / 2 - 28, 388, 6, 11, 2.1, '#5C584F'),
      labeledKey({
        ...controls.mode,
        radius: 12,
        label: 'MODE',
        labelScale: 2,
        face: '#D5CFC3',
        edge: '#8A8478',
        ink: '#3A3832',
      }),
      zoomRocker({
        ...zoom,
        horizontal: true,
        face: '#D5CFC3',
        edge: '#8A8478',
        ink: '#3A3832',
      }),
      group([
        labeledKey({
          ...controls.review,
          radius: 12,
          face: '#D5CFC3',
          edge: '#8A8478',
          ink: '#3A3832',
        }),
        playTriangle(
          controls.review.x,
          controls.review.y,
          controls.review.width,
          controls.review.height,
          '#3A3832',
        ),
      ]),
      roundShutter(shutterCx, shutterCy, shutter.width / 2 - 6, {
        well: '#7A756C',
        ring: '#F7F4EE',
        cap: '#E3DDD0',
      }),
      ellipse(180, 700, 130, 28, {fill: '#CFC8BA', opacity: 0.9}),
      gripGrooves(70, 688, 220, 5, 8, '#8A8478'),
    ],
  };
}

export const ixySilverScene: Scene = buildIxySilverScene();
