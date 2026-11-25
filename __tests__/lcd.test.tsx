import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import {buildLcdScene} from '../src/lcd/buildLcdScene';
import {formatLcdDate, formatShots} from '../src/lcd/format';
import {LcdOverlay} from '../src/lcd/LcdOverlay';
import {resolveLcdTheme} from '../src/lcd/theme';
import {sceneToSvg} from '../src/skins/sceneToSvg';

const base = {
  batteryLevel: 0.8,
  shotsRemaining: 18,
  dateText: '2004.11.25',
  focus: 'idle' as const,
  mode: 'live' as const,
  showBrackets: true,
};

test('formats the period date and the frame counter', () => {
  expect(formatLcdDate(new Date('2004-11-25T23:30:00Z'))).toBe('2004.11.25');
  expect(formatLcdDate('04/11/25')).toBe('04/11/25');
  expect(formatLcdDate(new Date('not-a-date'))).toBe('0000.00.00');
  expect(formatShots(18.9)).toBe('18');
  expect(formatShots(-4)).toBe('0');
  expect(formatShots(50000)).toBe('9999');
});

test('themes recolor the overlay and partial themes override one token', () => {
  const custom = resolveLcdTheme({text: '#123456'});
  expect(custom.text).toBe('#123456');
  expect(custom.iconWell).toBe(resolveLcdTheme('classic').iconWell);
  expect(custom.bracketLocked).toBe(resolveLcdTheme('classic').bracketLocked);
  const amber = sceneToSvg(
    buildLcdScene({
      ...base,
      theme: resolveLcdTheme('amber'),
      flashMode: 'auto',
    }),
  );
  expect(amber).toContain('#FFD27A');
  expect(amber).not.toContain('#123456');
});

test('lcd state snapshots', () => {
  const classic = resolveLcdTheme('classic');
  expect(
    sceneToSvg(
      buildLcdScene({
        ...base,
        theme: classic,
        flashMode: 'auto',
        focus: 'locked',
      }),
    ),
  ).toMatchSnapshot();
  expect(
    sceneToSvg(
      buildLcdScene({
        ...base,
        theme: classic,
        flashMode: 'off',
        mode: 'review',
        showBrackets: false,
        batteryLevel: 0.1,
      }),
    ),
  ).toMatchSnapshot();
  expect(
    sceneToSvg(
      buildLcdScene({
        ...base,
        theme: resolveLcdTheme('ice'),
        flashMode: 'red-eye',
        focus: 'searching',
      }),
    ),
  ).toMatchSnapshot();
});

test('classic hud is white glyphs on dark wells, like the compact lcd', () => {
  const theme = resolveLcdTheme('classic');
  const svg = sceneToSvg(
    buildLcdScene({
      ...base,
      theme,
      flashMode: 'auto',
      showBrackets: true,
    }),
  );
  expect(theme.icon).toBe('#F4F7FB');
  expect(theme.iconWell).toBe('#121722');
  expect(svg).toContain(theme.iconWell);
  expect(svg).toContain(theme.icon);
  expect(svg).toContain(theme.bracket);
});

test('locked brackets are green and review replaces them with a frame', () => {
  const theme = resolveLcdTheme('classic');
  const locked = sceneToSvg(
    buildLcdScene({...base, theme, flashMode: 'on', focus: 'locked'}),
  );
  const review = sceneToSvg(
    buildLcdScene({
      ...base,
      theme,
      flashMode: 'on',
      mode: 'review',
      showBrackets: true,
      batteryLevel: 0.1,
    }),
  );
  expect(locked).toContain(theme.bracketLocked);
  expect(review).not.toContain(theme.bracketLocked);
  expect(review).toContain(theme.reviewScrim);
  expect(review).toContain(theme.batteryLow);
});

test('the overlay renders live, locked, and review states', async () => {
  const cases = [
    {
      focus: 'idle' as const,
      mode: 'live' as const,
      flashMode: 'auto' as const,
      bracket: 1,
    },
    {
      focus: 'locked' as const,
      mode: 'live' as const,
      flashMode: 'on' as const,
      bracket: 1,
    },
    {
      focus: 'searching' as const,
      mode: 'live' as const,
      flashMode: 'off' as const,
      bracket: 1,
    },
    {
      focus: 'idle' as const,
      mode: 'review' as const,
      flashMode: 'red-eye' as const,
      bracket: 0,
    },
  ];
  for (const item of cases) {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    await ReactTestRenderer.act(() => {
      renderer = ReactTestRenderer.create(
        <LcdOverlay
          width={200}
          height={150}
          animated={false}
          date="2004.11.25"
          shotsRemaining={3}
          batteryLevel={0.9}
          focus={item.focus}
          mode={item.mode}
          flashMode={item.flashMode}
        />,
      );
    });
    const overlay = renderer!.root.findByProps({testID: 'lcd-overlay'});
    expect(overlay.props.accessibilityLabel).toContain(
      `flash-${item.flashMode}`,
    );
    expect(overlay.props.accessibilityLabel).toContain(`focus-${item.focus}`);
    expect(overlay.props.accessibilityLabel).toContain(`mode-${item.mode}`);
    const brackets = renderer!.root.findAllByProps({
      testID: 'lcd-focus-bracket',
    });
    expect(brackets.length > 0).toBe(item.bracket === 1);
  }
});
