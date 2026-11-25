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
  sceneToSvg,
  silverCompactCutout,
  silverCompactLayout,
  silverCompactScene,
  skinAspectRatio,
} from '../src/skins';
import {sceneIssues} from '../src/skins/sceneModel';
import {roundedRectPath} from '../src/skins/shapes';

test('registry keeps a single silver compact and falls back to it', () => {
  const skins = listSkins();
  expect(skins.map(skin => skin.name)).toEqual(['Silver Compact']);
  expect(skins.map(skin => skin.id)).toEqual(['silver-compact']);
  expect(defaultSkinId).toBe('silver-compact');
  expect(getSkin().id).toBe(defaultSkinId);
  expect(getSkin('missing').id).toBe(defaultSkinId);
  expect(getSkin('silver-compact').lcdTheme).toBe('classic');
});

test('layout rects sit on the body and describe a large 4:3 cutout', () => {
  expect(layoutIssues(silverCompactLayout)).toEqual([]);
  expect(skinAspectRatio(silverCompactLayout)).toBeCloseTo(360 / 780);
  expect(sceneIssues(silverCompactScene)).toEqual([]);
  expect(sceneToSvg(silverCompactScene)).toContain(
    roundedRectPath(silverCompactCutout),
  );
  const {lcd, viewBox} = silverCompactLayout;
  expect(lcd.width / lcd.height).toBeCloseTo(4 / 3, 2);
  expect(
    (lcd.width * lcd.height) / (viewBox.width * viewBox.height),
  ).toBeGreaterThan(0.25);
});

test('physical controls map onto the matching parts of the body', () => {
  const {lcd, controls} = silverCompactLayout;
  const lcdRight = lcd.x + lcd.width;
  const lcdBottom = lcd.y + lcd.height;
  expect(silverCompactLayout.rotation).toBe(90);
  expect(lcd.width / lcd.height).toBeCloseTo(4 / 3, 2);
  expect(controls.set.y).toBeGreaterThanOrEqual(lcdBottom);
  expect(controls.menu.y).toBe(controls.set.y);
  expect(controls.set.x).toBeLessThan(controls.menu.x);
  expect(controls.shutter.x).toBeGreaterThanOrEqual(lcdRight);
  expect(controls.zoomOut.y).toBe(controls.zoomIn.y);
  expect(controls.zoomOut.x).toBeLessThan(controls.zoomIn.x);
  expect(controls.mode.x).toBe(controls.review.x);
  expect(controls.review.y).toBeLessThan(controls.mode.y);
  expect(controls.display.x).toBe(controls.func.x);
  expect(controls.display.y).toBeGreaterThan(controls.func.y);
  expect(controls.flash.x).toBeGreaterThan(lcdRight);
});

test('resolveSkinLayout turns the landscape back onto a portrait phone', () => {
  const phone = {width: 360, height: 780};
  const origin = mapDesignPoint(silverCompactLayout, phone, 0, 0);
  expect(origin).toEqual({x: 360, y: 0});
  const bottomLeft = mapDesignPoint(silverCompactLayout, phone, 0, 360);
  expect(bottomLeft).toEqual({x: 0, y: 0});

  const fitted = resolveSkinLayout(silverCompactLayout, phone);
  expect(fitted.scale).toBe(1);
  expect(fitted.offsetX).toBe(0);
  expect(fitted.frame).toEqual({left: 0, top: 0, width: 360, height: 780});
  expect(fitted.lcd).toEqual({left: 58, top: 150, width: 234, height: 312});
  expect(fitted.lcd.height / fitted.lcd.width).toBeCloseTo(4 / 3, 2);
  expect(fitted.controls.set.left + fitted.controls.set.width).toBeLessThanOrEqual(
    fitted.lcd.left + 1,
  );
  expect(fitted.controls.set.top).toBeLessThan(fitted.controls.menu.top);
  expect(fitted.controls.menu.left).toBeLessThan(fitted.lcd.left);
  expect(fitted.controls.zoomIn.left).toBeGreaterThan(fitted.lcd.left + fitted.lcd.width);
  expect(fitted.controls.zoomOut.top).toBeLessThan(fitted.controls.zoomIn.top);
  expect(fitted.controls.display.top).toBeGreaterThan(fitted.lcd.top + fitted.lcd.height);
  expect(fitted.controls.display.left).toBeLessThan(fitted.controls.func.left);

  const half = resolveSkinLayout(silverCompactLayout, {
    width: 180,
    height: 390,
  });
  expect(half.scale).toBeCloseTo(0.5);
  expect(half.lcd.left).toBeCloseTo(29);
  expect(half.lcd.width).toBeCloseTo(117);
  expect(half.lcd.height).toBeCloseTo(156);

  const tall = resolveSkinLayout(silverCompactLayout, {
    width: 360,
    height: 1000,
  });
  expect(tall.offsetY).toBeCloseTo(110);
  expect(tall.lcd.top).toBeCloseTo(260);

  const wide = resolveSkinLayout(silverCompactLayout, {
    width: 800,
    height: 780,
  });
  expect(wide.offsetX).toBeCloseTo(220);
  expect(wide.lcd.left).toBeCloseTo(278);
  expect(wide.frame.width).toBeCloseTo(360);
});

