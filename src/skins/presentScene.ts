import {fmt} from './sceneModel';

/** SVG transform matching `mapDesignPoint` for a clockwise quarter turn. */
export function clockwiseQuarterTransform(designHeight: number): string {
  return `translate(${fmt(designHeight)} 0) rotate(90)`;
}
