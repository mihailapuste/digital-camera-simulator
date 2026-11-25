/**
 * Single-pass CCD grade. `sensorScale` is 1 on the already-downsampled bake
 * buffer and the preset value during live preview, so a sensor pixel covers
 * the same fraction of the frame in both places.
 *
 * Written for Skia 2.14 / CanvasKit 0.41 (`shader.eval`, which this app's
 * other shaders already use).
 */
export const CCD_SKSL = `
uniform shader image;

uniform vec2 resolution;
uniform float sensorScale;
uniform float softness;
uniform float saturation;
uniform float temperature;
uniform float contrast;
uniform float highlightClip;
uniform float grain;
uniform float chromaNoise;
uniform float jpegBlock;
uniform float vignette;
uniform float flash;
uniform float mono;
uniform float blackLift;
uniform float seed;
uniform vec3 matrix0;
uniform vec3 matrix1;
uniform vec3 matrix2;

float hash21(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

vec3 evalRgb(vec2 p) {
  return image.eval(p).rgb;
}

half4 main(vec2 pos) {
  vec2 resolutionSafe = max(resolution, vec2(1.0));
  float scale = max(sensorScale, 0.25);
  float cell = 1.0 / scale;
  vec2 snapped = (floor(pos / cell) + 0.5) * cell;
  vec2 samplePos = mix(pos, snapped, 0.82);
  float radius = softness * cell;

  vec3 sampled = evalRgb(samplePos) * 0.36;
  sampled += evalRgb(samplePos + vec2(radius, 0.0)) * 0.12;
  sampled += evalRgb(samplePos + vec2(-radius, 0.0)) * 0.12;
  sampled += evalRgb(samplePos + vec2(0.0, radius)) * 0.12;
  sampled += evalRgb(samplePos + vec2(0.0, -radius)) * 0.12;
  sampled += evalRgb(samplePos + vec2(radius, radius)) * 0.04;
  sampled += evalRgb(samplePos + vec2(-radius, radius)) * 0.04;
  sampled += evalRgb(samplePos + vec2(radius, -radius)) * 0.04;
  sampled += evalRgb(samplePos + vec2(-radius, -radius)) * 0.04;

  float jpeg = clamp(jpegBlock, 0.0, 1.0);
  float blockPx = mix(1.0, 6.0 * cell, jpeg);
  vec2 blockPos = (floor(pos / blockPx) + 0.5) * blockPx;
  sampled = mix(sampled, evalRgb(blockPos), jpeg * 0.72);

  vec3 rgb = vec3(
    dot(sampled, matrix0),
    dot(sampled, matrix1),
    dot(sampled, matrix2)
  );

  rgb = (rgb - vec3(0.5)) * contrast + vec3(0.5);

  rgb.r += temperature * 0.12;
  rgb.b -= temperature * 0.1;
  rgb.g -= abs(temperature) * 0.03;

  float luma = dot(max(rgb, vec3(0.0)), vec3(0.299, 0.587, 0.114));
  rgb = mix(vec3(luma), rgb, saturation);

  float lift = clamp(blackLift, 0.0, 0.2);
  rgb = rgb * (1.0 - lift) + vec3(lift * 0.65);

  float shadow = 1.0 - smoothstep(0.0, 0.42, luma);
  float colorCast = 1.0 - clamp(mono, 0.0, 1.0);
  rgb.r += shadow * 0.05 * colorCast;
  rgb.b += shadow * 0.028 * colorCast;

  vec2 fromCenter = (pos - resolutionSafe * 0.5) / resolutionSafe.y;
  float dist = length(fromCenter);
  float flashAmt = clamp(flash, 0.0, 1.0);
  float mask = smoothstep(1.2, 0.16, dist) * flashAmt;
  float hotspot = exp(-dist * dist * 3.4) * flashAmt;
  // Fill the center without adding a flat white plate on top of skin.
  vec3 lifted = rgb + (vec3(0.9) - rgb) * (mask * 0.4 + hotspot * 0.1);
  float flatLuma = dot(
    clamp(lifted, vec3(0.0), vec3(1.2)),
    vec3(0.299, 0.587, 0.114)
  );
  rgb = mix(lifted, vec3(flatLuma * 0.84 + 0.1), mask * 0.5);
  rgb.r += mask * 0.015;
  rgb.b += mask * 0.028;

  float clipStrength = clamp(highlightClip, 0.0, 1.0);
  rgb *= mix(1.02, 1.3, clipStrength);
  float knee = mix(0.96, 0.68, clipStrength);
  vec3 over = max(rgb - vec3(knee), vec3(0.0));
  float compress = mix(2.4, 0.28, clipStrength);
  rgb = min(rgb, vec3(knee)) + over / (vec3(1.0) + over * compress);
  float peak = max(rgb.r, max(rgb.g, rgb.b));
  float blowStart = mix(0.98, 0.78, clipStrength);
  rgb = mix(rgb, vec3(1.0), smoothstep(blowStart, blowStart + 0.14, peak) * clipStrength);

  float gradedLuma = dot(max(rgb, vec3(0.0)), vec3(0.299, 0.587, 0.114));
  rgb = mix(rgb, vec3(gradedLuma), clamp(mono, 0.0, 1.0));

  float vig = smoothstep(0.92, 0.32, dist);
  rgb *= mix(1.0, vig, clamp(vignette, 0.0, 1.0));

  vec2 noisePos = floor(samplePos / cell);
  float n = hash21(noisePos + vec2(seed, seed * 0.37)) - 0.5;
  float nC = hash21(noisePos + vec2(seed + 19.2, 4.4)) - 0.5;
  float nG = hash21(noisePos + vec2(8.1, seed + 2.2)) - 0.5;
  float noiseLuma = dot(clamp(rgb, vec3(0.0), vec3(1.0)), vec3(0.299, 0.587, 0.114));
  float grainAmt = grain * (0.45 + (1.0 - noiseLuma) * 1.2);
  rgb += vec3(n * grainAmt);
  rgb.r += nC * chromaNoise;
  rgb.b -= nC * chromaNoise * 0.85;
  rgb.g += nG * chromaNoise * 0.4;

  float steps = mix(220.0, 46.0, jpeg);
  rgb = floor(clamp(rgb, vec3(0.0), vec3(1.0)) * steps + 0.5) / steps;

  return half4(rgb.r, rgb.g, rgb.b, 1.0);
}
`;

/** Float uniforms, in the order the bake path packs them when slots are tight. */
export const CCD_UNIFORM_NAMES = [
  'resolution',
  'sensorScale',
  'softness',
  'saturation',
  'temperature',
  'contrast',
  'highlightClip',
  'grain',
  'chromaNoise',
  'jpegBlock',
  'vignette',
  'flash',
  'mono',
  'blackLift',
  'seed',
  'matrix0',
  'matrix1',
  'matrix2',
] as const;

export type CcdUniformName = (typeof CCD_UNIFORM_NAMES)[number];
