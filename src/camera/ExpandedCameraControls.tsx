import React, {useId} from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Svg, {
  Circle,
  Defs,
  LinearGradient,
  Path,
  Rect,
  Stop,
} from 'react-native-svg';
import {MetalPanel} from '../components/MetalPanel';

type Action = 'body' | 'shutter' | 'playback';

const LABELS = {
  body: 'Camera body',
  shutter: 'Shutter',
  playback: 'Playback',
} satisfies Record<Action, string>;

type ExpandedCameraControlsProps = {
  barHeight: number;
  zoom: number;
  onBarLayout: (height: number) => void;
  onClose: () => void;
  onPresets: () => void;
  onShutter: () => void;
  onPlayback: () => void;
  onZoomOut: () => void;
  onZoomIn: () => void;
  shutterDisabled: boolean;
};

export function ExpandedCameraControls({
  barHeight,
  zoom,
  onBarLayout,
  onClose,
  onPresets,
  onShutter,
  onPlayback,
  onZoomOut,
  onZoomIn,
  shutterDisabled,
}: ExpandedCameraControlsProps) {
  const insets = useSafeAreaInsets();

  return (
    <>
      <View
        testID="expanded-zoom"
        style={[
          styles.rocker,
          {right: insets.right + 12, bottom: barHeight + 18},
        ]}>
        <ZoomKey letter="W" label="Zoom out" zoom={zoom} onPress={onZoomOut} />
        <View style={styles.divider} />
        <ZoomKey letter="T" label="Zoom in" zoom={zoom} onPress={onZoomIn} />
      </View>
      <View
        testID="expanded-viewfinder-controls"
        onLayout={event => onBarLayout(event.nativeEvent.layout.height)}
        style={[
          styles.bar,
          {
            paddingLeft: insets.left + 16,
            paddingRight: insets.right + 16,
            paddingBottom: Math.max(8, insets.bottom),
          },
        ]}>
        <MetalPanel />
        <View style={styles.actions}>
          <MetalButton action="body" onPress={onClose} onPresets={onPresets} />
          <MetalButton
            action="shutter"
            onPress={onShutter}
            disabled={shutterDisabled}
          />
          <MetalButton action="playback" onPress={onPlayback} />
        </View>
      </View>
    </>
  );
}

function ZoomKey({
  letter,
  label,
  zoom,
  onPress,
}: {
  letter: string;
  label: string;
  zoom: number;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityValue={{text: `${zoom}×`}}
      onPress={onPress}
      style={({pressed}) => [styles.zoomKey, pressed && styles.zoomPressed]}>
      <Text style={styles.zoomLabel} allowFontScaling={false}>
        {letter}
      </Text>
    </Pressable>
  );
}

function MetalButton({
  action,
  onPress,
  onPresets,
  disabled,
}: {
  action: Action;
  onPress: () => void;
  onPresets?: () => void;
  disabled?: boolean;
}) {
  const primary = action === 'shutter';
  const label = LABELS[action];
  const id = useId().replace(/[^a-zA-Z0-9]/g, '');
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={
        onPresets ? 'Long press to open camera presets' : undefined
      }
      accessibilityActions={
        onPresets ? [{name: 'presets', label: 'Camera presets'}] : undefined
      }
      onAccessibilityAction={event => {
        if (event.nativeEvent.actionName === 'presets') {
          onPresets?.();
        }
      }}
      disabled={disabled}
      onPress={onPress}
      onLongPress={onPresets}
      style={({pressed}) => [
        styles.key,
        primary && styles.shutter,
        pressed && styles.keyPressed,
      ]}>
      <Svg width="100%" height="100%" viewBox="0 0 80 80" accessible={false}>
        <Defs>
          <LinearGradient id={`edge-${id}`} x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#FCF7EE" />
            <Stop offset="0.34" stopColor="#807468" />
            <Stop offset="0.7" stopColor="#332C24" />
            <Stop offset="1" stopColor="#FDF5EB" />
          </LinearGradient>
          <LinearGradient id={`face-${id}`} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#F3EADF" />
            <Stop offset="0.6" stopColor="#D6CBBE" />
            <Stop offset="1" stopColor="#BBB0A3" />
          </LinearGradient>
        </Defs>
        <Circle cx="40" cy="42" r="37.5" fill="#4C3B2A" opacity={0.24} />
        <Circle
          cx="40"
          cy="39"
          r="36.5"
          fill={`url(#edge-${id})`}
          stroke="#4D443A"
          strokeWidth="1"
        />
        <Circle
          cx="40"
          cy="39"
          r={primary ? 33.5 : 34.5}
          fill={`url(#face-${id})`}
          stroke="#FFF9F0"
          strokeWidth={primary ? 2.6 : 1.8}
        />
        {primary ? (
          <>
            <Circle
              cx="40"
              cy="39"
              r="30.5"
              fill="none"
              stroke="#A99E91"
              strokeWidth="1"
            />
            <Path
              d="M39 27h5l2.6 4H50a3 3 0 0 1 3 3v13a3 3 0 0 1-3 3H30a3 3 0 0 1-3-3V34a3 3 0 0 1 3-3h4l2.6-4Z"
              fill={disabled ? '#AA6864' : '#C52D27'}
            />
            <Circle cx="40" cy="40" r="5.6" fill="#FFF8F4" />
            <Circle cx="49" cy="34.5" r="0.9" fill="#FFF8F4" />
          </>
        ) : action === 'body' ? (
          <>
            <Rect
              x="21"
              y="27"
              width="38"
              height="25"
              rx="2.5"
              fill="#3A3631"
            />
            <Rect
              x="26"
              y="31"
              width="20"
              height="16"
              rx="0.6"
              fill="#E5DACD"
            />
            <Path
              d="M24 27v-3h6"
              fill="none"
              stroke="#3A3631"
              strokeWidth="2"
            />
            <Circle cx="52.5" cy="34" r="2.1" fill="#E5DACD" />
            <Circle cx="52.5" cy="42.5" r="2.1" fill="#E5DACD" />
          </>
        ) : (
          <Path
            d="M32 27a2 2 0 0 1 3-1.7l19 12a2 2 0 0 1 0 3.4l-19 12A2 2 0 0 1 32 51Z"
            fill="#087DBD"
            stroke="#166A99"
            strokeWidth="0.75"
          />
        )}
      </Svg>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  rocker: {
    position: 'absolute',
    width: 44,
    height: 172,
    borderRadius: 24,
    borderWidth: 1.2,
    borderColor: 'rgba(248, 249, 249, 0.78)',
    backgroundColor: 'rgba(26, 37, 51, 0.38)',
    overflow: 'hidden',
  },
  zoomKey: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  zoomPressed: {backgroundColor: 'rgba(250, 247, 240, 0.22)'},
  zoomLabel: {fontSize: 17, color: '#FFF', fontWeight: '600'},
  divider: {height: StyleSheet.hairlineWidth, backgroundColor: '#DEE3E9'},
  bar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    paddingTop: 4,
    backgroundColor: '#DCD0C4',
  },
  actions: {
    width: '100%',
    maxWidth: 400,
    height: 82,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
  },
  key: {width: 64, height: 64},
  shutter: {width: 82, height: 82},
  keyPressed: {transform: [{scale: 0.94}]},
});
