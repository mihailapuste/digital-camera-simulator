import {fmt, group, type Scene} from './sceneModel';
import type {SkinRotation} from './types';

/** SVG transform matching `mapDesignPoint` for a clockwise quarter turn. */
export function clockwiseQuarterTransform(designHeight: number): string {
  return `translate(${fmt(designHeight)} 0) rotate(90)`;
}

/**
 * Wraps a landscape scene so its viewBox is the portrait phone frame.
 * Nodes stay in design coordinates; the group applies the same turn as
 * `resolveSkinLayout`.
 */
export function presentSkinScene(
  scene: Scene,
  rotation: SkinRotation | undefined,
): Scene {
  if (rotation !== 90) {
    return scene;
  }
  const {width, height} = scene.viewBox;
  return {
    viewBox: {width: height, height: width},
    gradients: scene.gradients,
    nodes: [
      group(scene.nodes, {transform: clockwiseQuarterTransform(height)}),
    ],
  };
}
