import React, {useId} from 'react';
import {
  Pressable,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import Svg, {Defs, LinearGradient, Path, Rect, Stop} from 'react-native-svg';

const grain = Array.from({length: 100}, (_, index) => {
  const x = ((index * 71) % 120) - 100;
  return `M${x} ${index + 0.5}h${280 + ((index * 131) % 260)}`;
}).join(' ');

export function MetalPanel() {
  const gradient = useId().replace(/[^a-zA-Z0-9]/g, '');
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Svg
        width="100%"
        height="100%"
        viewBox="0 0 400 100"
        preserveAspectRatio="none">
        <Defs>
          <LinearGradient id={gradient} x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#EDE4D8" />
            <Stop offset="0.47" stopColor="#D5C9BD" />
            <Stop offset="1" stopColor="#F3EADC" />
          </LinearGradient>
        </Defs>
        <Rect width="400" height="100" fill={`url(#${gradient})`} />
        <Path d={grain} stroke="#7F6E5B" strokeWidth="0.4" opacity={0.19} />
        <Path d="M0 1H400" stroke="#FFF9EF" strokeWidth="1.4" />
        <Path d="M0 3H400" stroke="#9D8D7E" strokeWidth="0.5" />
      </Svg>
    </View>
  );
}

export function MetalKey({
  label,
  onPress,
  style,
  children,
}: {
  label: string;
  onPress: () => void;
  style: StyleProp<ViewStyle>;
  children: React.ReactNode;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({pressed}) => [styles.key, style, pressed && styles.pressed]}>
      <KeySurface />
      {children}
    </Pressable>
  );
}

function KeySurface() {
  const id = useId().replace(/[^a-zA-Z0-9]/g, '');
  return (
    <View pointerEvents="none" style={styles.keySurface}>
      <Svg width="100%" height="100%">
        <Defs>
          <LinearGradient id={id} x2="0" y2="1">
            <Stop offset="0" stopColor="#F5EBDF" />
            <Stop offset="0.55" stopColor="#DED3C7" />
            <Stop offset="1" stopColor="#BEB0A0" />
          </LinearGradient>
        </Defs>
        <Rect width="100%" height="100%" fill={`url(#${id})`} />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  key: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 30,
    borderColor: '#4C4135',
    borderWidth: 1.5,
    backgroundColor: '#9F9181',
    shadowColor: '#211C17',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.5,
    shadowRadius: 2.5,
    elevation: 4,
  },
  keySurface: {
    position: 'absolute',
    left: 1.5,
    right: 1.5,
    top: 1.5,
    bottom: 1.5,
    borderRadius: 28,
    borderWidth: 1.5,
    borderColor: '#FFF4E5',
    borderBottomColor: '#9D8E7C',
    overflow: 'hidden',
  },
  pressed: {opacity: 0.8},
});
