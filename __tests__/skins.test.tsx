import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import {StyleSheet, Text, View} from 'react-native';
import {
  CoolpixBlueSkin,
  CyberBlackSkin,
  IxySilverSkin,
  SkinStage,
  buildPreviews,
  coolpixBlueCutout,
  coolpixBlueLayout,
  coolpixBlueScene,
  cyberBlackCutout,
  cyberBlackLayout,
  cyberBlackScene,
  defaultSkinId,
  getSkin,
  ixySilverCutout,
  ixySilverLayout,
  ixySilverScene,
  layoutIssues,
  listSkins,
  resolveSkinLayout,
  sceneToSvg,
  skinAspectRatio,
} from '../src/skins';
import {sceneIssues} from '../src/skins/sceneModel';
import {roundedRectPath} from '../src/skins/shapes';

const bodies = [
  {
    name: 'Ixy Silver',
    scene: ixySilverScene,
    layout: ixySilverLayout,
    cutout: ixySilverCutout,
    Component: IxySilverSkin,
  },
  {
    name: 'Cyber Black',
    scene: cyberBlackScene,
    layout: cyberBlackLayout,
    cutout: cyberBlackCutout,
    Component: CyberBlackSkin,
  },
  {
    name: 'Coolpix-ish Blue',
    scene: coolpixBlueScene,
    layout: coolpixBlueLayout,
    cutout: coolpixBlueCutout,
    Component: CoolpixBlueSkin,
  },
];

test('registry lists three original skins and a default', () => {
  const skins = listSkins();
  expect(skins.map(skin => skin.name)).toEqual([
    'Ixy Silver',
    'Cyber Black',
    'Coolpix-ish Blue',
  ]);
  expect(new Set(skins.map(skin => skin.id)).size).toBe(3);
  expect(defaultSkinId).toBe('ixy-silver');
  expect(getSkin().id).toBe(defaultSkinId);
  expect(getSkin('missing').id).toBe(defaultSkinId);
  expect(getSkin('cyber-black').name).toBe('Cyber Black');
});

test('layout rects are inside the body and describe a 4:3 cutout', () => {
  for (const body of bodies) {
    expect(layoutIssues(body.layout)).toEqual([]);
    expect(skinAspectRatio(body.layout)).toBeCloseTo(360 / 780);
    expect(sceneIssues(body.scene)).toEqual([]);
    expect(sceneToSvg(body.scene)).toContain(roundedRectPath(body.cutout));
  }
});

test('resolveSkinLayout contain-fits the cutout on any viewport', () => {
  const fitted = resolveSkinLayout(ixySilverLayout, {width: 360, height: 780});
  expect(fitted.scale).toBe(1);
  expect(fitted.lcd).toEqual({left: 44, top: 168, width: 272, height: 204});

  const half = resolveSkinLayout(ixySilverLayout, {width: 180, height: 390});
  expect(half.scale).toBeCloseTo(0.5);
  expect(half.lcd.left).toBeCloseTo(22);
  expect(half.lcd.width).toBeCloseTo(136);

  const tall = resolveSkinLayout(ixySilverLayout, {width: 360, height: 1000});
  expect(tall.offsetY).toBeCloseTo(110);
  expect(tall.lcd.top).toBeCloseTo(278);

  const wide = resolveSkinLayout(ixySilverLayout, {width: 800, height: 780});
  expect(wide.offsetX).toBeCloseTo(220);
  expect(wide.lcd.left).toBeCloseTo(264);
  expect(wide.frame.width).toBeCloseTo(360);
});

test('skin svg snapshots', () => {
  expect(sceneToSvg(ixySilverScene)).toMatchSnapshot();
  expect(sceneToSvg(cyberBlackScene)).toMatchSnapshot();
  expect(sceneToSvg(coolpixBlueScene)).toMatchSnapshot();
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
  };
  let renderer: ReactTestRenderer.ReactTestRenderer;
  await ReactTestRenderer.act(() => {
    renderer = ReactTestRenderer.create(
      <IxySilverSkin width={360} height={780} {...handlers}>
        <View testID="lcd-child" />
      </IxySilverSkin>,
    );
  });
  const slot = renderer!.root.findByProps({testID: 'skin-lcd-slot'});
  const slotStyle = StyleSheet.flatten(slot.props.style);
  expect(slotStyle).toMatchObject({
    left: 44,
    top: 168,
    width: 272,
    height: 204,
  });
  expect(renderer!.root.findByProps({testID: 'lcd-child'})).toBeTruthy();

  for (const [testID, handler] of [
    ['skin-shutter', handlers.onShutter],
    ['skin-flash', handlers.onFlash],
    ['skin-mode', handlers.onMode],
    ['skin-zoom-in', handlers.onZoomIn],
    ['skin-zoom-out', handlers.onZoomOut],
    ['skin-review', handlers.onReview],
    ['skin-power', handlers.onPower],
  ] as const) {
    await ReactTestRenderer.act(() => {
      renderer.root.findByProps({testID}).props.onPress();
    });
    expect(handler).toHaveBeenCalledTimes(1);
  }
});

test('every body renders its controls', async () => {
  for (const body of bodies) {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    await ReactTestRenderer.act(() => {
      renderer = ReactTestRenderer.create(
        <body.Component width={180} height={390} />,
      );
    });
    expect(renderer!.root.findByProps({testID: 'skin-shutter'})).toBeTruthy();
    expect(renderer!.root.findByProps({testID: 'skin-power'})).toBeTruthy();
  }
});

test('SkinStage nests the preview and themed overlay in the cutout', async () => {
  let renderer: ReactTestRenderer.ReactTestRenderer;
  await ReactTestRenderer.act(() => {
    renderer = ReactTestRenderer.create(
      <SkinStage
        skinId="coolpix-blue"
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

test('headless previews carry each skin and a distinct OSD state', () => {
  const previews = buildPreviews();
  expect(previews.map(preview => preview.filename)).toEqual([
    'ixy-silver.png',
    'cyber-black.png',
    'coolpix-blue.png',
  ]);
  const [ixy, cyber, blue] = previews;
  expect(ixy.svg).toContain('#3DFF6E');
  expect(cyber.svg).toContain('#C9F6FF');
  expect(blue.svg).toContain('rgba(40,18,0,0.48)');
  expect(blue.svg).toContain('#FF5A4A');
});
