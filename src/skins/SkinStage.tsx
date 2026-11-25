import React from 'react';
import {Pressable, StyleSheet, View} from 'react-native';
import {LcdOverlay} from '../lcd/LcdOverlay';
import type {LcdOverlayProps} from '../lcd/types';
import {resolveSkinLayout} from './resolveLayout';
import {getSkin} from './registry';
import type {CameraSkinProps} from './types';

export type SkinStageProps = Omit<CameraSkinProps, 'children'> & {
  skinId?: string;
  /** Fills the LCD cutout underneath the viewfinder overlay. */
  preview?: React.ReactNode;
  lcd?: Partial<LcdOverlayProps>;
  /** Hide the status glyphs. The preview stays. */
  showLcd?: boolean;
  /** Drawn above the status glyphs, still inside the rotated plate. */
  foreground?: React.ReactNode;
};

/**
 * Places a skin and its LCD overlay on any viewport. Pass `preview` to fill
 * the cutout, or use `resolveSkinLayout` when a native camera view has to sit
 * behind the skin instead of inside it.
 */
export const SkinStage: React.FC<SkinStageProps> = ({
  skinId,
  width,
  height,
  preview,
  lcd,
  showLcd = true,
  foreground,
  rotation,
  onExpandViewfinder,
  ...callbacks
}) => {
  const skin = getSkin(skinId);
  const layout = {...skin.layout, rotation: rotation ?? skin.layout.rotation};
  const placed = resolveSkinLayout(layout, {width, height});
  const Body = skin.Component;
  const turned = layout.rotation === 90;
  const plate = (
    <>
      {preview ? <View style={styles.preview}>{preview}</View> : null}
      {onExpandViewfinder ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Expand camera preview"
          testID="expand-camera-preview"
          onPress={onExpandViewfinder}
          style={StyleSheet.absoluteFill}
        />
      ) : null}
      {showLcd ? (
        <View style={styles.overlay} pointerEvents="box-none">
          <LcdOverlay
            theme={skin.lcdTheme}
            {...lcd}
            square={layout.lcd.width === layout.lcd.height}
            width="100%"
            height="100%"
          />
        </View>
      ) : null}
      {foreground}
    </>
  );
  return (
    <Body
      width={width}
      height={height}
      rotation={rotation}
      onExpandViewfinder={onExpandViewfinder}
      {...callbacks}>
      {turned ? (
        <View style={styles.slot}>
          <View
            testID="skin-lcd-rotation"
            style={[
              styles.turned,
              {
                width: placed.lcd.height,
                height: placed.lcd.width,
                left: (placed.lcd.width - placed.lcd.height) / 2,
                top: (placed.lcd.height - placed.lcd.width) / 2,
              },
            ]}>
            {plate}
          </View>
        </View>
      ) : (
        <View style={styles.slot}>{plate}</View>
      )}
    </Body>
  );
};

const styles = StyleSheet.create({
  slot: {
    width: '100%',
    height: '100%',
    pointerEvents: 'box-none',
  },
  preview: {
    ...StyleSheet.absoluteFill,
  },
  overlay: {
    ...StyleSheet.absoluteFill,
  },
  turned: {
    position: 'absolute',
    transform: [{rotate: '90deg'}],
  },
});
