import {
  fmt,
  type Scene,
  type SceneGradient,
  type SceneNode,
} from './sceneModel';

function escapeAttr(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;');
}

function attr(name: string, value: string | number | undefined): string | null {
  if (value === undefined) {
    return null;
  }
  const text = typeof value === 'number' ? fmt(value) : escapeAttr(value);
  return `${name}="${text}"`;
}

function paintAttrs(node: Exclude<SceneNode, {type: 'group'}>): string[] {
  return [
    attr('fill', node.fill ?? 'none'),
    attr('stroke', node.stroke),
    node.stroke !== undefined ? attr('stroke-width', node.strokeWidth) : null,
    attr('stroke-linecap', node.strokeLinecap),
    attr('stroke-linejoin', node.strokeLinejoin),
    attr('fill-rule', node.fillRule),
    attr('opacity', node.opacity),
  ].filter((entry): entry is string => entry !== null);
}

function openTag(
  name: string,
  attrs: (string | null)[],
  indent: string,
): string {
  const body = attrs
    .filter((entry): entry is string => entry !== null)
    .join(' ');
  return `${indent}<${name}${body ? ` ${body}` : ''}/>`;
}

function nodeToSvg(node: SceneNode, depth: number): string {
  const indent = '  '.repeat(depth);
  if (node.type === 'group') {
    const attrs = [
      attr('opacity', node.opacity),
      attr('transform', node.transform),
    ].filter((entry): entry is string => entry !== null);
    const open = attrs.length ? `<g ${attrs.join(' ')}>` : '<g>';
    const children = node.children
      .map(child => nodeToSvg(child, depth + 1))
      .join('\n');
    return `${indent}${open}\n${children}\n${indent}</g>`;
  }
  if (node.type === 'rect') {
    return openTag(
      'rect',
      [
        attr('x', node.x),
        attr('y', node.y),
        attr('width', node.width),
        attr('height', node.height),
        attr('rx', node.rx),
        attr('ry', node.ry),
        ...paintAttrs(node),
      ],
      indent,
    );
  }
  if (node.type === 'circle') {
    return openTag(
      'circle',
      [
        attr('cx', node.cx),
        attr('cy', node.cy),
        attr('r', node.r),
        ...paintAttrs(node),
      ],
      indent,
    );
  }
  if (node.type === 'ellipse') {
    return openTag(
      'ellipse',
      [
        attr('cx', node.cx),
        attr('cy', node.cy),
        attr('rx', node.rx),
        attr('ry', node.ry),
        ...paintAttrs(node),
      ],
      indent,
    );
  }
  if (node.type === 'path') {
    return openTag('path', [attr('d', node.d), ...paintAttrs(node)], indent);
  }
  if (node.type === 'line') {
    return openTag(
      'line',
      [
        attr('x1', node.x1),
        attr('y1', node.y1),
        attr('x2', node.x2),
        attr('y2', node.y2),
        ...paintAttrs(node),
      ],
      indent,
    );
  }
  return openTag(
    'polygon',
    [attr('points', node.points), ...paintAttrs(node)],
    indent,
  );
}

function gradientToSvg(gradient: SceneGradient, indent: string): string {
  const stops = gradient.stops
    .map(stop => {
      const attrs = [
        attr('offset', stop.offset),
        attr('stop-color', stop.color),
        attr('stop-opacity', stop.opacity),
      ].filter((entry): entry is string => entry !== null);
      return `${indent}  <stop ${attrs.join(' ')}/>`;
    })
    .join('\n');
  if (gradient.kind === 'linear') {
    const attrs = [
      attr('id', gradient.id),
      attr('gradientUnits', gradient.units),
      attr('x1', gradient.x1 ?? 0),
      attr('y1', gradient.y1 ?? 0),
      attr('x2', gradient.x2 ?? 0),
      attr('y2', gradient.y2 ?? 1),
    ].filter((entry): entry is string => entry !== null);
    return `${indent}<linearGradient ${attrs.join(' ')}>\n${stops}\n${indent}</linearGradient>`;
  }
  const attrs = [
    attr('id', gradient.id),
    attr('gradientUnits', gradient.units),
    attr('cx', gradient.cx ?? 0.5),
    attr('cy', gradient.cy ?? 0.5),
    attr('r', gradient.r ?? 0.5),
    attr('fx', gradient.fx),
    attr('fy', gradient.fy),
  ].filter((entry): entry is string => entry !== null);
  return `${indent}<radialGradient ${attrs.join(' ')}>\n${stops}\n${indent}</radialGradient>`;
}

export function sceneToSvg(scene: Scene): string {
  const {width, height} = scene.viewBox;
  const defs =
    scene.gradients.length === 0
      ? ''
      : `  <defs>\n${scene.gradients
          .map(gradient => gradientToSvg(gradient, '    '))
          .join('\n')}\n  </defs>\n`;
  const body = scene.nodes.map(node => nodeToSvg(node, 1)).join('\n');
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${fmt(width)} ${fmt(height)}" width="${fmt(width)}" height="${fmt(height)}">`,
    defs + body,
    '</svg>',
    '',
  ].join('\n');
}
