import React, {useEffect, useRef, useState} from 'react';
import {StyleSheet, useWindowDimensions, View} from 'react-native';
import {useIsFocused, useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
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
  renderPreview: (state: {zoom: number; active: boolean}) => React.ReactNode;
  grabPhoto: (flash: {
    flashMode: 'off' | 'on' | 'auto';
    enableRedEyeReduction: boolean;
    enableShutterSound: boolean;
  }) => Promise<GrabbedPhoto | null>;
  emptyLabel?: string;
};

function knownPreset(id: string): string {
  try {
    return getPreset(id).id;
  } catch {
    return 'ccd-classic';
  }
}

/**
 * The portrait phone holds the sideways LUMEN L-80. Button hits come from
 * the rotated skin; the plate (preview, grade, stamp, menu) turns with it.
 */
export const HeldCamera = observer(function HeldCamera({
  hasFlash,
  minZoom,
  maxZoom,
  renderPreview,
  grabPhoto,
  emptyLabel,
}: HeldCameraProps) {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const {settingsStore, cameraStore} = useStores();
  const insets = useSafeAreaInsets();
  const window = useWindowDimensions();
  const focused = useIsFocused();
  const [powered, setPowered] = useState(true);
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

  const clearReview = () => {
    if (reviewTimer.current) {
      clearTimeout(reviewTimer.current);
      reviewTimer.current = null;
    }
    setReviewUri(null);
    setFocus('idle');
  };

  const activePreset = knownPreset(
    menuOpen ? pendingPreset : settingsStore.presetId,
  );
  const stamp = stampFromSettings(settingsStore);
  const shotsRemaining = Math.max(0, CARD_FRAMES - cameraStore.imageCount);
  const stageWidth = window.width;
  const stageHeight = Math.max(1, window.height - insets.top - insets.bottom);

  const shutter = async () => {
    if (!powered || cameraStore.isCapturing) {
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

  return (
    <View style={[styles.root, {paddingTop: insets.top, paddingBottom: insets.bottom}]}>
      <SkinStage
        width={stageWidth}
        height={stageHeight}
        showLcd={powered && overlay}
        preview={
          <ViewfinderPlate
            preview={renderPreview({
              zoom,
              active: focused && powered && reviewUri == null,
            })}
            reviewUri={reviewUri}
            presetId={activePreset}
            stamp={stamp}
            showGrid={settingsStore.showGridLines}
            powered={powered}
            busy={cameraStore.isCapturing}
            emptyLabel={emptyLabel}
          />
        }
        foreground={
          powered && menuOpen ? (
            <PresetPicker
              selectedId={pendingPreset}
              onSelect={setPendingPreset}
            />
          ) : null
        }
        lcd={{
          flashMode: settingsStore.flashMode,
          shotsRemaining,
          date: lcdDateLabel(settingsStore),
          focus,
          mode: reviewUri ? 'review' : 'live',
          batteryLevel: 1,
          animated: focus !== 'idle',
        }}
        onShutter={() => {
          void shutter();
        }}
        onFlash={() => {
          if (powered) {
            settingsStore.cycleFlash();
          }
        }}
        onZoomIn={() => {
          if (powered) {
            setZoom(current => stepZoom(current, 'in', minZoom, maxZoom));
          }
        }}
        onZoomOut={() => {
          if (powered) {
            setZoom(current => stepZoom(current, 'out', minZoom, maxZoom));
          }
        }}
        onMode={() => {
          clearReview();
        }}
        onModeLongPress={() => {
          settingsStore.toggleCameraPosition();
        }}
        onReview={() => {
          clearReview();
          navigation.navigate('Gallery');
        }}
        onPower={() => {
          setPowered(value => !value);
          setMenuOpen(false);
          clearReview();
        }}
        onDisplay={() => {
          if (powered) {
            setOverlay(value => !value);
          }
        }}
        onFunc={() => {
          if (!powered) {
            return;
          }
          setMenuOpen(open => {
            if (open) {
              return false;
            }
            setPendingPreset(knownPreset(settingsStore.presetId));
            return true;
          });
        }}
        onMenu={() => {
          navigation.navigate('Settings');
        }}
        onSet={() => {
          if (!menuOpen) {
            return;
          }
          settingsStore.setPresetId(knownPreset(pendingPreset));
          setMenuOpen(false);
        }}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0c0d10',
  },
});
