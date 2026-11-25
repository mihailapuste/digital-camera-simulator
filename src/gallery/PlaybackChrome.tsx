import React from 'react';
import {StyleSheet, View} from 'react-native';
import Svg, {Circle, Path} from 'react-native-svg';
import {GearIcon, LcdLabel} from '../components/LcdChrome';
import {MetalKey, MetalPanel} from '../components/MetalPanel';

const INK = '#41403B';
const AMBER = '#FF9D14';

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
        <LcdLabel text="NO IMAGE" scale={2.85} color={AMBER} />
      </View>
      <LcdLabel text="The card is empty." scale={1.85} color="#FFE1A8" />
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
        <MetalKey
          label="Open the camera"
          onPress={onCamera}
          style={styles.cameraKey}>
          <Svg width={29} height={29} viewBox="0 0 30 30" accessible={false}>
            <Path
              d="M10 3h10l2 4h4a3 3 0 0 1 3 3v14a3 3 0 0 1-3 3H4a3 3 0 0 1-3-3V10a3 3 0 0 1 3-3h4Z"
              fill="#C72D2B"
            />
            <Circle cx="15" cy="17" r="5.6" fill="#FFF7F2" />
            <Circle cx="24.5" cy="10.5" r="1" fill="#F69A89" />
          </Svg>
          <LcdLabel
            text="OPEN CAMERA"
            color={INK}
            scale={1.65}
            spoken={false}
          />
        </MetalKey>
        <MetalKey
          label="Settings"
          onPress={onSettings}
          style={styles.settingsKey}>
          <GearIcon size={28} color={INK} />
        </MetalKey>
      </View>
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
  cameraKey: {
    flex: 4,
    maxWidth: 223,
    height: 58,
    flexDirection: 'row',
    gap: 10,
  },
  settingsKey: {width: 54, height: 54},
});
