import {sceneToSvg} from './sceneToSvg';
import {composeSkinPreview, type PreviewSample} from './composePreview';
import {coolpixBlueLayout, coolpixBlueScene} from './coolpixBlue';
import {cyberBlackLayout, cyberBlackScene} from './cyberBlack';
import {ixySilverLayout, ixySilverScene} from './ixySilver';
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
    id: 'ixy-silver',
    scene: ixySilverScene,
    layout: ixySilverLayout,
    sample: {
      theme: 'classic',
      flashMode: 'auto',
      focus: 'locked',
      mode: 'live',
      shotsRemaining: 18,
      batteryLevel: 0.8,
      dateText: '2004.11.25',
    },
  },
  {
    id: 'cyber-black',
    scene: cyberBlackScene,
    layout: cyberBlackLayout,
    sample: {
      theme: 'ice',
      flashMode: 'on',
      focus: 'searching',
      mode: 'live',
      shotsRemaining: 42,
      batteryLevel: 0.55,
      dateText: '2004.11.25',
    },
  },
  {
    id: 'coolpix-blue',
    scene: coolpixBlueScene,
    layout: coolpixBlueLayout,
    sample: {
      theme: 'amber',
      flashMode: 'red-eye',
      focus: 'idle',
      mode: 'review',
      shotsRemaining: 7,
      batteryLevel: 0.12,
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
