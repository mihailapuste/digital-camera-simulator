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
  silverCompactLabels,
  silverCompactLayout,
  silverCompactScene,
  skinAspectRatio,
} from '../src/skins';
import {SKIN_CONTROLS} from '../src/skins/types';
import {pixelTextWidth} from '../src/lcd/pixelFont';
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

test('layout rects sit on the body and describe a square cutout', () => {
  expect(layoutIssues(silverCompactLayout)).toEqual([]);
  expect(skinAspectRatio(silverCompactLayout)).toBeCloseTo(360 / 780);
  expect(sceneIssues(silverCompactScene)).toEqual([]);
  expect(sceneToSvg(silverCompactScene)).toContain(
    roundedRectPath(silverCompactCutout),
  );
  const {lcd, viewBox} = silverCompactLayout;
  expect(lcd.width).toBe(lcd.height);
  expect(
    (lcd.width * lcd.height) / (viewBox.width * viewBox.height),
  ).toBeGreaterThan(0.18);
});

test('physical controls map onto the matching parts of the body', () => {
  const {lcd, controls} = silverCompactLayout;
  const lcdRight = lcd.x + lcd.width;
  const lcdBottom = lcd.y + lcd.height;
  expect(silverCompactLayout.rotation).toBe(90);
  expect(lcd.width).toBe(lcd.height);
  expect(controls.set.y - lcdBottom).toBeGreaterThanOrEqual(8);
  expect(controls.set.width).toBe(controls.menu.width);
  expect(controls.viewfinder.width).toBe(controls.menu.width * 1.25);
  expect(controls.viewfinder.height).toBe(controls.menu.height * 1.25);
  expect(controls.set.height).toBe(controls.menu.height);
  expect(controls.menu.y).toBe(controls.set.y);
  expect(controls.set.x).toBeLessThan(controls.menu.x);
  expect(controls.shutter.x).toBeGreaterThanOrEqual(lcdRight);
  expect(controls.zoomOut.y).toBe(controls.zoomIn.y);
  expect(controls.zoomOut.x).toBeLessThan(controls.zoomIn.x);
  expect(controls.mode.y).toBe(controls.review.y);
  expect(controls.mode.x).toBe(controls.zoomOut.x);
  expect(controls.review.x).toBe(controls.zoomIn.x);
  expect(controls.display.x).toBe(controls.func.x);
  expect(silverCompactLayout.viewBox.width - controls.func.x - controls.func.width)
    .toBeGreaterThanOrEqual(40);
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
  expect(fitted.lcd).toEqual({left: 62, top: 96, width: 236, height: 236});
  expect(fitted.lcd.width).toBe(fitted.lcd.height);
  expect(fitted.controls.set.left + fitted.controls.set.width).toBeLessThanOrEqual(
    fitted.lcd.left + 1,
  );
  expect(fitted.controls.set.top).toBeLessThan(fitted.controls.menu.top);
  expect(fitted.controls.menu.left).toBeLessThan(fitted.lcd.left);
  expect(fitted.controls.zoomIn.top).toBeGreaterThan(fitted.lcd.top + fitted.lcd.height);
  expect(fitted.controls.zoomOut.top).toBeLessThan(fitted.controls.zoomIn.top);
  expect(fitted.controls.display.top).toBeGreaterThan(fitted.lcd.top + fitted.lcd.height);
  expect(fitted.controls.display.left).toBeLessThan(fitted.controls.func.left);

  const half = resolveSkinLayout(silverCompactLayout, {
    width: 180,
    height: 390,
  });
  expect(half.scale).toBeCloseTo(0.5);
  expect(half.lcd.left).toBeCloseTo(31);
  expect(half.lcd.width).toBeCloseTo(118);
  expect(half.lcd.height).toBeCloseTo(118);

  const tall = resolveSkinLayout(silverCompactLayout, {
    width: 360,
    height: 1000,
  });
  expect(tall.offsetY).toBeCloseTo(110);
  expect(tall.lcd.top).toBeCloseTo(206);

  const wide = resolveSkinLayout(silverCompactLayout, {
    width: 800,
    height: 780,
  });
  expect(wide.offsetX).toBeCloseTo(220);
  expect(wide.lcd.left).toBeCloseTo(282);
  expect(wide.frame.width).toBeCloseTo(360);
});

function rectsOverlap(
  a: {x: number; y: number; width: number; height: number},
  b: {x: number; y: number; width: number; height: number},
): boolean {
  return (
    a.x + a.width > b.x + 0.5 &&
    b.x + b.width > a.x + 0.5 &&
    a.y + a.height > b.y + 0.5 &&
    b.y + b.height > a.y + 0.5
  );
}

test('engraved labels use the pixel font and sit clear of the buttons', () => {
  const glyph = ' ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.-';
  const labels = Object.values(silverCompactLabels);
  for (const label of labels) {
    expect(pixelTextWidth(label.text, 2)).toBeLessThanOrEqual(label.width + 0.01);
    expect([...label.text].every(character => glyph.includes(character))).toBe(
      true,
    );
    expect(label.x).toBeGreaterThanOrEqual(8);
    expect(label.y).toBeGreaterThanOrEqual(8);
    expect(label.x + label.width).toBeLessThanOrEqual(772);
    expect(label.y + label.height).toBeLessThanOrEqual(354);
    expect(rectsOverlap(label, silverCompactLayout.lcd)).toBe(false);
    for (const id of SKIN_CONTROLS) {
      expect(rectsOverlap(label, silverCompactLayout.controls[id])).toBe(false);
    }
  }
  expect(silverCompactLabels.dcIn.x + silverCompactLabels.dcIn.width).toBeLessThan(
    silverCompactLayout.controls.set.x,
  );

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
    onExpandViewfinder: jest.fn(),
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
    left: 62,
    top: 96,
    width: 236,
    height: 236,
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
        width={360}
        height={780}
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
  expect(turnedStyle.width).toBe(236);
  expect(turnedStyle.height).toBe(236);
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
    renderer!.update(<SkinStage width={780} height={360} rotation={0} />);
  });
  expect(renderer!.root.findAllByProps({testID: 'skin-lcd-rotation'})).toHaveLength(0);
  expect(
    StyleSheet.flatten(renderer!.root.findByProps({testID: 'skin-lcd-slot'}).props.style),
  ).toMatchObject({left: 96, top: 62, width: 236, height: 236});
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
