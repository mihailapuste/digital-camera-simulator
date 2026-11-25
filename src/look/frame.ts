/** Long edge of a baked photo when the caller does not pass one. */
export const DEFAULT_MAX_EDGE = 1600;

export function evenDimension(value: number): number {
  const rounded = Math.max(2, Math.round(value));
  return rounded % 2 === 0 ? rounded : Math.max(2, rounded - 1);
}

/** Fit inside maxEdge without enlarging, and keep both sides even for JPEG 4:2:0. */
export function fitOutputSize(
  srcWidth: number,
  srcHeight: number,
  maxEdge: number = DEFAULT_MAX_EDGE,
): {width: number; height: number} {
  if (
    !(srcWidth > 0) ||
    !(srcHeight > 0) ||
    !Number.isFinite(srcWidth) ||
    !Number.isFinite(srcHeight)
  ) {
    throw new Error('Source image has no pixels');
  }
  if (!(maxEdge >= 2) || !Number.isFinite(maxEdge)) {
    throw new Error('maxEdge must be at least 2');
  }
  const scale = Math.min(1, maxEdge / Math.max(srcWidth, srcHeight));
  return {
    width: evenDimension(srcWidth * scale),
    height: evenDimension(srcHeight * scale),
  };
}

/** Sensor buffer used before the filtered image is scaled back to the output. */
export function sensorSize(
  outputWidth: number,
  outputHeight: number,
  sensorScale: number,
): {width: number; height: number} {
  const scale = Math.min(1, Math.max(0.2, sensorScale));
  return {
    width: evenDimension(outputWidth * scale),
    height: evenDimension(outputHeight * scale),
  };
}

export function containRect(
  srcWidth: number,
  srcHeight: number,
  dstWidth: number,
  dstHeight: number,
): {x: number; y: number; width: number; height: number} {
  if (
    !(srcWidth > 0) ||
    !(srcHeight > 0) ||
    !(dstWidth > 0) ||
    !(dstHeight > 0)
  ) {
    throw new Error('containRect needs positive dimensions');
  }
  const scale = Math.min(dstWidth / srcWidth, dstHeight / srcHeight);
  const width = srcWidth * scale;
  const height = srcHeight * scale;
  return {
    x: (dstWidth - width) / 2,
    y: (dstHeight - height) / 2,
    width,
    height,
  };
}
