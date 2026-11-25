import {useMemo} from 'react';
import {
  BlurMask,
  Canvas,
  Group,
  ImageShader,
  Paint,
  Rect,
  RoundedRect,
  Shader,
  useImage,
  type SkImage,
} from '@shopify/react-native-skia';

import {containRect} from './frame';
import type {StampPlan} from './types';
import {useLookPreview, type UseLookPreviewArgs} from './useLookPreview';

export interface LookPreviewProps extends Omit<
  UseLookPreviewArgs,
  'width' | 'height'
> {
  /** SkImage, or a URI `useImage` can load (file, http, blob, or data URL). */
  source: SkImage | string | null;
  width: number;
  height: number;
  /** `cover` fills the view. `contain` letterboxes and keeps the stamp on the photo. */
  fit?: 'cover' | 'contain';
}

function StampMarks({plan, prefix}: {plan: StampPlan; prefix: string}) {
  return plan.marks.map((mark, index) => (
    <RoundedRect
      key={`${prefix}-${mark.x}-${mark.y}-${index}`}
      x={mark.x}
      y={mark.y}
      width={mark.width}
      height={mark.height}
      r={Math.min(mark.radius, mark.width / 2, mark.height / 2)}
      color={plan.color}
    />
  ));
}

function StampOverlay({plan}: {plan: StampPlan}) {
  return (
    <>
      {plan.glowRadius > 0 ? (
        <Group
          opacity={Math.min(1, plan.opacity * 0.7 * Math.max(plan.glow, 0.35))}
          layer={
            <Paint>
              <BlurMask blur={plan.glowRadius} style="normal" respectCTM />
            </Paint>
          }>
          <StampMarks plan={plan} prefix="glow" />
        </Group>
      ) : null}
      <Group opacity={plan.opacity}>
        <StampMarks plan={plan} prefix="core" />
      </Group>
    </>
  );
}

/**
 * GPU preview of a preset. Mount this only after Skia is ready — on web,
 * after `LoadSkiaWeb` resolves (the app's `index.web.js` already does that
 * before it loads the root component).
 */
export function LookPreview({
  source,
  width,
  height,
  fit = 'cover',
  preset,
  stamp,
  seed,
  now,
}: LookPreviewProps) {
  const uri = typeof source === 'string' ? source : null;
  const loaded = useImage(uri);
  const image = typeof source === 'string' || source == null ? loaded : source;
  const content = useMemo(() => {
    if (!image || fit !== 'contain') {
      return {x: 0, y: 0, width, height};
    }
    return containRect(image.width(), image.height(), width, height);
  }, [image, fit, width, height]);
  const look = useLookPreview({
    preset,
    width: content.width,
    height: content.height,
    stamp,
    seed,
    now,
  });

  if (
    !image ||
    width < 2 ||
    height < 2 ||
    content.width < 2 ||
    content.height < 2
  ) {
    return null;
  }

  return (
    <Canvas style={{width, height}}>
      <Group transform={[{translateX: content.x}, {translateY: content.y}]}>
        <Rect x={0} y={0} width={content.width} height={content.height}>
          <Shader source={look.effect} uniforms={look.uniforms}>
            <ImageShader
              image={image}
              fit={fit === 'contain' ? 'fill' : 'cover'}
              tx="clamp"
              ty="clamp"
              rect={{
                x: 0,
                y: 0,
                width: content.width,
                height: content.height,
              }}
            />
          </Shader>
        </Rect>
        {look.stampPlan ? <StampOverlay plan={look.stampPlan} /> : null}
      </Group>
    </Canvas>
  );
}
