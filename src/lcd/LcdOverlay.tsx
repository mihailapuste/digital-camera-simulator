import React, {useEffect, useState} from 'react';
import {Animated, Pressable, StyleSheet, View} from 'react-native';
import {
  buildFocusBracketScene,
  buildLcdScene,
  lcdHeight,
  shotCounterLayout,
} from './buildLcdScene';
import {formatLcdDate, formatShots} from './format';
import {SceneSvg} from '../skins/SceneSvg';
import {resolveLcdTheme} from './theme';
import {LCD_VIEWBOX, type LcdOverlayProps} from './types';

export const LcdOverlay: React.FC<LcdOverlayProps> = ({
  width = '100%',
  height = '100%',
  theme,
  square = false,
  batteryLevel = 0.75,
  shotsRemaining = 24,
  flashMode = 'auto',
  date,
  focus = 'idle',
  mode = 'live',
  animated = true,
  onOpenPlayback,
}) => {
  const resolved = resolveLcdTheme(theme);
  const [opacity] = useState(() => new Animated.Value(1));
  const [scale] = useState(() => new Animated.Value(1));
  const searching = animated && focus === 'searching' && mode === 'live';

  useEffect(() => {
    if (!searching) {
      opacity.setValue(1);
      return undefined;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.15,
          duration: 240,
          useNativeDriver: false,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 240,
          useNativeDriver: false,
        }),
      ]),
    );
    loop.start();
    return () => {
      loop.stop();
      opacity.setValue(1);
    };
  }, [opacity, searching]);

  useEffect(() => {
    if (focus !== 'locked' || mode !== 'live' || !animated) {
      scale.setValue(1);
      return undefined;
    }
    scale.setValue(1.14);
    const spring = Animated.spring(scale, {
      toValue: 1,
      friction: 6,
      tension: 90,
      useNativeDriver: false,
    });
    spring.start();
    return () => {
      spring.stop();
    };
  }, [animated, focus, mode, scale]);

  const shots = formatShots(shotsRemaining);
  const counter = shotCounterLayout(shots, square);
  const heightUnits = lcdHeight(square);
  const hud = buildLcdScene({
    theme: resolved,
    square,
    batteryLevel,
    shotsRemaining,
    flashMode,
    dateText: formatLcdDate(date),
    focus,
    mode,
    showBrackets: false,
  });
  const brackets = buildFocusBracketScene(
    resolved,
    focus === 'locked' ? 'locked' : 'searching',
    square,
  );
  const batteryBand = batteryLevel <= 0.2 ? 'low' : 'ok';

  return (
    <View
      testID="lcd-overlay"
      pointerEvents="box-none"
      accessibilityLabel={`lcd flash-${flashMode} focus-${focus} mode-${mode} shots-${shots} battery-${batteryBand}`}
      style={[styles.frame, {width, height}]}>
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <SceneSvg scene={hud} width="100%" height="100%" />
      </View>
      {mode === 'live' ? (
        <Animated.View
          testID="lcd-focus-bracket"
          style={[
            styles.brackets,
            {
              opacity: searching ? opacity : 1,
              transform: [{scale}],
            },
          ]}>
          <SceneSvg scene={brackets} width="100%" height="100%" />
        </Animated.View>
      ) : null}
      {onOpenPlayback ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Open playback. Shots remaining ${shots}`}
          testID="lcd-shot-counter"
          onPress={onOpenPlayback}
          style={[
            styles.counter,
            {
              width: `${(100 * (LCD_VIEWBOX.width - counter.x)) / LCD_VIEWBOX.width}%`,
              height: `${(100 * (heightUnits - counter.y)) / heightUnits}%`,
            },
          ]}
        />
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  frame: {
    overflow: 'hidden',
  },
  brackets: {
    ...StyleSheet.absoluteFill,
    pointerEvents: 'none',
  },
  counter: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    minWidth: 44,
    minHeight: 44,
  },
});
