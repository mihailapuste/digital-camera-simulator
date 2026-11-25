import React, {useEffect, useRef, useState} from 'react';
import {
  BackHandler,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import {useIsFocused, useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {StatusBar} from 'expo-status-bar';
import {observer} from 'mobx-react-lite';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {SkinStage} from '../skins';
import {RootStackParamList} from '../navigation/types';
import {useStores} from '../stores';
import {getPreset} from '../look';
import type {FocusState} from '../lcd/types';
import {bakeCapture, storeBakedPhoto} from './capturePipeline';
import type {CaptureOrientation} from './frameCapture';
import {hardwareFlash} from './hardwareFlash';
import {playShutterClick, triggerShutterHaptic} from './shutterFeedback';
import {lcdDateLabel, stampFromSettings} from './stampOptions';
import {PresetPicker} from './PresetPicker';
import {ViewfinderPlate} from './ViewfinderPlate';
import {restingZoom, stepZoom} from './zoom';
import {sidewaysFrame} from './sidewaysFrame';

const CARD_FRAMES = 68;
const REVIEW_MS = 1400;

export type GrabbedPhoto = {
  source: string | Uint8Array;
  orientation?: CaptureOrientation;
};

type HeldCameraProps = {
  hasFlash: boolean;
  minZoom: number;
  maxZoom: number;
  renderPreview: (state: {
    zoom: number;
    active: boolean;
    sideways: boolean;
  }) => React.ReactNode;
  grabPhoto: (flash: {
    flashMode: 'off' | 'on' | 'auto';
    enableRedEyeReduction: boolean;
    enableShutterSound: boolean;
  }) => Promise<GrabbedPhoto | null>;
  captureDisabled?: boolean;
};

function knownPreset(id: string): string {
  try {
    return getPreset(id).id;
  } catch {
    return 'ccd-classic';
  }
}

/**
 * The viewfinder and physical controls follow the camera body layout.
 */
export const HeldCamera = observer(function HeldCamera({
  hasFlash,
  minZoom,
  maxZoom,
  renderPreview,
  grabPhoto,
  captureDisabled = false,
}: HeldCameraProps) {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const {settingsStore, cameraStore} = useStores();
  const insets = useSafeAreaInsets();
  const window = useWindowDimensions();
  const sideways = window.width < window.height;
  const [stageSize, setStageSize] = useState({width: 0, height: 0});
  const focused = useIsFocused();
  const [expanded, setExpanded] = useState(false);
  const [overlay, setOverlay] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [pendingPreset, setPendingPreset] = useState(settingsStore.presetId);
  const [focus, setFocus] = useState<FocusState>('idle');
  const [reviewUri, setReviewUri] = useState<string | null>(null);
  const [zoom, setZoom] = useState(() => restingZoom(minZoom, maxZoom));
  const reviewTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const loaded = useRef<Promise<unknown>>(Promise.resolve());

  useEffect(() => {
    loaded.current = cameraStore.loadPhotos();
  }, [cameraStore]);

  useEffect(() => {
    setZoom(restingZoom(minZoom, maxZoom));
  }, [minZoom, maxZoom]);

  useEffect(() => {
    return () => {
      if (reviewTimer.current) {
        clearTimeout(reviewTimer.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!focused || !expanded) {
      return;
    }
    const subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        setExpanded(false);
        return true;
      },
    );
    return () => subscription.remove();
  }, [expanded, focused]);

  const clearReview = () => {
    if (reviewTimer.current) {
      clearTimeout(reviewTimer.current);
      reviewTimer.current = null;
    }
    setReviewUri(null);
    setFocus('idle');
  };

  const activePreset = knownPreset(settingsStore.presetId);
  const stamp = stampFromSettings(settingsStore);
  const shotsRemaining = Math.max(0, CARD_FRAMES - cameraStore.imageCount);

  const shutter = async () => {
    if (captureDisabled || cameraStore.isCapturing) {
      return;
    }
    setMenuOpen(false);
    triggerShutterHaptic();
    if (settingsStore.shutterSound) {
      playShutterClick();
    }
    setFocus('locked');
    cameraStore.setCapturing(true);
    try {
      await loaded.current;
      const flash = hardwareFlash(settingsStore.flashMode, hasFlash);
      const grabbed = await grabPhoto({
        ...flash,
        enableShutterSound: settingsStore.shutterSound,
      });
      if (!grabbed) {
        setFocus('idle');
        return;
      }
      const presetId = knownPreset(settingsStore.presetId);
      const baked = await bakeCapture(
        {
          source: grabbed.source,
          orientation: grabbed.orientation,
          preset: presetId,
          stamp,
          saveToRoll: settingsStore.saveToGallery,
        },
        {
          saveInApp: dataUri => storeBakedPhoto(cameraStore, dataUri, presetId),
          saveRoll: uri => cameraStore.saveToGallery(uri),
        },
      );
      setReviewUri(baked.uri);
      reviewTimer.current = setTimeout(clearReview, REVIEW_MS);
    } catch (error) {
      console.error('Error taking photo:', error);
      setFocus('idle');
    } finally {
      cameraStore.setCapturing(false);
    }
  };

  const openGallery = () => {
    clearReview();
    navigation.navigate('Gallery');
  };

  const openSettings = () => navigation.navigate('Settings');

  const openPresets = () => {
    setPendingPreset(knownPreset(settingsStore.presetId));
    setMenuOpen(true);
  };

  const applyPreset = () => {
    settingsStore.setPresetId(knownPreset(pendingPreset));
    setMenuOpen(false);
  };

  const takePhoto = () => void shutter();
  const preview = (
    <ViewfinderPlate
      preview={renderPreview({
        zoom,
        active: focused && reviewUri == null,
        sideways,
      })}
      reviewUri={reviewUri}
      presetId={activePreset}
      stamp={stamp}
      hudShotsRemaining={!expanded && overlay ? shotsRemaining : undefined}
      showGrid={settingsStore.showGridLines}
      busy={cameraStore.isCapturing}
    />
  );

  return (
    <View style={styles.root}>
      {focused ? <StatusBar style="dark" hidden={expanded} /> : null}
      {expanded ? (
        <View testID="expanded-viewfinder" style={styles.stage}>
          <View
            style={
              sideways
                ? sidewaysFrame(window.width, window.height)
                : StyleSheet.absoluteFill
            }>
            {preview}
          </View>
          <View
            testID="expanded-viewfinder-controls"
            style={[
              styles.actionBar,
              {
                paddingLeft: Math.max(12, insets.left),
                paddingRight: Math.max(12, insets.right),
                paddingBottom: Math.max(8, insets.bottom),
              },
            ]}>
            <ViewfinderAction
              label="Camera body"
              onPress={() => setExpanded(false)}
            />
            <ViewfinderAction label="Presets" onPress={openPresets} />
            <ViewfinderAction
              label="Shutter"
              onPress={takePhoto}
              disabled={captureDisabled || cameraStore.isCapturing}
              primary
            />
            <ViewfinderAction label="Playback" onPress={openGallery} />
          </View>
        </View>
      ) : (
        <View
          style={styles.stage}
          onLayout={({
            nativeEvent: {
              layout: {width, height},
            },
          }) =>
            setStageSize(current =>
              current.width === width && current.height === height
                ? current
                : {width, height},
            )
          }>
          {stageSize.width > 0 && stageSize.height > 0 ? (
            <SkinStage
              width={stageSize.width}
              height={stageSize.height}
              rotation={sideways ? 90 : 0}
              safeArea={insets}
              showLcd={overlay}
              preview={preview}
              lcd={{
                flashMode: settingsStore.flashMode,
                shotsRemaining,
                onOpenPlayback: openGallery,
                date: lcdDateLabel(settingsStore),
                focus,
                mode: reviewUri ? 'review' : 'live',
                batteryLevel: 1,
                animated: focus !== 'idle',
              }}
              onExpandViewfinder={() => setExpanded(true)}
              onShutter={
                captureDisabled || cameraStore.isCapturing
                  ? undefined
                  : takePhoto
              }
              onFlash={() => settingsStore.cycleFlash()}
              onZoomIn={() =>
                setZoom(current => stepZoom(current, 'in', minZoom, maxZoom))
              }
              onZoomOut={() =>
                setZoom(current => stepZoom(current, 'out', minZoom, maxZoom))
              }
              onMode={clearReview}
              onModeLongPress={() => settingsStore.toggleCameraPosition()}
              onReview={openGallery}
              onDisplay={() => setOverlay(value => !value)}
              onFunc={openPresets}
              onMenu={openSettings}
              onSet={openPresets}
            />
          ) : null}
        </View>
      )}
      <PresetPicker
        visible={menuOpen}
        sideways={sideways && !expanded}
        selectedId={pendingPreset}
        onSelect={setPendingPreset}
        onCancel={() => setMenuOpen(false)}
        onApply={applyPreset}
      />
    </View>
  );
});

function ViewfinderAction({
  label,
  onPress,
  primary = false,
  disabled = false,
}: {
  label: string;
  onPress: () => void;
  primary?: boolean;
  disabled?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({pressed}) => [
        styles.action,
        primary && styles.primary,
        disabled && styles.disabled,
        pressed && styles.pressed,
      ]}>
      <Text style={[styles.actionLabel, primary && styles.primaryLabel]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {flex: 1, backgroundColor: '#111111'},
  stage: {flex: 1},
  actionBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    paddingTop: 8,
    backgroundColor: '#181a20',
  },
  action: {
    flex: 1,
    maxWidth: 144,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#2a2e37',
  },
  actionLabel: {
    color: '#f4f7fb',
    fontWeight: '600',
    textAlign: 'center',
  },
  primary: {backgroundColor: '#f5c77d'},
  primaryLabel: {color: '#1a140d'},
  disabled: {opacity: 0.45},
  pressed: {opacity: 0.75},
});
