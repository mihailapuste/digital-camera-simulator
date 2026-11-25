import {
  FilterMode,
  MipmapMode,
  Skia,
  type SkCanvas,
  type SkImage,
  type SkSurface,
} from '@shopify/react-native-skia';

/**
 * How a Vision Camera buffer sits relative to an upright portrait phone.
 * `'right'` means the pixels are already turned 90° clockwise from upright.
 */
export type CaptureOrientation = 'up' | 'right' | 'down' | 'left';

export type CropRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

const DATA_URL = /^data:[^;,]*;base64,([\s\S]+)$/i;

/** Clockwise quarter-turns that stand the buffer up on a portrait phone. */
export function uprightQuarterTurns(
  orientation: CaptureOrientation | undefined,
): 0 | 1 | 2 | 3 {
  switch (orientation) {
    case 'left':
      return 1;
    case 'down':
      return 2;
    case 'right':
      return 3;
    default:
      return 0;
  }
}

export function orientedSize(
  width: number,
  height: number,
  quarterTurns: 0 | 1 | 2 | 3,
): {width: number; height: number} {
  if (quarterTurns % 2 === 1) {
    return {width: height, height: width};
  }
  return {width, height};
}

function evenFloor(value: number, limit: number): number {
  const capped = Math.min(limit, Math.floor(value));
  const even = capped - (capped % 2);
  return Math.max(2, even);
}

/**
 * Center-crop to landscape 4:3. A portrait 3:4 buffer keeps its full width
 * and loses equal bands at the top and bottom, which is the band the
 * sideways LCD shows.
 */
export function landscapeCropRect(width: number, height: number): CropRect {
  if (!(width >= 2) || !(height >= 2)) {
    throw new Error('Cannot frame an image with no pixels');
  }
  const target = 4 / 3;
  const aspect = width / height;
  const cropW =
    aspect > target ? evenFloor(height * target, width) : evenFloor(width, width);
  const cropH =
    aspect > target ? evenFloor(height, height) : evenFloor(width / target, height);
  return {
    x: Math.max(0, Math.floor((width - cropW) / 2)),
    y: Math.max(0, Math.floor((height - cropH) / 2)),
    width: cropW,
    height: cropH,
  };
}

function makeSurface(width: number, height: number): SkSurface {
  try {
    const gpu = Skia.Surface.MakeOffscreen(width, height);
    if (gpu) {
      return gpu;
    }
  } catch {
    // CPU surface still encodes when WebGL is missing.
  }
  const cpu = Skia.Surface.Make(width, height);
  if (!cpu) {
    throw new Error(`Could not allocate a ${width}x${height} surface`);
  }
  return cpu;
}

function isSkImage(source: unknown): source is SkImage {
  return (
    typeof source === 'object' &&
    source !== null &&
    !(source instanceof Uint8Array) &&
    typeof (source as SkImage).width === 'function'
  );
}

async function decode(source: SkImage | string | Uint8Array): Promise<SkImage> {
  if (isSkImage(source)) {
    return source;
  }
  const encoded =
    source instanceof Uint8Array
      ? Skia.Data.fromBytes(source)
      : DATA_URL.test(source)
        ? Skia.Data.fromBase64(
            source.replace(/^data:[^;,]*;base64,/i, '').replace(/\s/g, ''),
          )
        : await Skia.Data.fromURI(
            source.startsWith('/') ? `file://${source}` : source,
          );
  const image = Skia.Image.MakeImageFromEncoded(encoded);
  if (!image) {
    throw new Error('Could not decode the captured photo');
  }
  return image;
}

function drawUpright(
  canvas: SkCanvas,
  image: SkImage,
  quarterTurns: 0 | 1 | 2 | 3,
): void {
  const width = image.width();
  const height = image.height();
  canvas.save();
  if (quarterTurns === 1) {
    canvas.translate(height, 0);
    canvas.rotate(90, 0, 0);
  } else if (quarterTurns === 2) {
    canvas.translate(width, height);
    canvas.rotate(180, 0, 0);
  } else if (quarterTurns === 3) {
    canvas.translate(0, width);
    canvas.rotate(270, 0, 0);
  }
  canvas.drawImage(image, 0, 0);
  canvas.restore();
}

function snapshot(surface: SkSurface): SkImage {
  surface.flush();
  const image = surface.makeImageSnapshot();
  if (!image) {
    throw new Error('Skia did not return a framed photo');
  }
  return image;
}

/**
 * Stand the capture up, then crop the center to landscape 4:3.
 * The result is what the sideways LCD is showing once you tilt your head:
 * world-up at the top of a wide frame. The plate that holds this image is
 * rotated 90° clockwise on the phone, so the long edge runs the length of
 * the on-screen LCD.
 */
export async function frameCapture(options: {
  source: SkImage | string | Uint8Array;
  orientation?: CaptureOrientation;
}): Promise<SkImage> {
  const decoded = await decode(options.source);
  const ownsDecoded = !isSkImage(options.source);
  const turns = uprightQuarterTurns(options.orientation);
  const upright = orientedSize(decoded.width(), decoded.height(), turns);
  const crop = landscapeCropRect(upright.width, upright.height);
  const trash: {dispose(): void}[] = [];
  let result: SkImage | null = null;
  try {
    let uprightImage = decoded;
    if (turns !== 0) {
      const surface = makeSurface(upright.width, upright.height);
      trash.push(surface);
      const canvas = surface.getCanvas();
      canvas.clear(Skia.Color('black'));
      drawUpright(canvas, decoded, turns);
      uprightImage = snapshot(surface);
      trash.push(uprightImage);
    }
    const fullFrame =
      crop.x === 0 &&
      crop.y === 0 &&
      crop.width === uprightImage.width() &&
      crop.height === uprightImage.height();
    if (fullFrame) {
      result = uprightImage;
      return result;
    }
    const framedSurface = makeSurface(crop.width, crop.height);
    trash.push(framedSurface);
    const paint = Skia.Paint();
    framedSurface
      .getCanvas()
      .drawImageRectOptions(
        uprightImage,
        Skia.XYWHRect(crop.x, crop.y, crop.width, crop.height),
        Skia.XYWHRect(0, 0, crop.width, crop.height),
        FilterMode.Linear,
        MipmapMode.None,
        paint,
      );
    paint.dispose();
    result = snapshot(framedSurface);
    return result;
  } finally {
    if (ownsDecoded && decoded !== result) {
      decoded.dispose();
    }
    for (const item of trash) {
      if (item !== result) {
        item.dispose();
      }
    }
  }
}
