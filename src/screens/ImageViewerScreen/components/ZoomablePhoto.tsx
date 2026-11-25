import React, {useEffect} from 'react';
import {StyleSheet} from 'react-native';
import {Image} from 'expo-image';
import {Gesture, GestureDetector} from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

const MIN_SCALE = 1;
const MAX_SCALE = 4;

type Props = {
  uri: string;
  cacheKey: string;
  width: number;
  height: number;
  active: boolean;
  onZoomedChange: (zoomed: boolean) => void;
};

const ZoomablePhoto: React.FC<Props> = ({
  uri,
  cacheKey,
  width,
  height,
  active,
  onZoomedChange,
}) => {
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedX = useSharedValue(0);
  const savedY = useSharedValue(0);

  const report = (zoomed: boolean) => {
    if (active) {
      onZoomedChange(zoomed);
    }
  };

  useEffect(() => {
    if (active) {
      onZoomedChange(savedScale.value > 1.02);
    }
  }, [active, onZoomedChange, savedScale]);

  const reset = () => {
    'worklet';
    scale.value = withTiming(1);
    translateX.value = withTiming(0);
    translateY.value = withTiming(0);
    savedScale.value = 1;
    savedX.value = 0;
    savedY.value = 0;
    runOnJS(report)(false);
  };

  const pinch = Gesture.Pinch()
    .onBegin(() => {
      runOnJS(report)(true);
    })
    .onUpdate(event => {
      const next = savedScale.value * event.scale;
      scale.value = Math.min(MAX_SCALE, Math.max(MIN_SCALE, next));
    })
    .onEnd(() => {
      if (scale.value <= 1.02) {
        reset();
        return;
      }
      savedScale.value = scale.value;
      runOnJS(report)(true);
    });

  const pan = Gesture.Pan()
    .manualActivation(true)
    .onTouchesMove((_event, state) => {
      if (scale.value > 1.02) {
        state.activate();
      } else {
        state.fail();
      }
    })
    .onUpdate(event => {
      translateX.value = savedX.value + event.translationX;
      translateY.value = savedY.value + event.translationY;
    })
    .onEnd(() => {
      savedX.value = translateX.value;
      savedY.value = translateY.value;
    });

  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .maxDistance(24)
    .onEnd(() => {
      if (scale.value > 1.02) {
        reset();
        return;
      }
      scale.value = withTiming(2.5);
      savedScale.value = 2.5;
      runOnJS(report)(true);
    });

  const gesture = Gesture.Simultaneous(pinch, pan, doubleTap);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      {translateX: translateX.value},
      {translateY: translateY.value},
      {scale: scale.value},
    ],
  }));

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={[{width, height}, styles.frame, animatedStyle]}>
        <Image
          source={{uri, cacheKey}}
          style={{width, height}}
          contentFit="contain"
          transition={80}
          accessibilityLabel="Photo"
        />
      </Animated.View>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  frame: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ZoomablePhoto;
