import {
  FilterMode,
  ImageFormat,
  MipmapMode,
  Skia,
  TileMode,
  type SkCanvas,
  type SkImage,
  type SkSurface,
} from '@shopify/react-native-skia';

import {resolveStamp} from './dateStamp';
import {drawStamp} from './drawStamp';
import {getCcdRuntimeEffect} from './effect';
import {fitOutputSize, sensorSize} from './frame';
import {resolvePreset} from './presets';
import {planDateStamp} from './segments';
import type {CcdPreset, DateStampOptions} from './types';
import {
  asUniformRecord,
  ccdUniformValues,
  packUniforms,
  stableSeed,
} from './uniforms';

export interface RenderLookOptions {
  /** Decoded SkImage, encoded bytes, or a URI (file, http, blob, or data URL). */
  source: SkImage | string | Uint8Array;
  /** Preset id or a custom plain object. Defaults to CCD Classic. */
  preset?: CcdPreset | string;
  /** `null` or `{enabled: false}` skips the stamp. Omit for the 2004 default. */
  stamp?: DateStampOptions | null;
  /** Longest output edge. The image is never enlarged. Defaults to 1600. */
  maxEdge?: number;
  /** Overrides the preset JPEG quality. Clamped to 1–100. */
  jpegQuality?: number;
  /** Locks the grain pattern. Defaults to a stable hash of the preset id. */
  seed?: number;
  /** Clock for `current` and `retro-year` stamps. Defaults to now. */
  now?: Date;
}

export interface EncodedLook {
  bytes: Uint8Array;
  base64: string;
  /** `data:image/jpeg;base64,...` ready for the web photo library. */
  dataUri: string;
  width: number;
  height: number;
  presetId: string;
  stampText: string | null;
  jpegQuality: number;
}

const DATA_URL = /^data:[^;,]*;base64,([\s\S]+)$/i;

function isSkImage(source: RenderLookOptions['source']): source is SkImage {
  return (
    typeof source === 'object' &&
    source !== null &&
    !(source instanceof Uint8Array) &&
    typeof (source as SkImage).width === 'function' &&
    typeof (source as SkImage).makeShaderOptions === 'function'
  );
}

function makeSurface(width: number, height: number): SkSurface {
  try {
    const gpu = Skia.Surface.MakeOffscreen(width, height);
    if (gpu) {
      return gpu;
    }
  } catch {
    // MakeOffscreen throws when WebGL is unavailable; the CPU surface still encodes.
  }
  const cpu = Skia.Surface.Make(width, height);
  if (!cpu) {
    throw new Error(`Could not allocate a ${width}x${height} surface`);
  }
  return cpu;
}

function clampQuality(value: number): number {
  if (!Number.isFinite(value)) {
    throw new Error('JPEG quality must be a finite number');
  }
  return Math.min(100, Math.max(1, Math.round(value)));
}

async function loadImage(
  source: RenderLookOptions['source'],
): Promise<SkImage> {
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
    throw new Error('Could not decode the source image');
  }
  return image;
}

function drawScaled(
  canvas: SkCanvas,
  image: SkImage,
  width: number,
  height: number,
): void {
  const paint = Skia.Paint();
  paint.setAntiAlias(true);
  canvas.drawImageRectOptions(
    image,
    Skia.XYWHRect(0, 0, image.width(), image.height()),
    Skia.XYWHRect(0, 0, width, height),
    FilterMode.Linear,
    MipmapMode.None,
    paint,
  );
  paint.dispose();
}

