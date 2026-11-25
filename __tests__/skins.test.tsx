import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import {StyleSheet, Text, View} from 'react-native';
import {
  SilverCompactSkin,
  SkinStage,
  buildPreviews,
  defaultSkinId,
  getSkin,
  layoutIssues,
  listSkins,
  mapDesignPoint,
  resolveSkinLayout,
  silverCompactLayout,
  skinAspectRatio,
} from '../src/skins';
import {SKIN_CONTROLS} from '../src/skins/types';

test('registry keeps a single silver compact and falls back to it', () => {
  const skins = listSkins();
  expect(skins.map(skin => skin.name)).toEqual(['Silver Compact']);
  expect(skins.map(skin => skin.id)).toEqual(['silver-compact']);
  expect(defaultSkinId).toBe('silver-compact');
  expect(getSkin().id).toBe(defaultSkinId);
  expect(getSkin('missing').id).toBe(defaultSkinId);
  expect(getSkin('silver-compact').lcdTheme).toBe('classic');
});

test('the layout maps controls and a 4:3 LCD onto the artwork', () => {
  expect(layoutIssues(silverCompactLayout)).toEqual([]);
  expect(skinAspectRatio(silverCompactLayout)).toBeCloseTo(724 / 1282);
  const {lcd, controls, viewBox} = silverCompactLayout;
  expect(lcd.width / lcd.height).toBeCloseTo(4 / 3, 1);
  expect(lcd.width * lcd.height / (viewBox.width * viewBox.height)).toBeGreaterThan(0.3);
  expect(controls.shutter.x).toBeGreaterThan(controls.zoomIn.x);
  expect(controls.shutter.y).toBeLessThan(controls.review.y);
  expect(controls.menu.y).toBe(controls.display.y);
  expect(controls.menu.x).toBeLessThan(controls.display.x);
  expect(controls.flash.y + controls.flash.height).toBe(controls.set.y);
  expect(controls.mode.x + controls.mode.width).toBe(controls.set.x);
  expect(controls.func.x).toBe(controls.set.x + controls.set.width);
  expect(controls.viewfinder.y).toBe(controls.set.y + controls.set.height);
});

test('resolveSkinLayout turns and centers the landscape body in a portrait viewport', () => {
  const phone = {width: 362, height: 741};
  expect(mapDesignPoint(silverCompactLayout, phone, 0, 0)).toEqual({
    x: 362,
    y: 50,
  });
  const fitted = resolveSkinLayout(silverCompactLayout, phone);
  expect(fitted.scale).toBe(0.5);
  expect(fitted.frame).toEqual({left: 0, top: 50, width: 362, height: 641});
  expect(fitted.lcd).toEqual({left: 40, top: 102, width: 252.5, height: 339});
  expect(fitted.controls.zoomOut.top).toBeLessThan(fitted.controls.zoomIn.top);
});

test('the body stays inside the frame on small and tall phones', () => {
  const phones = [
    {width: 320, height: 568},
    {width: 375, height: 667},
    {width: 360, height: 640},
    {width: 360, height: 800},
    {width: 390, height: 844},
    {width: 430, height: 932},
  ];
  for (const phone of phones) {
    const fitted = resolveSkinLayout(silverCompactLayout, phone);
    expect(fitted.frame.left).toBeGreaterThanOrEqual(-0.01);
    expect(fitted.frame.top).toBeGreaterThanOrEqual(-0.01);
    expect(fitted.frame.left + fitted.frame.width).toBeLessThanOrEqual(phone.width + 0.01);
    expect(fitted.frame.top + fitted.frame.height).toBeLessThanOrEqual(
      phone.height + 0.01,
    );
    for (const id of SKIN_CONTROLS) {
      const hit = fitted.controls[id];
      expect(hit.left).toBeGreaterThanOrEqual(fitted.frame.left - 0.01);
      expect(hit.top).toBeGreaterThanOrEqual(fitted.frame.top - 0.01);
      expect(hit.left + hit.width).toBeLessThanOrEqual(
        fitted.frame.left + fitted.frame.width + 0.01,
      );
      expect(hit.top + hit.height).toBeLessThanOrEqual(
        fitted.frame.top + fitted.frame.height + 0.01,
      );
    }
  }
});

