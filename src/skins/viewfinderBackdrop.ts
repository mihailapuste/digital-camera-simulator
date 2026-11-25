import {
  circle,
  ellipse,
  polygon,
  rect,
  type Scene,
  type SceneGradient,
} from './sceneModel';
import {LCD_VIEWBOX} from '../lcd/types';

const gradients: SceneGradient[] = [
  {
    id: 'sky',
    kind: 'linear',
    x1: 0,
    y1: 0,
    x2: 0,
    y2: 1,
    stops: [
      {offset: '0', color: '#6EADD8'},
      {offset: '0.62', color: '#F6D7A4'},
      {offset: '1', color: '#F6D7A4'},
    ],
  },
];

/** A tiny illustrated frame so skin previews read as a live viewfinder. */
export function buildViewfinderBackdrop(): Scene {
  const {width, height} = LCD_VIEWBOX;
  return {
    viewBox: LCD_VIEWBOX,
    gradients,
    nodes: [
      rect(0, 0, width, height, {fill: 'url(#sky)'}),
      circle(width * 0.78, height * 0.22, 26, {fill: '#FFF3C4'}),
      circle(width * 0.78, height * 0.22, 40, {fill: '#FFF3C4', opacity: 0.35}),
      ellipse(width * 0.28, height * 0.7, 150, 48, {fill: '#7EAA58'}),
      ellipse(width * 0.72, height * 0.74, 160, 52, {fill: '#4E7A38'}),
      rect(0, height * 0.72, width, height * 0.28, {fill: '#3E6B34'}),
      rect(width * 0.18, height * 0.58, 8, 48, {fill: '#6A4328'}),
      polygon(
        [
          [width * 0.18 - 22, height * 0.62],
          [width * 0.18 + 4, height * 0.4],
          [width * 0.18 + 30, height * 0.62],
        ],
        {fill: '#2F6B34'},
      ),
      rect(width * 0.55, height * 0.5, 54, 62, {fill: '#F3E0C0'}),
      polygon(
        [
          [width * 0.55 - 8, height * 0.5],
          [width * 0.55 + 27, height * 0.38],
          [width * 0.55 + 62, height * 0.5],
        ],
        {fill: '#C45B4A'},
      ),
      rect(width * 0.55 + 20, height * 0.62, 14, 26, {fill: '#8C5A3C'}),
    ],
  };
}
