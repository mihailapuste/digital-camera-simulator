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
      capturePhoto: jest.fn(async () => ({
        orientation: 'up',
        isMirrored: false,
        width: 1944,
        height: 2592,
        getFileDataAsync: async () => new Uint8Array([1, 2, 3]).buffer,
        dispose: jest.fn(),
      })),
      capturePhotoToFile: jest.fn(async () => ({
        filePath: '/tmp/photo.jpg',
        width: 100,
        height: 100,
      })),
    }),
    CommonResolutions: {
      QHD_4_3: {width: 1944, height: 2592},
    },
  };
});

jest.mock('@shopify/react-native-skia', () => {
  const React = require('react');
  const {View} = require('react-native');
  const passthrough = ({children}) => React.createElement(View, null, children);
  return {
    Canvas: passthrough,
    Group: passthrough,
    Image: passthrough,
    Fill: passthrough,
    Shader: passthrough,
    Rect: passthrough,
    RoundedRect: passthrough,
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

jest.mock('expo-sharing', () => ({
  isAvailableAsync: jest.fn(async () => true),
  shareAsync: jest.fn(async () => undefined),
}));

jest.mock('react-native-reanimated', () => {
  const {Image, Text, View} = require('react-native');
  const Animated = {
    View,
    Text,
    Image,
    createAnimatedComponent: component => component,
    call: () => {},
  };
  return {
    __esModule: true,
    default: Animated,
    useSharedValue: initial => ({value: initial}),
    useAnimatedStyle: updater => updater(),
    withTiming: toValue => toValue,
    runOnJS: fn => fn,
    Easing: {linear: t => t},
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
  deletePhoto: jest.fn(async () => {}),
  replacePhoto: jest.fn(async uri => ({
    uri,
    name: 'DigiCamSim_1.jpg',
    modifiedAt: 0,
  })),
  saveToDeviceLibrary: jest.fn(async () => 'asset'),
  savePhotosToAlbum: jest.fn(async () => ({
    ok: true,
    assetIds: ['asset'],
    channel: 'album',
  })),
}));

