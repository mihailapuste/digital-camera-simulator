import React, {useId} from 'react';
import {StyleSheet, View} from 'react-native';
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
