import React, {useId} from 'react';
import {Pressable, StyleSheet, View} from 'react-native';
import Svg, {
  Circle,
  Defs,
  LinearGradient,
  Path,
  RadialGradient,
  Rect,
  Stop,
} from 'react-native-svg';
import {MetalPanel} from '../components/MetalPanel';
import {
  pixelTextHeight,
  pixelTextNodes,
  pixelTextWidth,
} from '../lcd/pixelFont';
import {SceneSvg} from '../skins/SceneSvg';

const INK = '#41403B';
const AMBER = '#FF9D14';

export function PlaybackLabel({
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

export function PlaybackBackdrop() {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Svg
        width="100%"
        height="100%"
        viewBox="0 0 100 100"
        preserveAspectRatio="none">
        <Defs>
          <RadialGradient
            id="playback-screen"
            cx="48%"
            cy="49%"
            rx="72%"
            ry="69%">
            <Stop offset="0" stopColor="#151922" />
            <Stop offset="1" stopColor="#0D1017" />
          </RadialGradient>
        </Defs>
        <Rect width="100" height="100" fill="url(#playback-screen)" />
      </Svg>
    </View>
  );
}

export function PlaybackMark() {
  return (
    <Svg width={17} height={17} viewBox="0 0 16 16" accessible={false}>
      <Path d="M1 1h3v2h3v2h3v2h4v2h-4v2H7v2H4v2H1Z" fill="#187BFF" />
    </Svg>
  );
}

export function EmptyPlaybackCard() {
  return (
    <View style={styles.emptyCard}>
      <Svg width={40} height={42} viewBox="0 0 40 42" accessible={false}>
        <Path
          d="M3 3h2V2h21v2h2v2h2v2h2v2h2v2h3v25h-2v3H5v-2H3Z"
          fill="none"
          stroke={AMBER}
          strokeWidth={2.7}
        />
        <Path d="M9 7h3v11H9zm7 0h3v11h-3zm7 0h3v11h-3z" fill={AMBER} />
      </Svg>
      <View style={styles.emptyTitle}>
        <PlaybackLabel text="NO IMAGE" scale={2.85} color={AMBER} />
      </View>
      <PlaybackLabel text="The card is empty." scale={1.85} color="#FFE1A8" />
    </View>
  );
}

export function PlaybackFooter({
  bottomInset,
  onCamera,
  onSettings,
}: {
  bottomInset: number;
  onCamera: () => void;
  onSettings: () => void;
}) {
  return (
    <View
      testID="playback-footer"
      style={[styles.footer, {paddingBottom: Math.max(bottomInset, 10)}]}>
      <MetalPanel />
      <View style={styles.footerRow}>
        <View style={styles.footerSpacer} />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Open the camera"
          onPress={onCamera}
          style={({pressed}) => [
            styles.key,
            styles.cameraKey,
            pressed && styles.pressed,
          ]}>
          <KeySurface />
          <Svg width={29} height={29} viewBox="0 0 30 30" accessible={false}>
            <Path
              d="M10 3h10l2 4h4a3 3 0 0 1 3 3v14a3 3 0 0 1-3 3H4a3 3 0 0 1-3-3V10a3 3 0 0 1 3-3h4Z"
              fill="#C72D2B"
            />
            <Circle cx="15" cy="17" r="5.6" fill="#FFF7F2" />
            <Circle cx="24.5" cy="10.5" r="1" fill="#F69A89" />
          </Svg>
          <PlaybackLabel
            text="OPEN CAMERA"
            color={INK}
            scale={1.65}
            spoken={false}
          />
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Settings"
          onPress={onSettings}
          style={({pressed}) => [
            styles.key,
            styles.settingsKey,
            pressed && styles.pressed,
          ]}>
          <KeySurface />
          <Svg width={28} height={28} viewBox="0 0 24 24" accessible={false}>
            <Path
              fill={INK}
              fillRule="evenodd"
              d="M10 1h4l.6 3.1 1.4.6 2.7-1.8 2.8 2.8-1.8 2.7.6 1.4 3.1.6v4l-3.1.6-.6 1.4 1.8 2.7-2.8 2.8-2.7-1.8-1.4.6-.6 3.1h-4l-.6-3.1-1.4-.6-2.7 1.8-2.8-2.8 1.8-2.7-.6-1.4-3.1-.6v-4l3.1-.6.6-1.4-1.8-2.7 2.8-2.8L8 4.7l1.4-.6L10 1Zm2 7.4a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z"
            />
          </Svg>
        </Pressable>
      </View>
    </View>
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
  emptyCard: {alignItems: 'center', marginBottom: 42},
  emptyTitle: {marginTop: 21, marginBottom: 13},
  footer: {
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingTop: 11,
    backgroundColor: '#DCD0C4',
  },
  footerRow: {
    width: '100%',
    maxWidth: 420,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
  },
  footerSpacer: {flex: 1},
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
  cameraKey: {
    flex: 4,
    maxWidth: 223,
    height: 58,
    flexDirection: 'row',
    gap: 10,
  },
  settingsKey: {width: 54, height: 54},
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
