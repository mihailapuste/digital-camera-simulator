import {buildLcdScene} from '../lcd/buildLcdScene';
import {resolveLcdTheme} from '../lcd/theme';
import type {FlashMode, FocusState, LcdMode, LcdThemeName} from '../lcd/types';
import {
  fmt,
  group,
  prefixScene,
  rect,
  type Scene,
  type SceneNode,
} from './sceneModel';
import type {DesignRect} from './types';
import {buildViewfinderBackdrop} from './viewfinderBackdrop';

export type PreviewSample = {
  theme: LcdThemeName;
  flashMode: FlashMode;
  focus: FocusState;
  mode: LcdMode;
  shotsRemaining: number;
  batteryLevel: number;
  dateText: string;
};

function place(
  scene: Scene,
  hole: DesignRect,
  prefix: string,
): {
  scene: Scene;
  node: SceneNode;
} {
  const prefixed = prefixScene(scene, prefix);
  const sx = hole.width / scene.viewBox.width;
  const sy = hole.height / scene.viewBox.height;
  return {
    scene: prefixed,
    node: group(prefixed.nodes, {
      transform: `translate(${fmt(hole.x)} ${fmt(hole.y)}) scale(${fmt(sx)} ${fmt(sy)})`,
    }),
  };
}

export function composeSkinPreview(
  body: Scene,
  hole: DesignRect,
  sample: PreviewSample,
): Scene {
  const backdrop = place(buildViewfinderBackdrop(), hole, 'photo');
  const overlay = place(
    buildLcdScene({
      theme: resolveLcdTheme(sample.theme),
      batteryLevel: sample.batteryLevel,
      shotsRemaining: sample.shotsRemaining,
      flashMode: sample.flashMode,
      dateText: sample.dateText,
      focus: sample.focus,
      mode: sample.mode,
      showBrackets: sample.mode === 'live',
    }),
    hole,
    'lcd',
  );
  const skinned = prefixScene(body, 'body');
  return {
    viewBox: body.viewBox,
    gradients: [
      ...backdrop.scene.gradients,
      ...skinned.gradients,
      ...overlay.scene.gradients,
    ],
    nodes: [
      rect(0, 0, body.viewBox.width, body.viewBox.height, {fill: '#121418'}),
      backdrop.node,
      ...skinned.nodes,
      overlay.node,
    ],
  };
}
