import {
  SKIN_CONTROLS,
  type DesignRect,
  type PixelRect,
  type ResolvedSkinLayout,
  type SkinLayout,
} from './types';

function mapRect(
  rect: DesignRect,
  scale: number,
  offsetX: number,
  offsetY: number,
): PixelRect {
  return {
    left: offsetX + rect.x * scale,
    top: offsetY + rect.y * scale,
    width: rect.width * scale,
    height: rect.height * scale,
  };
}

/**
 * Fit the skin inside a viewport the way the SVG `meet` alignment does,
 * then return pixel rects for the LCD and every button.
 */
export function resolveSkinLayout(
  layout: SkinLayout,
  viewport: {width: number; height: number},
): ResolvedSkinLayout {
  const {width: viewWidth, height: viewHeight} = layout.viewBox;
  const scale =
    viewWidth > 0 && viewHeight > 0 && viewport.width > 0 && viewport.height > 0
      ? Math.min(viewport.width / viewWidth, viewport.height / viewHeight)
      : 0;
  const drawnWidth = viewWidth * scale;
  const drawnHeight = viewHeight * scale;
  const offsetX = (viewport.width - drawnWidth) / 2;
  const offsetY = (viewport.height - drawnHeight) / 2;
  const controls = {} as ResolvedSkinLayout['controls'];
  for (const id of SKIN_CONTROLS) {
    controls[id] = mapRect(layout.controls[id], scale, offsetX, offsetY);
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
    lcd: mapRect(layout.lcd, scale, offsetX, offsetY),
    controls,
  };
}

export function skinAspectRatio(layout: SkinLayout): number {
  return layout.viewBox.width / layout.viewBox.height;
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
