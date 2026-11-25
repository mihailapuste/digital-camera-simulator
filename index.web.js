import 'react-native-gesture-handler';
import {registerRootComponent} from 'expo';
import {LoadSkiaWeb} from '@shopify/react-native-skia/lib/module/web';

// CanvasKit has to be ready before any module that constructs Skia shaders.
LoadSkiaWeb({
  locateFile: file => `/${file}`,
}).then(async () => {
  const {default: App} = await import('./src/App');
  registerRootComponent(App);
});
