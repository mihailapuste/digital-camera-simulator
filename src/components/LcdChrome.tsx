import React, {useId} from 'react';
import {StyleSheet, View} from 'react-native';
import Svg, {Defs, Path, RadialGradient, Rect, Stop} from 'react-native-svg';
import {
  pixelTextHeight,
  pixelTextNodes,
  pixelTextWidth,
} from '../lcd/pixelFont';
import {SceneSvg} from '../skins/SceneSvg';

export function LcdLabel({
  text,
  color,
  scale,
  spoken = true,
}: {
  text: string;
  color: string;
  scale: number;
  spoken?: boolean;
}) {
  const width = pixelTextWidth(text, scale);
  const height = pixelTextHeight(scale);
  return (
    <View
      accessible={spoken}
      accessibilityLabel={spoken ? text : undefined}
      importantForAccessibility={spoken ? 'yes' : 'no-hide-descendants'}
      accessibilityElementsHidden={!spoken}
      style={{width, height}}>
      <SceneSvg
        width={width}
        height={height}
        scene={{
          viewBox: {width, height},
          gradients: [],
          nodes: pixelTextNodes(text, 0, 0, scale, color),
        }}
      />
    </View>
  );
}

export function LcdBackdrop() {
  const id = useId().replace(/[^a-zA-Z0-9]/g, '');
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Svg
        width="100%"
        height="100%"
        viewBox="0 0 100 100"
        preserveAspectRatio="none">
        <Defs>
          <RadialGradient id={id} cx="48%" cy="49%" rx="72%" ry="69%">
            <Stop offset="0" stopColor="#151922" />
            <Stop offset="1" stopColor="#0D1017" />
          </RadialGradient>
        </Defs>
        <Rect width="100" height="100" fill={`url(#${id})`} />
      </Svg>
    </View>
  );
}

export function GearIcon({size, color}: {size: number; color: string}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" accessible={false}>
      <Path
        fill={color}
        fillRule="evenodd"
        d="M10 1h4l.6 3.1 1.4.6 2.7-1.8 2.8 2.8-1.8 2.7.6 1.4 3.1.6v4l-3.1.6-.6 1.4 1.8 2.7-2.8 2.8-2.7-1.8-1.4.6-.6 3.1h-4l-.6-3.1-1.4-.6-2.7 1.8-2.8-2.8 1.8-2.7-.6-1.4-3.1-.6v-4l3.1-.6.6-1.4-1.8-2.7 2.8-2.8L8 4.7l1.4-.6L10 1Zm2 7.4a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z"
      />
    </Svg>
  );
}
