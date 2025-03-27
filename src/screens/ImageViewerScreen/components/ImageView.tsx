import React from 'react';
import {View, StyleSheet, Dimensions} from 'react-native';
import {
  Canvas,
  Image,
  useImage,
  ColorMatrix,
  Rect,
  FractalNoise,
  Skia,
  Shader,
  Fill,
  ImageShader,
} from '@shopify/react-native-skia';

const {width, height} = Dimensions.get('window');

// Pixelation shader
const pixelateShader = Skia.RuntimeEffect.Make(`
uniform vec2 u_resolution;
uniform float u_pixelSize;
uniform shader image;

half4 main(float2 xy) {
  if (u_pixelSize == 0.0) {
    return image.eval(xy);
  }
  vec2 uv = xy / u_resolution;
  vec2 pixelatedUV = floor(uv / u_pixelSize) * u_pixelSize;
  return image.eval(pixelatedUV * u_resolution);
}`)!;

// Sharpen shader
const sharpenShader = Skia.RuntimeEffect.Make(`
uniform shader image;
uniform vec2 u_resolution;
uniform float u_amount;

half4 main(vec2 xy) {
  vec2 texelSize = vec2(1.0) / u_resolution;
  
  // Sample the center and surrounding pixels
  half4 center = image.eval(xy);
  half4 top = image.eval(xy + vec2(0, -1) * texelSize);
  half4 right = image.eval(xy + vec2(1, 0) * texelSize);
  half4 bottom = image.eval(xy + vec2(0, 1) * texelSize);
  half4 left = image.eval(xy + vec2(-1, 0) * texelSize);
  
  // Apply sharpening formula
  half4 sharpened = center * (1.0 + 4.0 * u_amount) - (top + right + bottom + left) * u_amount;
  
  return sharpened;
}`)!;

interface ImageViewProps {
  uri: string;
}

// Old digital camera effect component using Skia
const OldDigitalCameraImage = ({uri}: {uri: string}) => {
  const image = useImage(uri);
  // Set a fixed pixel size for the pixelation effect
  const pixelSize = 0.005; // Fine pixelation level
  const sharpenAmount = 0.2; // Increased sharpening intensity

  if (!image) {
    return <View style={[styles.image, styles.imagePlaceholder]} />;
  }

  return (
    <Canvas style={styles.image}>
      <Fill>
        <Shader
          source={sharpenShader}
          uniforms={{
            u_resolution: [width, height * 0.8],
            u_amount: sharpenAmount,
          }}>
          <ImageShader
            image={image}
            fit="contain"
            rect={{x: 0, y: 0, width: width, height: height * 0.8}}
          />
        </Shader>
      </Fill>
      {/* First, apply the pixelation shader */}
      <Fill>
        <Shader
          source={pixelateShader}
          uniforms={{
            u_resolution: [width, height * 0.8],
            u_pixelSize: pixelSize,
          }}>
          <ImageShader
            image={image}
            fit="contain"
            rect={{x: 0, y: 0, width: width, height: height * 0.8}}
          />
        </Shader>
      </Fill>
      {/* Apply sharpen effect */}

      {/* Apply color matrix for the vintage look with reduced exposure */}
      <Image
        image={image}
        fit="contain"
        x={0}
        y={0}
        width={width}
        height={height * 0.8}
        opacity={0.7}>
        {/* Apply high saturation with reduced exposure for old digital camera look */}
        {/* <ColorMatrix
          matrix={[
            // High saturation with reduced exposure
            1.5,
            0.2,
            0.2,
            0,
            -0.15, // Red channel with more reduced exposure
            0.2,
            1.4,
            0.2,
            0,
            -0.15, // Green channel with more reduced exposure
            0.2,
            0.2,
            1.7,
            0,
            -0.15, // Blue channel with more reduced exposure
            0,
            0,
            0,
            1,
            0, // Alpha unchanged
          ]}
        /> */}
      </Image>
      {/* Add noise overlay */}
      <Rect x={0} y={0} width={width} height={height * 0.8} opacity={0.12}>
        <FractalNoise freqX={0.03} freqY={0.03} octaves={2} />
      </Rect>
    </Canvas>
  );
};

const ImageView: React.FC<ImageViewProps> = ({uri}) => {
  return (
    <View style={styles.imageContainer}>
      <OldDigitalCameraImage uri={uri} />
    </View>
  );
};

const styles = StyleSheet.create({
  imageContainer: {
    width,
    height,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 0,
    marginTop: 0,
  },
  image: {
    flex: 1,
    width,
    height: height * 0.8,
  },
  imagePlaceholder: {
    backgroundColor: '#333',
  },
});

export default ImageView;
