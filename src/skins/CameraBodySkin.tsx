import React from 'react';
import {Pressable, StyleSheet, View} from 'react-native';
import {Image, type ImageSource} from 'expo-image';
import {sidewaysFrame} from '../camera/sidewaysFrame';
import {resolveSkinLayout} from './resolveLayout';
import {
  SKIN_CONTROLS,
  type CameraSkinProps,
  type SkinControlId,
  type SkinLayout,
} from './types';

type SkinHandler = Exclude<
  keyof CameraSkinProps,
  'width' | 'height' | 'rotation' | 'safeArea' | 'children'
>;

const BUTTONS: Record<
  SkinControlId,
  {
    label: string;
    testID: string;
    handler: SkinHandler;
    longPress?: SkinHandler;
    hint?: string;
  }
> = {
  shutter: {label: 'Shutter', testID: 'skin-shutter', handler: 'onShutter'},
  flash: {label: 'Flash', testID: 'skin-flash', handler: 'onFlash'},
  mode: {
    label: 'Camera',
    testID: 'skin-mode',
    handler: 'onMode',
    longPress: 'onModeLongPress',
    hint: 'Long press to switch camera',
  },
  zoomIn: {label: 'Zoom in', testID: 'skin-zoom-in', handler: 'onZoomIn'},
  zoomOut: {label: 'Zoom out', testID: 'skin-zoom-out', handler: 'onZoomOut'},
  review: {label: 'Gallery', testID: 'skin-review', handler: 'onReview'},
  viewfinder: {
    label: 'Expand viewfinder',
    testID: 'skin-expand-viewfinder',
    handler: 'onExpandViewfinder',
  },
  display: {label: 'Display', testID: 'skin-display', handler: 'onDisplay'},
  func: {label: 'Function', testID: 'skin-func', handler: 'onFunc'},
  menu: {label: 'Menu', testID: 'skin-menu', handler: 'onMenu'},
  set: {label: 'Set', testID: 'skin-set', handler: 'onSet'},
};

type CameraBodySkinProps = CameraSkinProps & {
  skinId: string;
  layout: SkinLayout;
  artwork: ImageSource | number;
};

export function CameraBodySkin({
  skinId,
  layout,
  artwork,
  width,
  height,
  safeArea,
  children,
  ...callbacks
}: CameraBodySkinProps) {
  const placed = resolveSkinLayout(layout, {width, height}, safeArea);
  const {frame, lcd, scale, artworkTiles} = placed;
  return (
    <View testID={`skin-${skinId}`} style={{width, height}}>
      <View pointerEvents="none" style={[styles.art, styles.clip, frame]}>
        {(
          artworkTiles ?? [
            {
              clip: {left: 0, top: 0, width: frame.width, height: frame.height},
              frame: {
                left: 0,
                top: 0,
                width: frame.width,
                height: frame.height,
              },
            },
          ]
        ).map(({clip, frame: imageFrame}, index) => (
          <View key={index} style={[styles.art, styles.clip, clip]}>
            <View style={[styles.art, imageFrame]}>
              <Image
                source={artwork}
                contentFit="fill"
                style={
                  layout.rotation === 90
                    ? sidewaysFrame(imageFrame.width, imageFrame.height)
                    : StyleSheet.absoluteFill
                }
              />
            </View>
          </View>
        ))}
      </View>
      <View
        testID="skin-lcd-slot"
        style={[
          styles.lcd,
          lcd,
          {borderRadius: (layout.lcdRadius ?? 0) * scale},
        ]}>
        {children}
      </View>
      {SKIN_CONTROLS.map(id => {
        const button = BUTTONS[id];
        const hit = placed.controls[id];
        const onPress = callbacks[button.handler];
        const onLongPress = button.longPress
          ? callbacks[button.longPress]
          : undefined;
        return (
          <Pressable
            key={id}
            testID={button.testID}
            accessibilityRole="button"
            accessibilityLabel={button.label}
            accessibilityHint={button.hint}
            disabled={
              typeof onPress !== 'function' && typeof onLongPress !== 'function'
            }
            delayLongPress={420}
            onPress={typeof onPress === 'function' ? onPress : undefined}
            onLongPress={
              typeof onLongPress === 'function' ? onLongPress : undefined
            }
            style={[
              styles.hit,
              {
                left: hit.left,
                top: hit.top,
                width: hit.width,
                height: hit.height,
              },
            ]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  art: {
    position: 'absolute',
  },
  clip: {
    overflow: 'hidden',
  },
  lcd: {
    position: 'absolute',
    overflow: 'hidden',
    pointerEvents: 'box-none',
    backgroundColor: '#11161f',
  },
  hit: {
    position: 'absolute',
    backgroundColor: 'transparent',
  },
});
