import React from 'react';
import {StyleSheet, View} from 'react-native';
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
  ...callbacks
}) => {
  const skin = getSkin(skinId);
  const placed = resolveSkinLayout(skin.layout, {width, height});
  const Body = skin.Component;
  return (
    <Body width={width} height={height} {...callbacks}>
      <View style={styles.slot}>
        {preview ? <View style={styles.preview}>{preview}</View> : null}
        <View style={styles.overlay}>
          <LcdOverlay
            theme={skin.lcdTheme}
            {...lcd}
            width={placed.lcd.width}
            height={placed.lcd.height}
          />
        </View>
      </View>
    </Body>
  );
};

const styles = StyleSheet.create({
  slot: {
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
  },
  preview: {
    ...StyleSheet.absoluteFill,
  },
  overlay: {
    ...StyleSheet.absoluteFill,
  },
});