test.each([
  {
    viewport: {width: 393, height: 852},
    rotation: 90 as const,
    safeArea: {top: 59, right: 0, bottom: 34, left: 0},
  },
  {
    viewport: {width: 852, height: 393},
    rotation: 0 as const,
    safeArea: {top: 0, right: 59, bottom: 21, left: 59},
  },
])(
  'the full-bleed body fills the viewport with a $rotation degree rotation',
  ({viewport, rotation, safeArea}) => {
    const fitted = resolveSkinLayout(
      {...silverCompactLayout, rotation},
      viewport,
      safeArea,
    );
    expect(fitted.frame).toEqual({left: 0, top: 0, ...viewport});
    const covered = fitted.artworkTiles!.reduce(
      (total, {clip}) => total + clip.width * clip.height,
      0,
    );
    expect(covered).toBeCloseTo(viewport.width * viewport.height);
    if (rotation === 90) {
      const bezelDepth = silverCompactLayout.lcd.x - silverCompactLayout.lcdBezel!.x;
      const bezelTop = fitted.lcd.top -
        bezelDepth * (fitted.lcd.height / silverCompactLayout.lcd.width);
      expect(bezelTop).toBeGreaterThanOrEqual(safeArea.top + 5);
    }
    const axis = rotation === 90 ? 'top' : 'left';
    expect(fitted.controls.zoomOut[axis]).toBeLessThan(
      fitted.controls.zoomIn[axis],
    );
    expect(fitted.controls.shutter[axis]).toBeGreaterThan(
      fitted.controls.zoomIn[axis],
    );
    for (const rect of [fitted.lcd, ...Object.values(fitted.controls)]) {
      expect(rect.left).toBeGreaterThanOrEqual(safeArea.left - 0.01);
      expect(rect.top).toBeGreaterThanOrEqual(safeArea.top - 0.01);
      expect(rect.left + rect.width).toBeLessThanOrEqual(
        viewport.width - safeArea.right + 0.01,
      );
      expect(rect.top + rect.height).toBeLessThanOrEqual(
        viewport.height - safeArea.bottom + 0.01,
      );
    }
  },
);

test('buttons call their handlers and the lcd slot is positioned', async () => {
  const handlers = {
    onShutter: jest.fn(),
    onFlash: jest.fn(),
    onMode: jest.fn(),
    onZoomIn: jest.fn(),
    onZoomOut: jest.fn(),
    onReview: jest.fn(),
    onExpandViewfinder: jest.fn(),
    onDisplay: jest.fn(),
    onFunc: jest.fn(),
    onMenu: jest.fn(),
    onSet: jest.fn(),
  };
  let renderer: ReactTestRenderer.ReactTestRenderer;
  await ReactTestRenderer.act(() => {
    renderer = ReactTestRenderer.create(
      <SilverCompactSkin width={724} height={1282} {...handlers}>
        <View testID="lcd-child" />
      </SilverCompactSkin>,
    );
  });
  const slot = renderer!.root.findByProps({testID: 'skin-lcd-slot'});
  const slotStyle = StyleSheet.flatten(slot.props.style);
  expect(slotStyle).toMatchObject({
    left: 80,
    top: 104,
    width: 505,
    height: 678,
  });
  expect(renderer!.root.findByProps({testID: 'lcd-child'})).toBeTruthy();

  const labeled = [
    ['skin-shutter', 'Shutter', handlers.onShutter],
    ['skin-flash', 'Flash', handlers.onFlash],
    ['skin-mode', 'Camera', handlers.onMode],
    ['skin-zoom-in', 'Zoom in', handlers.onZoomIn],
    ['skin-zoom-out', 'Zoom out', handlers.onZoomOut],
    ['skin-review', 'Gallery', handlers.onReview],
    ['skin-expand-viewfinder', 'Expand viewfinder', handlers.onExpandViewfinder],
    ['skin-display', 'Display', handlers.onDisplay],
    ['skin-func', 'Function', handlers.onFunc],
    ['skin-menu', 'Menu', handlers.onMenu],
    ['skin-set', 'Set', handlers.onSet],
  ] as const;
  for (const [testID, label, handler] of labeled) {
    const button = renderer!.root.findByProps({testID});
    expect(button.props.accessibilityLabel).toBe(label);
    await ReactTestRenderer.act(() => {
      button.props.onPress();
    });
    expect(handler).toHaveBeenCalledTimes(1);
  }
});

