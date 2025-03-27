import {Skia} from '@shopify/react-native-skia';

// Create a simple black and white shader
const blackAndWhiteShader = Skia.RuntimeEffect.Make(`
  uniform shader image;

  half4 main(vec2 pos) {
    // Get the color of the image at the current position
    vec4 color = image.eval(pos);
    
    // Convert to grayscale using standard luminance formula
    float gray = dot(color.rgb, vec3(0.299, 0.587, 0.114));
    
    // Return the grayscale color with original alpha
    return vec4(gray, gray, gray, color.a);
  }
`);

if (!blackAndWhiteShader) {
  throw new Error("Couldn't compile the shader");
}

// Create the shader builder
const shaderBuilder = Skia.RuntimeShaderBuilder(blackAndWhiteShader);

// Create a grayscale matrix for black and white effect
export function createGrayscaleColorMatrix() {
  return [
    0.299, 0.587, 0.114, 0, 0, 0.299, 0.587, 0.114, 0, 0, 0.299, 0.587, 0.114,
    0, 0, 0, 0, 0, 1, 0,
  ];
}

// Create a basic paint with grayscale effect
export const createGrayscalePaint = () => {
  const paint = Skia.Paint();
  const grayscaleMatrix = createGrayscaleColorMatrix();
  const colorFilter = Skia.ColorFilter.MakeMatrix(grayscaleMatrix);
  paint.setColorFilter(colorFilter);
  return paint;
};

export {shaderBuilder};
