import {
  BlurStyle,
  Skia,
  type SkCanvas,
  type SkPaint,
} from '@shopify/react-native-skia';

import type {StampMark, StampPlan} from './types';

function paintMarks(
  canvas: SkCanvas,
  marks: readonly StampMark[],
  paint: SkPaint,
): void {
  for (const mark of marks) {
    const radius = Math.min(mark.radius, mark.width / 2, mark.height / 2);
    const rect = Skia.XYWHRect(mark.x, mark.y, mark.width, mark.height);
    canvas.drawRRect(Skia.RRectXY(rect, radius, radius), paint);
  }
}

/** Draws the amber LCD stamp with a blurred pass underneath so it blooms. */
export function drawStamp(canvas: SkCanvas, plan: StampPlan): void {
  if (plan.marks.length === 0) {
    return;
  }
  const color = Skia.Color(plan.color);
  if (plan.glow > 0 && plan.glowRadius > 0) {
    const glow = Skia.Paint();
    glow.setAntiAlias(true);
    glow.setColor(color);
    glow.setAlphaf(Math.min(1, plan.opacity * 0.7 * Math.max(plan.glow, 0.35)));
    glow.setMaskFilter(
      Skia.MaskFilter.MakeBlur(BlurStyle.Normal, plan.glowRadius, true),
    );
    paintMarks(canvas, plan.marks, glow);
    glow.dispose();
  }
  const core = Skia.Paint();
  core.setAntiAlias(true);
  core.setColor(color);
  core.setAlphaf(plan.opacity);
  paintMarks(canvas, plan.marks, core);
  core.dispose();
}