test('the body renders its controls', async () => {
  let renderer: ReactTestRenderer.ReactTestRenderer;
  await ReactTestRenderer.act(() => {
    renderer = ReactTestRenderer.create(
      <SilverCompactSkin width={180} height={390} />,
    );
  });
  expect(renderer!.root.findByProps({testID: 'skin-shutter'})).toBeTruthy();
  expect(renderer!.root.findAllByProps({testID: 'skin-power'})).toHaveLength(0);
  expect(renderer!.root.findByProps({testID: 'skin-display'})).toBeTruthy();
  expect(renderer!.root.findByProps({testID: 'skin-set'})).toBeTruthy();
});

test('SkinStage nests the preview and themed overlay in the cutout', async () => {
  const expand = jest.fn();
  let renderer: ReactTestRenderer.ReactTestRenderer;
  await ReactTestRenderer.act(() => {
    renderer = ReactTestRenderer.create(
      <SkinStage
        width={724}
        height={1282}
        preview={<Text testID="live-preview">preview</Text>}
        onExpandViewfinder={expand}
        lcd={{
          date: '2004.11.25',
          shotsRemaining: 7,
          animated: false,
          mode: 'review',
          flashMode: 'red-eye',
          batteryLevel: 0.1,
        }}
      />,
    );
  });
  const turned = renderer!.root.findByProps({testID: 'skin-lcd-rotation'});
  const turnedStyle = StyleSheet.flatten(turned.props.style);
  expect(turnedStyle.width).toBe(678);
  expect(turnedStyle.height).toBe(505);
  expect(turnedStyle.transform).toEqual([{rotate: '90deg'}]);
  expect(renderer!.root.findByProps({testID: 'live-preview'})).toBeTruthy();
  renderer!.root.findByProps({testID: 'expand-camera-preview'}).props.onPress();
  expect(expand).toHaveBeenCalledTimes(1);
  const overlay = renderer!.root.findByProps({testID: 'lcd-overlay'});
  expect(overlay.props.accessibilityLabel).toContain('flash-red-eye');
  expect(overlay.props.accessibilityLabel).toContain('mode-review');
  expect(overlay.props.accessibilityLabel).toContain('shots-7');
  expect(overlay.props.accessibilityLabel).toContain('battery-low');
  expect(
    renderer!.root.findAllByProps({testID: 'lcd-focus-bracket'}),
  ).toHaveLength(0);

  await ReactTestRenderer.act(() => {
    renderer!.update(<SkinStage width={1282} height={724} rotation={0} />);
  });
  expect(renderer!.root.findAllByProps({testID: 'skin-lcd-rotation'})).toHaveLength(0);
  expect(
    StyleSheet.flatten(renderer!.root.findByProps({testID: 'skin-lcd-slot'}).props.style),
  ).toMatchObject({left: 104, top: 139, width: 678, height: 505});
});

test('the headless preview is the silver compact with the period hud', () => {
  const previews = buildPreviews('body.png', 'harbor.jpg');
  expect(previews.map(preview => preview.filename)).toEqual([
    'silver-compact.png',
  ]);
  const [silver] = previews;
  expect(silver.svg).toContain('viewBox="0 0 1282 724"');
  expect(silver.svg).toContain('xlink:href="body.png"');
  expect(silver.svg).toContain('xlink:href="harbor.jpg"');
  expect(silver.svg).toContain('#F4F7FB');
  expect(silver.svg).toContain('#91F647');
});
