export type SceneStop = {
  offset: string;
  color: string;
  opacity?: number;
};

export type SceneGradient = {
  id: string;
  kind: 'linear' | 'radial';
  x1?: number;
  y1?: number;
  x2?: number;
  y2?: number;
  cx?: number;
  cy?: number;
  r?: number;
  fx?: number;
  fy?: number;
  units?: 'objectBoundingBox' | 'userSpaceOnUse';
  stops: SceneStop[];
};

export type Paint = {
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  strokeLinecap?: 'butt' | 'round' | 'square';
  strokeLinejoin?: 'miter' | 'round' | 'bevel';
  opacity?: number;
  fillRule?: 'evenodd' | 'nonzero';
};

type NodeBase = {
  opacity?: number;
  testID?: string;
};

export type SceneNode =
  | (NodeBase &
      Paint & {
        type: 'rect';
        x: number;
        y: number;
        width: number;
        height: number;
        rx?: number;
        ry?: number;
      })
  | (NodeBase &
      Paint & {
        type: 'circle';
        cx: number;
        cy: number;
        r: number;
      })
  | (NodeBase &
      Paint & {
        type: 'ellipse';
        cx: number;
        cy: number;
        rx: number;
        ry: number;
      })
  | (NodeBase &
      Paint & {
        type: 'path';
        d: string;
      })
  | (NodeBase &
      Paint & {
        type: 'line';
        x1: number;
        y1: number;
        x2: number;
        y2: number;
      })
  | (NodeBase &
      Paint & {
        type: 'polygon';
        points: string;
      })
  | (NodeBase & {
      type: 'group';
      children: SceneNode[];
      transform?: string;
    });

export type Scene = {
  viewBox: {width: number; height: number};
  gradients: SceneGradient[];
  nodes: SceneNode[];
};

export function fmt(value: number): string {
  if (!Number.isFinite(value)) {
    return '0';
  }
  const rounded = Math.round(value * 100) / 100;
  return Object.is(rounded, -0) ? '0' : String(rounded);
}

export function rect(
  x: number,
  y: number,
  width: number,
  height: number,
  paint: Paint & {rx?: number; ry?: number; testID?: string} = {},
): SceneNode {
  return {type: 'rect', x, y, width, height, ...paint};
}

export function circle(
  cx: number,
  cy: number,
  r: number,
  paint: Paint & {testID?: string} = {},
): SceneNode {
  return {type: 'circle', cx, cy, r, ...paint};
}

export function ellipse(
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  paint: Paint = {},
): SceneNode {
  return {type: 'ellipse', cx, cy, rx, ry, ...paint};
}

export function path(
  d: string,
  paint: Paint & {testID?: string} = {},
): SceneNode {
  return {type: 'path', d, ...paint};
}

export function line(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  paint: Paint,
): SceneNode {
  return {type: 'line', x1, y1, x2, y2, ...paint};
}

export function polygon(
  points: [number, number][],
  paint: Paint = {},
): SceneNode {
  return {
    type: 'polygon',
    points: points.map(([x, y]) => `${fmt(x)},${fmt(y)}`).join(' '),
    ...paint,
  };
}

export function group(
  children: SceneNode[],
  extra: {opacity?: number; transform?: string; testID?: string} = {},
): SceneNode {
  return {type: 'group', children, ...extra};
}

const PAINT_URL = /url\(#([^)]+)\)/g;

function rewritePaint(
  value: string | undefined,
  ids: Map<string, string>,
): string | undefined {
  if (!value) {
    return value;
  }
  return value.replace(PAINT_URL, (_match, id: string) => {
    return `url(#${ids.get(id) ?? id})`;
  });
}

function rewriteNode(node: SceneNode, ids: Map<string, string>): SceneNode {
  if (node.type === 'group') {
    return {
      ...node,
      children: node.children.map(child => rewriteNode(child, ids)),
    };
  }
  return {
    ...node,
    fill: rewritePaint(node.fill, ids),
    stroke: rewritePaint(node.stroke, ids),
  };
}

/** Prefix gradient ids so several skins can share one HTML document on web. */
export function prefixScene(scene: Scene, prefix: string): Scene {
  const ids = new Map<string, string>();
  const gradients = scene.gradients.map(gradient => {
    const id = `${prefix}-${gradient.id}`;
    ids.set(gradient.id, id);
    return {...gradient, id};
  });
  return {
    viewBox: scene.viewBox,
    gradients,
    nodes: scene.nodes.map(node => rewriteNode(node, ids)),
  };
}

export function sceneIssues(scene: Scene): string[] {
  const issues: string[] = [];
  const walk = (node: SceneNode) => {
    for (const value of Object.values(node)) {
      if (typeof value === 'number' && !Number.isFinite(value)) {
        issues.push(`non-finite number on ${node.type}`);
      }
    }
    if (node.type === 'group') {
      node.children.forEach(walk);
    }
  };
  scene.nodes.forEach(walk);
  const seen = new Set<string>();
  for (const gradient of scene.gradients) {
    if (seen.has(gradient.id)) {
      issues.push(`duplicate gradient ${gradient.id}`);
    }
    seen.add(gradient.id);
    if (gradient.stops.length < 2) {
      issues.push(`gradient ${gradient.id} needs two stops`);
    }
  }
  return issues;
}