function drawGrade(
  canvas: SkCanvas,
  image: SkImage,
  preset: CcdPreset,
  width: number,
  height: number,
  sensorScale: number,
  seed: number,
): void {
  const effect = getCcdRuntimeEffect();
  const uniforms = asUniformRecord(
    ccdUniformValues({
      preset,
      width,
      height,
      sensorScale,
      seed,
    }),
  );
  const imageShader = image.makeShaderOptions(
    TileMode.Clamp,
    TileMode.Clamp,
    FilterMode.Linear,
    MipmapMode.None,
  );
  const shader = effect.makeShaderWithChildren(packUniforms(effect, uniforms), [
    imageShader,
  ]);
  const paint = Skia.Paint();
  paint.setShader(shader);
  canvas.drawPaint(paint);
  paint.dispose();
  shader.dispose();
  imageShader.dispose();
}

function snapshot(surface: SkSurface): SkImage {
  surface.flush();
  const image = surface.makeImageSnapshot();
  if (!image) {
    throw new Error('Skia did not return a snapshot');
  }
  return image;
}

/**
 * Bakes an already-decoded image. Same pixels on native and web: downsample
 * to the sensor size, run the CCD shader, scale back up, then burn the stamp.
 */
export function renderSkImage(
  image: SkImage,
  options: Omit<RenderLookOptions, 'source'> = {},
): EncodedLook {
  const preset = resolvePreset(options.preset);
  const output = fitOutputSize(image.width(), image.height(), options.maxEdge);
  const sensor = sensorSize(output.width, output.height, preset.sensorScale);
  const now = options.now ?? new Date();
  const stamp = resolveStamp(options.stamp, now);
  const quality = clampQuality(options.jpegQuality ?? preset.jpegQuality);
  const seed = options.seed ?? stableSeed(preset.id);
  const disposables: {dispose(): void}[] = [];
  const track = <T extends {dispose(): void}>(value: T): T => {
    disposables.push(value);
    return value;
  };

  try {
    const sensorSurface = track(makeSurface(sensor.width, sensor.height));
    const sensorCanvas = sensorSurface.getCanvas();
    sensorCanvas.clear(Skia.Color('black'));
    drawScaled(sensorCanvas, image, sensor.width, sensor.height);
    const downscaled = track(snapshot(sensorSurface));

    const gradedSurface = track(makeSurface(sensor.width, sensor.height));
    const gradedCanvas = gradedSurface.getCanvas();
    gradedCanvas.clear(Skia.Color('black'));
    drawGrade(
      gradedCanvas,
      downscaled,
      preset,
      sensor.width,
      sensor.height,
      1,
      seed,
    );
    const graded = track(snapshot(gradedSurface));

    const outputSurface = track(makeSurface(output.width, output.height));
    const outputCanvas = outputSurface.getCanvas();
    outputCanvas.clear(Skia.Color('black'));
    drawScaled(outputCanvas, graded, output.width, output.height);
    if (stamp) {
      drawStamp(
        outputCanvas,
        planDateStamp(stamp.text, output.width, output.height, {
          color: stamp.color,
          opacity: stamp.opacity,
          glow: stamp.glow,
        }),
      );
    }
    const finalImage = track(snapshot(outputSurface));
    const bytes = finalImage.encodeToBytes(ImageFormat.JPEG, quality);
    const base64 = finalImage.encodeToBase64(ImageFormat.JPEG, quality);
    if (!bytes || bytes.length === 0 || !base64) {
      throw new Error('JPEG encoding failed');
    }
    return {
      bytes,
      base64,
      dataUri: `data:image/jpeg;base64,${base64}`,
      width: output.width,
      height: output.height,
      presetId: preset.id,
      stampText: stamp ? stamp.text : null,
      jpegQuality: quality,
    };
  } finally {
    for (const item of disposables.reverse()) {
      item.dispose();
    }
  }
}

/** Loads a URI or encoded bytes, then bakes. An SkImage is used as-is. */
export async function renderLook(
  options: RenderLookOptions,
): Promise<EncodedLook> {
  const image = await loadImage(options.source);
  const ownsImage = !isSkImage(options.source);
  try {
    return renderSkImage(image, options);
  } finally {
    if (ownsImage) {
      image.dispose();
    }
  }
}
