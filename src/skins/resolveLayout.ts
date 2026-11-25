import {
  SKIN_CONTROLS,
  type DesignRect,
  type PixelRect,
  type ResolvedSkinLayout,
  type SkinLayout,
} from './types';
import type {EdgeInsets} from 'react-native-safe-area-context';

function drawnSize(layout: SkinLayout): {width: number; height: number} {
  if (layout.rotation === 90) {
    return {width: layout.viewBox.height, height: layout.viewBox.width};
  }
  return layout.viewBox;
}

/**
 * Design point to viewport pixels. A 90° clockwise turn sends
 * `(x, y)` to `(designHeight - y, x)` before the contain-fit.
 */
export function mapDesignPoint(
  layout: SkinLayout,
  viewport: {width: number; height: number},
  x: number,
  y: number,
): {x: number; y: number} {
  const drawn = drawnSize(layout);
  const scale =
    drawn.width > 0 &&
    drawn.height > 0 &&
    viewport.width > 0 &&
    viewport.height > 0
      ? Math.min(viewport.width / drawn.width, viewport.height / drawn.height)
      : 0;
  const offsetX = (viewport.width - drawn.width * scale) / 2;
  const offsetY = (viewport.height - drawn.height * scale) / 2;
  const rotated =
    layout.rotation === 90 ? {x: layout.viewBox.height - y, y: x} : {x, y};
  return {
    x: offsetX + rotated.x * scale,
    y: offsetY + rotated.y * scale,
  };
}

function mapRect(
  layout: SkinLayout,
  rect: DesignRect,
  scale: number,
  offsetX: number,
  offsetY: number,
): PixelRect {
  if (layout.rotation === 90) {
    const designHeight = layout.viewBox.height;
    return {
      left: offsetX + (designHeight - (rect.y + rect.height)) * scale,
      top: offsetY + rect.x * scale,
      width: rect.height * scale,
      height: rect.width * scale,
    };
  }
  return {
    left: offsetX + rect.x * scale,
    top: offsetY + rect.y * scale,
    width: rect.width * scale,
    height: rect.height * scale,
  };
}

function fitAxis(
  start: number,
  size: number,
  contentStart: number,
  contentEnd: number,
  length: number,
  insetStart: number,
  insetEnd: number,
) {
  const scale = length / size;
  const naturalStart = (contentStart - start) * scale;
  const naturalEnd = (contentEnd - start) * scale;
  // Keep the original edge proportions unless an inset needs extra room.
  const safeStart = Math.max(naturalStart, insetStart);
  const safeEnd = Math.min(naturalEnd, length - insetEnd);
  if (
    safeStart >= safeEnd ||
    (safeStart === naturalStart && safeEnd === naturalEnd)
  ) {
    const band = {start, from: 0, to: length, scale};
    return {bands: [band], content: band};
  }
  const edges = [
    {source: start, target: 0},
    {source: contentStart, target: safeStart},
    {source: contentEnd, target: safeEnd},
    {source: start + size, target: length},
  ];
  const bands = edges.slice(1).map(({source: end, target: to}, index) => {
    const {source: start, target: from} = edges[index];
    return {start, from, to, scale: (to - from) / (end - start)};
  });
  return {bands, content: bands[1]};
}

function resolveFullBleed(
  layout: SkinLayout,
  crop: DesignRect,
  viewport: {width: number; height: number},
  insets: EdgeInsets,
): ResolvedSkinLayout {
  const {width, height} = viewport;
  const drawn = drawnSize(layout);
  const bleed = mapRect(layout, crop, 1, 0, 0);
  const sourceRects = [
    layout.lcd,
    ...SKIN_CONTROLS.map(id => layout.controls[id]),
  ].map(rect => mapRect(layout, rect, 1, 0, 0));
  const horizontal = fitAxis(
    bleed.left,
    bleed.width,
    Math.min(...sourceRects.map(rect => rect.left)),
    Math.max(...sourceRects.map(rect => rect.left + rect.width)),
    width,
    insets.left,
    insets.right,
  );
  const vertical = fitAxis(
    bleed.top,
    bleed.height,
    Math.min(...sourceRects.map(rect => rect.top)),
    Math.max(...sourceRects.map(rect => rect.top + rect.height)),
    height,
    insets.top,
    insets.bottom,
  );
  const centerX = horizontal.content;
  const centerY = vertical.content;
  const offsetX = centerX.from - centerX.start * centerX.scale;
  const offsetY = centerY.from - centerY.start * centerY.scale;
  const place = (rect: PixelRect): PixelRect => ({
    left: offsetX + rect.left * centerX.scale,
    top: offsetY + rect.top * centerY.scale,
    width: rect.width * centerX.scale,
    height: rect.height * centerY.scale,
  });
  const controls = {} as ResolvedSkinLayout['controls'];
  SKIN_CONTROLS.forEach((id, index) => {
    controls[id] = place(sourceRects[index + 1]);
  });
  return {
    scale: Math.min(centerX.scale, centerY.scale),
    offsetX,
    offsetY,
    frame: {left: 0, top: 0, width, height},
    lcd: place(sourceRects[0]),
    controls,
    artworkTiles: vertical.bands.flatMap(y =>
      horizontal.bands.map(x => ({
        clip: {
          left: x.from,
          top: y.from,
          width: x.to - x.from,
          height: y.to - y.from,
        },
        frame: {
          left: -x.start * x.scale,
          top: -y.start * y.scale,
          width: drawn.width * x.scale,
          height: drawn.height * y.scale,
        },
      })),
    ),
  };
}

