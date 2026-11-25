import React, {useMemo, useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {Canvas, Group, RoundedRect} from '@shopify/react-native-skia';
import {shotCounterLayout} from '../lcd/buildLcdScene';
import {formatShots} from '../lcd/format';
import {LCD_VIEWBOX} from '../lcd/types';
import Svg, {Defs, RadialGradient, Rect, Stop} from 'react-native-svg';
import {
  getPreset,
  useLookPreview,
  type CcdPreset,
  type DateStampOptions,
} from '../look';

type ViewfinderPlateProps = {
  preview?: React.ReactNode;
  presetId: string;
  stamp: DateStampOptions | null;
  hudShotsRemaining?: number;
  stampInsetRight?: number;
  stampInsetBottom?: number;
  showGrid: boolean;
  busy: boolean;
};

function safePreset(id: string): CcdPreset {
  try {
    return getPreset(id);
  } catch {
    return getPreset('ccd-classic');
  }
}

function GradeWash({preset}: {preset: CcdPreset}) {
  const warm = Math.max(0, preset.temperature);
  const cool = Math.max(0, -preset.temperature);
  const tint = `rgba(${Math.round(40 + warm * 180)}, ${Math.round(28 + warm * 40)}, ${Math.round(20 + cool * 180)}, ${(0.06 + Math.abs(preset.temperature) * 0.22 + preset.flash * 0.08).toFixed(3)})`;
  const vignette = Math.min(0.85, 0.12 + preset.vignette * 0.9);
  const flash = preset.flash;
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <View style={[StyleSheet.absoluteFill, {backgroundColor: tint}]} />
      <Svg width="100%" height="100%">
        <Defs>
          <RadialGradient id="vig" cx="50%" cy="48%" r="62%">
            <Stop offset="0" stopColor="#000000" stopOpacity="0" />
            <Stop
              offset="0.62"
              stopColor="#000000"
              stopOpacity={vignette * 0.2}
            />
            <Stop offset="1" stopColor="#000000" stopOpacity={vignette} />
          </RadialGradient>
          {flash > 0.15 ? (
            <RadialGradient id="flash" cx="50%" cy="42%" r="38%">
              <Stop offset="0" stopColor="#FFFFFF" stopOpacity={flash * 0.45} />
              <Stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
            </RadialGradient>
          ) : null}
        </Defs>
        <Rect width="100%" height="100%" fill="url(#vig)" />
        {flash > 0.15 ? (
          <Rect width="100%" height="100%" fill="url(#flash)" />
        ) : null}
      </Svg>
    </View>
  );
}

function LiveStamp({
  width,
  height,
  preset,
  stamp,
  rightInset,
  bottomInset,
}: {
  width: number;
  height: number;
  preset: string;
  rightInset: number;
  bottomInset: number;
  stamp: DateStampOptions | null;
}) {
  const look = useLookPreview({
    preset,
    width: Math.max(2, width),
    height: Math.max(2, height),
    stamp,
  });
  const plan = look.stampPlan;
  if (!plan || width < 2 || height < 2) {
    return null;
  }
  return (
    <Canvas style={StyleSheet.absoluteFill} pointerEvents="none">
      <Group opacity={plan.opacity * 0.45}>
        {plan.marks.map((mark, index) => (
          <RoundedRect
            key={`glow-${index}`}
            x={mark.x - rightInset - 0.6}
            y={mark.y - bottomInset - 0.6}
            width={mark.width + 1.2}
            height={mark.height + 1.2}
            r={mark.radius}
            color={plan.color}
          />
        ))}
      </Group>
      <Group opacity={plan.opacity}>
        {plan.marks.map((mark, index) => (
          <RoundedRect
            key={`core-${index}`}
            x={mark.x - rightInset}
            y={mark.y - bottomInset}
            width={mark.width}
            height={mark.height}
            r={Math.min(mark.radius, mark.width / 2, mark.height / 2)}
            color={plan.color}
          />
        ))}
      </Group>
    </Canvas>
  );
}

function Grid() {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <View style={[styles.vline, {left: '33.33%'}]} />
      <View style={[styles.vline, {left: '66.66%'}]} />
      <View style={[styles.hline, {top: '33.33%'}]} />
      <View style={[styles.hline, {top: '66.66%'}]} />
    </View>
  );
}

/**
 * Landscape plate that SkinStage turns with the body. The grade is a light
 * tint and vignette so the preview stays smooth; the saved JPEG is the
 * full CCD shader.
 */
export function ViewfinderPlate({
  preview,
  presetId,
  stamp,
  hudShotsRemaining,
  stampInsetRight = 0,
  stampInsetBottom = 0,
  showGrid,
  busy,
}: ViewfinderPlateProps) {
  const preset = safePreset(presetId);
  const [size, setSize] = useState({width: 0, height: 0});
  const mono = preset.mono > 0.5;
  const stampKey = useMemo(() => JSON.stringify(stamp), [stamp]);
  const counter =
    hudShotsRemaining === undefined
      ? null
      : shotCounterLayout(formatShots(hudShotsRemaining));
  const stampRightInset = counter
    ? size.width * (1 - counter.x / LCD_VIEWBOX.width)
    : 0;

  return (
    <View
      testID="viewfinder-plate"
      style={[styles.plate, mono && styles.monoBed]}
      onLayout={event => {
        const {width, height} = event.nativeEvent.layout;
        setSize(current =>
          current.width === width && current.height === height
            ? current
            : {width, height},
        );
      }}>
      <View style={[StyleSheet.absoluteFill, mono && styles.monoPreview]}>
        {preview}
      </View>
      {preview ? <GradeWash preset={preset} /> : null}
      {showGrid ? <Grid /> : null}
      {stamp ? (
        <LiveStamp
          key={stampKey}
          width={size.width}
          height={size.height}
          preset={preset.id}
          stamp={stamp}
          rightInset={stampRightInset + stampInsetRight}
          bottomInset={stampInsetBottom}
        />
      ) : null}
      {busy ? (
        <View style={styles.busy} pointerEvents="none">
          <Text style={styles.busyText}>SAVING</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  plate: {
    flex: 1,
    backgroundColor: '#11161f',
    overflow: 'hidden',
  },
  monoBed: {
    backgroundColor: '#8d8d8d',
  },
  monoPreview: {
    opacity: 0.38,
  },
  vline: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.45)',
  },
  hline: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.45)',
  },
  busy: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  busyText: {
    backgroundColor: 'rgba(0,0,0,0.65)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    color: '#F4F7FB',
    letterSpacing: 4,
    fontSize: 18,
    fontWeight: '700',
  },
});
