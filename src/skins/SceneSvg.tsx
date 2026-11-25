import React, {useId, useMemo} from 'react';
import Svg, {
  Circle,
  Defs,
  Ellipse,
  G,
  Line,
  LinearGradient,
  Path,
  Polygon,
  RadialGradient,
  Rect,
  Stop,
} from 'react-native-svg';
import {clockwiseQuarterTransform} from './presentScene';
import {prefixScene, type Scene, type SceneNode} from './sceneModel';
import type {SkinRotation} from './types';

type SceneSvgProps = {
  scene: Scene;
  width: number | string;
  height: number | string;
  /** Draws a landscape scene turned clockwise into a portrait frame. */
  rotation?: SkinRotation;
};

function paintOf(node: Exclude<SceneNode, {type: 'group'}>) {
  return {
    fill: node.fill ?? 'none',
    stroke: node.stroke,
    strokeWidth: node.strokeWidth,
    strokeLinecap: node.strokeLinecap,
    strokeLinejoin: node.strokeLinejoin,
    opacity: node.opacity,
  };
}

function renderNode(node: SceneNode, key: string): React.ReactNode {
  if (node.type === 'group') {
    return (
      <G
        key={key}
        opacity={node.opacity}
        transform={node.transform}
        testID={node.testID}>
        {node.children.map((child, index) =>
          renderNode(child, `${key}-${index}`),
        )}
      </G>
    );
  }
  const paint = paintOf(node);
  if (node.type === 'rect') {
    return (
      <Rect
        key={key}
        x={node.x}
        y={node.y}
        width={node.width}
        height={node.height}
        rx={node.rx}
        ry={node.ry}
        testID={node.testID}
        {...paint}
      />
    );
  }
  if (node.type === 'circle') {
    return (
      <Circle
        key={key}
        cx={node.cx}
        cy={node.cy}
        r={node.r}
        testID={node.testID}
        {...paint}
      />
    );
  }
  if (node.type === 'ellipse') {
    return (
      <Ellipse
        key={key}
        cx={node.cx}
        cy={node.cy}
        rx={node.rx}
        ry={node.ry}
        testID={node.testID}
        {...paint}
      />
    );
  }
  if (node.type === 'path') {
    return (
      <Path
        key={key}
        d={node.d}
        fillRule={node.fillRule}
        testID={node.testID}
        {...paint}
      />
    );
  }
  if (node.type === 'line') {
    return (
      <Line
        key={key}
        x1={node.x1}
        y1={node.y1}
        x2={node.x2}
        y2={node.y2}
        testID={node.testID}
        {...paint}
      />
    );
  }
  return (
    <Polygon
      key={key}
      points={node.points}
      fillRule={node.fillRule}
      testID={node.testID}
      {...paint}
    />
  );
}

/**
 * Draws a scene with react-native-svg. Gradient ids are prefixed per instance
 * so several bodies can sit on one web page without colliding.
 */
export function SceneSvg({
  scene,
  width,
  height,
  rotation = 0,
}: SceneSvgProps) {
  const rawId = useId();
  const prefix = `s${rawId.replace(/[^a-zA-Z0-9]/g, '')}`;
  const drawn = useMemo(() => prefixScene(scene, prefix), [scene, prefix]);
  const quarter = rotation === 90;
  const viewWidth = quarter ? scene.viewBox.height : scene.viewBox.width;
  const viewHeight = quarter ? scene.viewBox.width : scene.viewBox.height;
  const turn = quarter
    ? clockwiseQuarterTransform(scene.viewBox.height)
    : undefined;

  return (
    <Svg
      width={width}
      height={height}
      viewBox={`0 0 ${viewWidth} ${viewHeight}`}
      preserveAspectRatio="xMidYMid meet">
      {drawn.gradients.length > 0 ? (
        <Defs>
          {drawn.gradients.map(gradient =>
            gradient.kind === 'linear' ? (
              <LinearGradient
                key={gradient.id}
                id={gradient.id}
                x1={gradient.x1 ?? 0}
                y1={gradient.y1 ?? 0}
                x2={gradient.x2 ?? 0}
                y2={gradient.y2 ?? 1}
                gradientUnits={gradient.units}>
                {gradient.stops.map(stop => (
                  <Stop
                    key={`${gradient.id}-${stop.offset}-${stop.color}`}
                    offset={stop.offset}
                    stopColor={stop.color}
                    stopOpacity={stop.opacity ?? 1}
                  />
                ))}
              </LinearGradient>
            ) : (
              <RadialGradient
                key={gradient.id}
                id={gradient.id}
                cx={gradient.cx ?? 0.5}
                cy={gradient.cy ?? 0.5}
                r={gradient.r ?? 0.5}
                fx={gradient.fx}
                fy={gradient.fy}
                gradientUnits={gradient.units}>
                {gradient.stops.map(stop => (
                  <Stop
                    key={`${gradient.id}-${stop.offset}-${stop.color}`}
                    offset={stop.offset}
                    stopColor={stop.color}
                    stopOpacity={stop.opacity ?? 1}
                  />
                ))}
              </RadialGradient>
            ),
          )}
        </Defs>
      ) : null}
      {turn ? (
        <G transform={turn}>
          {drawn.nodes.map((node, index) => renderNode(node, `n${index}`))}
        </G>
      ) : (
        drawn.nodes.map((node, index) => renderNode(node, `n${index}`))
      )}
    </Svg>
  );
}
