import React from 'react';
import {Pressable, StyleSheet, View} from 'react-native';
import {SceneSvg} from './SceneSvg';
import {resolveSkinLayout} from './resolveLayout';
import type {Scene} from './sceneModel';
import {
  SKIN_CONTROLS,
  type CameraSkinProps,
  type SkinControlId,
  type SkinLayout,
} from './types';

type SkinHandler = Exclude<
  keyof CameraSkinProps,
  'width' | 'height' | 'children'
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
  power: {label: 'Power', testID: 'skin-power', handler: 'onPower'},
  display: {label: 'Display', testID: 'skin-display', handler: 'onDisplay'},
  func: {label: 'Function', testID: 'skin-func', handler: 'onFunc'},
  menu: {label: 'Menu', testID: 'skin-menu', handler: 'onMenu'},
  set: {label: 'Set', testID: 'skin-set', handler: 'onSet'},
};

type CameraBodySkinProps = CameraSkinProps & {
  skinId: string;
  layout: SkinLayout;
  scene: Scene;
};

export function CameraBodySkin({
  skinId,
  layout,
  scene,
  width,
  height,
  children,
  ...callbacks
}: CameraBodySkinProps) {
  const placed = resolveSkinLayout(layout, {width, height});
  return (
    <View testID={`skin-${skinId}`} style={{width, height}}>
      <View style={styles.art}>
        <SceneSvg
          scene={scene}
          width={width}
          height={height}
          rotation={layout.rotation ?? 0}
        />
      </View>
      <View
        testID="skin-lcd-slot"
        style={[
          styles.lcd,
          {
            left: placed.lcd.left,
            top: placed.lcd.top,
            width: placed.lcd.width,
            height: placed.lcd.height,
          },
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
    ...StyleSheet.absoluteFill,
    pointerEvents: 'none',
  },
  lcd: {
    position: 'absolute',
    overflow: 'hidden',
    pointerEvents: 'box-none',
  },
  hit: {
    position: 'absolute',
    backgroundColor: 'transparent',
  },
});
