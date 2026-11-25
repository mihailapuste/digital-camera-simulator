import {useMemo} from 'react';
import {Skia} from '@shopify/react-native-skia';
import {shaderBuilder} from '@/assets/shaders';

export function useGrainyBlurShader() {
  return useMemo(() => {
    // Create a paint with the black and white shader
    const paint = Skia.Paint();
    if (shaderBuilder) {
      const imageFilter = Skia.ImageFilter.MakeRuntimeShader(
        shaderBuilder,
        null,
        null,
      );
      paint.setImageFilter(imageFilter);
    }
    return paint;
  }, []);
}
