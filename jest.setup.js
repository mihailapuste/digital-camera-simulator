jest.mock('react-native-vision-camera', () => {
  const React = require('react');
  const {View} = require('react-native');
  return {
    Camera: props => React.createElement(View, props),
    useCameraDevice: () => ({id: 'back'}),
    useCameraPermission: () => ({
      hasPermission: true,
      requestPermission: jest.fn(async () => true),
    }),
    usePhotoOutput: () => ({
      capturePhotoToFile: jest.fn(async () => ({
        filePath: '/tmp/photo.jpg',
        width: 100,
        height: 100,
      })),
    }),
  };
});

jest.mock('@shopify/react-native-skia', () => {
  const React = require('react');
  const {View} = require('react-native');
  const passthrough = ({children}) => React.createElement(View, null, children);
  return {
    Canvas: passthrough,
    Image: passthrough,
    Fill: passthrough,
    Shader: passthrough,
    Rect: passthrough,
    FractalNoise: passthrough,
    ImageShader: passthrough,
    useImage: () => null,
    useCanvasRef: () => ({current: null}),
    Skia: {
      RuntimeEffect: {Make: () => ({})},
      RuntimeShaderBuilder: () => ({}),
      Paint: function Paint() {
        return {setImageFilter() {}, setColorFilter() {}};
      },
      ImageFilter: {MakeRuntimeShader: () => ({})},
      ColorFilter: {MakeMatrix: () => ({})},
    },
  };
});

jest.mock('./src/services/photoLibrary', () => ({
  listPhotos: jest.fn(async () => []),
  importFile: jest.fn(async () => ({
    uri: 'file:///photo.jpg',
    name: 'DigiCamSim_1.jpg',
    modifiedAt: 0,
  })),
  importDataUrl: jest.fn(async () => ({
    uri: 'data:image/jpeg;base64,aa',
    name: 'DigiCamSim_1.jpg',
    modifiedAt: 0,
  })),
  writeBase64: jest.fn(async () => 'file:///filtered.png'),
  deletePhoto: jest.fn(async () => {}),
  saveToDeviceLibrary: jest.fn(async () => 'asset'),
}));

jest.mock('./src/components/cameraSkins/PowerShotSD1000Skin', () => {
  const React = require('react');
  const {View} = require('react-native');
  function PowerShotSD1000Skin() {
    return React.createElement(View, null);
  }
  return PowerShotSD1000Skin;
});

jest.mock('./src/components/cameraSkins/RotatedPowerShotSD1000Skin', () => {
  const React = require('react');
  const {View} = require('react-native');
  function RotatedPowerShotSD1000Skin() {
    return React.createElement(View, null);
  }
  return RotatedPowerShotSD1000Skin;
});
