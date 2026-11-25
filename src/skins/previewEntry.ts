import {sceneToSvg} from './sceneToSvg';
import {composeSkinPreview, type PreviewSample} from './composePreview';
import {silverCompactLayout, silverCompactScene} from './silverCompact';
import type {Scene} from './sceneModel';
import type {SkinLayout} from './types';

export type SkinPreview = {
  id: string;
  filename: string;
  svg: string;
};

const samples: {
  id: string;
  scene: Scene;
  layout: SkinLayout;
  sample: PreviewSample;
}[] = [
  {
    id: 'silver-compact',
    scene: silverCompactScene,
    layout: silverCompactLayout,
    sample: {
      theme: 'classic',
      flashMode: 'auto',
      focus: 'idle',
      mode: 'live',
      shotsRemaining: 68,
      batteryLevel: 0.8,
      dateText: '2004.11.25',
    },
  },
];

export function buildPreviews(): SkinPreview[] {
  return samples.map(entry => ({
    id: entry.id,
    filename: `${entry.id}.png`,
    svg: sceneToSvg(
      composeSkinPreview(entry.scene, entry.layout.lcd, entry.sample),
    ),
  }));
}