/** Map the artwork, LCD, and controls through the same viewport layout. */
export function resolveSkinLayout(
  layout: SkinLayout,
  viewport: {width: number; height: number},
  safeArea?: EdgeInsets,
): ResolvedSkinLayout {
  if (safeArea && layout.bleed && viewport.width > 0 && viewport.height > 0) {
    return resolveFullBleed(layout, layout.bleed, viewport, safeArea);
  }
  const drawn = drawnSize(layout);
  const scale =
    drawn.width > 0 &&
    drawn.height > 0 &&
    viewport.width > 0 &&
    viewport.height > 0
      ? Math.min(viewport.width / drawn.width, viewport.height / drawn.height)
      : 0;
  const drawnWidth = drawn.width * scale;
  const drawnHeight = drawn.height * scale;
  const offsetX = (viewport.width - drawnWidth) / 2;
  const offsetY = (viewport.height - drawnHeight) / 2;
  const controls = {} as ResolvedSkinLayout['controls'];
  for (const id of SKIN_CONTROLS) {
    controls[id] = mapRect(
      layout,
      layout.controls[id],
      scale,
      offsetX,
      offsetY,
    );
  }
  return {
    scale,
    offsetX,
    offsetY,
    frame: {
      left: offsetX,
      top: offsetY,
      width: drawnWidth,
      height: drawnHeight,
    },
    lcd: mapRect(layout, layout.lcd, scale, offsetX, offsetY),
    controls,
  };
}

/** Aspect of the skin as drawn, after `rotation`. */
export function skinAspectRatio(layout: SkinLayout): number {
  const drawn = drawnSize(layout);
  return drawn.width / drawn.height;
}

/** Fractions of the viewBox. Use `resolveSkinLayout` when the screen aspect differs. */
export function toNormalizedRect(
  rect: DesignRect,
  viewBox: {width: number; height: number},
): DesignRect {
  return {
    x: rect.x / viewBox.width,
    y: rect.y / viewBox.height,
    width: rect.width / viewBox.width,
    height: rect.height / viewBox.height,
  };
}

function overlaps(a: DesignRect, b: DesignRect): boolean {
  const edge = 0.5;
  return (
    a.x + a.width > b.x + edge &&
    b.x + b.width > a.x + edge &&
    a.y + a.height > b.y + edge &&
    b.y + b.height > a.y + edge
  );
}

export function layoutIssues(layout: SkinLayout): string[] {
  const issues: string[] = [];
  const {width, height} = layout.viewBox;
  const named: [string, DesignRect][] = [
    ['lcd', layout.lcd],
    ...SKIN_CONTROLS.map(
      id => [id, layout.controls[id]] as [string, DesignRect],
    ),
  ];
  for (const [name, rect] of named) {
    if (rect.width <= 0 || rect.height <= 0) {
      issues.push(`${name} has a non-positive size`);
    }
    if (
      rect.x < -0.01 ||
      rect.y < -0.01 ||
      rect.x + rect.width > width + 0.01 ||
      rect.y + rect.height > height + 0.01
    ) {
      issues.push(`${name} sits outside the viewBox`);
    }
    if (name !== 'lcd' && Math.min(rect.width, rect.height) < 44) {
      issues.push(`${name} is smaller than a 44px hit target`);
    }
  }
  if (
    Math.min(layout.controls.shutter.width, layout.controls.shutter.height) <
    100
  ) {
    issues.push('shutter is too small');
  }
  const ratio = layout.lcd.width / layout.lcd.height;
  if (Math.abs(ratio - 4 / 3) > 0.02) {
    issues.push('lcd is not 4:3');
  }
  if ((layout.lcd.width * layout.lcd.height) / (width * height) < 0.12) {
    issues.push('lcd covers less than 12% of the skin');
  }
  for (let i = 0; i < named.length; i += 1) {
    for (let j = i + 1; j < named.length; j += 1) {
      if (overlaps(named[i][1], named[j][1])) {
        issues.push(`${named[i][0]} overlaps ${named[j][0]}`);
      }
    }
  }
  return issues;
}
