import React, {useRef, forwardRef, useImperativeHandle} from 'react';
import {View, StyleSheet, Dimensions} from 'react-native';
import {
  Canvas,
  Image,
  useImage,
  Rect,
  FractalNoise,
  Skia,
  Shader,
  Fill,
  ImageShader,
  useCanvasRef,
} from '@shopify/react-native-skia';
import * as RNFS from 'react-native-fs';

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

export interface ImageViewHandle {
  captureFilteredImage: () => Promise<string | null>;
}

interface ImageViewProps {
  uri: string;
}

// Old digital camera effect component using Skia
const OldDigitalCameraImage = forwardRef<ImageViewHandle, {uri: string}>(({uri}, ref) => {
  const image = useImage(uri);
  // Set a fixed pixel size for the pixelation effect
  const pixelSize = 0.004; // Fine pixelation level
  const sharpenAmount = 0.5; // Increased sharpening intensity
  const canvasRef = useCanvasRef();

  // Method to capture the canvas as an image
  const captureFilteredImage = async (): Promise<string | null> => {
    if (!canvasRef.current) {
      console.error('Canvas ref is not available');
      return null;
    }

    try {
      // Create a snapshot of the canvas
      const snapshot = canvasRef.current.makeImageSnapshot();
      if (!snapshot) {
        console.error('Failed to create snapshot');
        return null;
      }

      // Convert to base64
      const data = snapshot.encodeToBase64();
      
      // Create a temporary file path
      const tempFilePath = `${RNFS.CachesDirectoryPath}/filtered_image_${Date.now()}.png`;
      
      // Write the base64 data to a file
      await RNFS.writeFile(tempFilePath, data, 'base64');
      
      console.log('Filtered image saved to:', tempFilePath);
      return tempFilePath;
    } catch (error) {
      console.error('Error capturing filtered image:', error);
      return null;
    }
  };

  useImperativeHandle(ref, () => ({
    captureFilteredImage,
  }));

  if (!image) {
    return <View style={[styles.image, styles.imagePlaceholder]} />;
  }

  return (
    <Canvas ref={canvasRef} style={styles.image}>
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
      </Image>
      {/* Add noise overlay */}
      <Rect x={0} y={0} width={width} height={height * 0.8} opacity={0.12}>
        <FractalNoise freqX={0.03} freqY={0.03} octaves={10} />
      </Rect>
    </Canvas>
  );
});

const ImageView = forwardRef<ImageViewHandle, ImageViewProps>(({uri}, ref) => {
  const imageRef = useRef<ImageViewHandle>(null);

  useImperativeHandle(ref, () => ({
    captureFilteredImage: async () => {
      if (imageRef.current) {
        return imageRef.current.captureFilteredImage();
      }
      return null;
    },
  }));

  return (
    <View style={styles.imageContainer}>
      <OldDigitalCameraImage ref={imageRef} uri={uri} />
    </View>
  );
});

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
