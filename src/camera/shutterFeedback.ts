import {Platform, Vibration} from 'react-native';

/** A short tick. The native shutter click itself is the camera's. */
export function triggerShutterHaptic(): void {
  try {
    if (Platform.OS === 'android') {
      Vibration.vibrate(25);
    } else {
      Vibration.vibrate();
    }
  } catch (error) {
    console.error('Shutter haptic failed:', error);
  }
}

export function playShutterClick(): void {
  // Native builds use the camera pipeline's shutter sound.
}
