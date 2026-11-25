import type {ViewStyle} from 'react-native';

/** Center a quarter-turned surface inside its unrotated viewport. */
export function sidewaysFrame(width: number, height: number, clockwise = true) {
  return {
    position: 'absolute',
    width: height,
    height: width,
    left: (width - height) / 2,
    top: (height - width) / 2,
    transform: [{rotate: clockwise ? '90deg' : '-90deg'}],
  } satisfies ViewStyle;
}