test('skin svg snapshot', () => {
  expect(sceneToSvg(silverCompactScene)).toMatchSnapshot();
});

test('buttons call their handlers and the lcd slot is positioned', async () => {
  const handlers = {
    onShutter: jest.fn(),
    onFlash: jest.fn(),
    onMode: jest.fn(),
    onZoomIn: jest.fn(),
    onZoomOut: jest.fn(),
    onReview: jest.fn(),
    onPower: jest.fn(),
    onDisplay: jest.fn(),
    onFunc: jest.fn(),
    onMenu: jest.fn(),
    onSet: jest.fn(),
  };
  let renderer: ReactTestRenderer.ReactTestRenderer;
  await ReactTestRenderer.act(() => {
    renderer = ReactTestRenderer.create(
      <SilverCompactSkin width={360} height={780} {...handlers}>
        <View testID="lcd-child" />
      </SilverCompactSkin>,
    );
  });
  const slot = renderer!.root.findByProps({testID: 'skin-lcd-slot'});
  const slotStyle = StyleSheet.flatten(slot.props.style);
  expect(slotStyle).toMatchObject({
    left: 58,
    top: 150,
    width: 234,
    height: 312,
  });
  expect(renderer!.root.findByProps({testID: 'lcd-child'})).toBeTruthy();

  const labeled = [
    ['skin-shutter', 'Shutter', handlers.onShutter],
    ['skin-flash', 'Flash', handlers.onFlash],
    ['skin-mode', 'Camera', handlers.onMode],
    ['skin-zoom-in', 'Zoom in', handlers.onZoomIn],
    ['skin-zoom-out', 'Zoom out', handlers.onZoomOut],
    ['skin-review', 'Gallery', handlers.onReview],
    ['skin-power', 'Power', handlers.onPower],
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
  expect(renderer!.root.findByProps({testID: 'skin-power'})).toBeTruthy();
  expect(renderer!.root.findByProps({testID: 'skin-display'})).toBeTruthy();
  expect(renderer!.root.findByProps({testID: 'skin-set'})).toBeTruthy();
});

test('SkinStage nests the preview and themed overlay in the cutout', async () => {
  let renderer: ReactTestRenderer.ReactTestRenderer;
  await ReactTestRenderer.act(() => {
    renderer = ReactTestRenderer.create(
      <SkinStage
        width={360}
        height={780}
        preview={<Text testID="live-preview">preview</Text>}
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
  expect(turnedStyle.width).toBe(312);
  expect(turnedStyle.height).toBe(234);
  expect(turnedStyle.transform).toEqual([{rotate: '90deg'}]);
  expect(renderer!.root.findByProps({testID: 'live-preview'})).toBeTruthy();
  const overlay = renderer!.root.findByProps({testID: 'lcd-overlay'});
  expect(overlay.props.accessibilityLabel).toContain('flash-red-eye');
  expect(overlay.props.accessibilityLabel).toContain('mode-review');
  expect(overlay.props.accessibilityLabel).toContain('shots-7');
  expect(overlay.props.accessibilityLabel).toContain('battery-low');
  expect(
    renderer!.root.findAllByProps({testID: 'lcd-focus-bracket'}),
  ).toHaveLength(0);
});

test('the headless preview is the silver compact with the period hud', () => {
  const previews = buildPreviews();
  expect(previews.map(preview => preview.filename)).toEqual([
    'silver-compact.png',
  ]);
  const [silver] = previews;
  expect(silver.svg).toContain('rotate(90)');
  expect(silver.svg).toContain('viewBox="0 0 360 780"');
  expect(silver.svg).toContain('#F4F7FB');
  expect(silver.svg).toContain('#121722');
  expect(silver.svg).toContain('#D64545');
  expect(silver.svg).not.toContain('Canon');
  expect(silver.svg).not.toContain('PowerShot');
});
