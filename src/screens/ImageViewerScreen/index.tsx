import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Alert,
  StatusBar,
  FlatList,
  ScrollView,
  ActivityIndicator,
  useWindowDimensions,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import {observer} from 'mobx-react-lite';
import {useNavigation, useRoute, RouteProp} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {RootStackParamList} from '@navigation/types';
import {useStores} from '@stores/index';
import {listPresets} from '@/look';
import {savePhotosToAlbum} from '@/services/photoLibrary';
import {sharePlaybackPhotos} from '@/services/sharePhotos';
import {presentSaveResult, presentShareOutcome} from '@/gallery/alerts';
import {shareFilename} from '@/gallery/sharePlan';
import {
  formatLongDate,
  formatPlaybackTime,
  formatStampDate,
} from '@/gallery/format';
import {presetLabel} from '@/gallery/presetLabel';
import type {GalleryPhoto} from '@/gallery/types';
import {mono, playback} from '@/gallery/theme';
import {bakeLegacyLook} from './bakeLegacy';
import ZoomablePhoto from './components/ZoomablePhoto';

type ImageViewerScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'ImageViewer'
>;

type ImageViewerScreenRouteProp = RouteProp<RootStackParamList, 'ImageViewer'>;

const presets = listPresets();

const ImageViewerScreen: React.FC = () => {
  const navigation = useNavigation<ImageViewerScreenNavigationProp>();
  const route = useRoute<ImageViewerScreenRouteProp>();
  const {cameraStore} = useStores();
  const insets = useSafeAreaInsets();
  const {width: windowWidth, height: windowHeight} = useWindowDimensions();
  const photos = cameraStore.playbackPhotos;
  const listRef = useRef<FlatList<GalleryPhoto>>(null);
  const [index, setIndex] = useState(route.params.initialIndex);
  const [infoOpen, setInfoOpen] = useState(false);
  const [applyOpen, setApplyOpen] = useState(false);
  const [presetId, setPresetId] = useState(presets[0]?.id ?? 'ccd-classic');
  const [scrollLocked, setScrollLocked] = useState(false);
  const [busy, setBusy] = useState<'share' | 'save' | 'bake' | null>(null);

  const safeIndex =
    photos.length === 0 ? 0 : Math.min(Math.max(index, 0), photos.length - 1);
  const photo = photos[safeIndex];
  const pageWidth = windowWidth - insets.left - insets.right;
  const [stageHeight, setStageHeight] = useState(0);

  useEffect(() => {
    if (photos.length === 0) {
      navigation.goBack();
    }
  }, [navigation, photos.length]);

  const signature = photos.map(item => item.uri).join('|');
  useEffect(() => {
    if (photos.length === 0 || pageWidth <= 0) {
      return;
    }
    const frame = requestAnimationFrame(() => {
      listRef.current?.scrollToIndex({
        index: safeIndex,
        animated: false,
      });
    });
    return () => cancelAnimationFrame(frame);
    // Resync after the set of frames changes (delete or a baked replacement).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signature, pageWidth]);

  const onScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (pageWidth <= 0) {
      return;
    }
    const next = Math.round(event.nativeEvent.contentOffset.x / pageWidth);
    if (next !== index && next >= 0 && next < photos.length) {
      setIndex(next);
      setScrollLocked(false);
      setApplyOpen(false);
    }
  };

  const onZoomedChange = useCallback((zoomed: boolean) => {
    setScrollLocked(zoomed);
  }, []);

  const shareCurrent = async () => {
    if (!photo || busy) {
      return;
    }
    setBusy('share');
    try {
      presentShareOutcome(await sharePlaybackPhotos([photo]));
    } finally {
      setBusy(null);
    }
  };

  const saveCurrent = async () => {
    if (!photo || busy) {
      return;
    }
    setBusy('save');
    try {
      presentSaveResult(
        await savePhotosToAlbum([
          {uri: photo.uri, filename: shareFilename(photo)},
        ]),
      );
    } finally {
      setBusy(null);
    }
  };

  const deleteCurrent = () => {
    if (!photo || busy) {
      return;
    }
    Alert.alert('Delete photo', `Delete ${photo.fileNumber}?`, [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          cameraStore.removeImage(photo.uri);
        },
      },
    ]);
  };

  const applyLook = async () => {
    if (!photo || photo.lookBaked || busy) {
      return;
    }
    setBusy('bake');
    try {
      const encoded = await bakeLegacyLook(
        photo.uri,
        presetId,
        photo.timestamp,
      );
      await cameraStore.replaceWithBakedPhoto(photo.uri, encoded, presetId);
      setApplyOpen(false);
      setInfoOpen(true);
    } catch (error) {
      console.error('Error applying a look:', error);
      Alert.alert('Apply look', 'Could not bake the look onto this photo.');
    } finally {
      setBusy(null);
    }
  };

  return (
    <View
      style={[
        styles.container,
        {paddingLeft: insets.left, paddingRight: insets.right},
      ]}
      testID="viewer-screen">
      <StatusBar hidden />
      <View style={[styles.header, {paddingTop: Math.max(insets.top, 10)}]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel="Back to playback">
          <Text style={styles.headerSide}>BACK</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.fileNumber} testID="viewer-file-number">
            {photo?.fileNumber ?? '----'}
          </Text>
          <Text style={styles.counter}>
            {photos.length === 0 ? '0/0' : `${safeIndex + 1}/${photos.length}`}
          </Text>
        </View>
        <View style={styles.headerSpacer} />
      </View>

      <View
        style={styles.stage}
        onLayout={({nativeEvent}) => setStageHeight(nativeEvent.layout.height)}>
        {stageHeight > 0 ? (
          <FlatList
            ref={listRef}
            data={photos}
            horizontal
            pagingEnabled
            scrollEnabled={!scrollLocked && busy !== 'bake'}
            showsHorizontalScrollIndicator={false}
            keyExtractor={item => `${item.name}:${item.revision}:${item.uri}`}
            initialScrollIndex={photos.length === 0 ? undefined : safeIndex}
            getItemLayout={(_data, itemIndex) => ({
              length: pageWidth,
              offset: pageWidth * itemIndex,
              index: itemIndex,
            })}
            onMomentumScrollEnd={onScrollEnd}
            onScrollEndDrag={onScrollEnd}
            onScrollToIndexFailed={info => {
              requestAnimationFrame(() => {
                listRef.current?.scrollToIndex({
                  index: info.index,
                  animated: false,
                });
              });
            }}
            renderItem={({item}) => (
              <View style={{width: pageWidth, height: stageHeight}}>
                <ZoomablePhoto
                  uri={item.uri}
                  cacheKey={`${item.name}:${item.revision}`}
                  width={pageWidth}
                  height={stageHeight}
                  active={item.uri === photo?.uri}
                  onZoomedChange={onZoomedChange}
                />
                {busy === 'bake' && item.uri === photo?.uri ? (
                  <View style={styles.baking}>
                    <ActivityIndicator color={playback.amber} />
                    <Text style={styles.bakingText}>BAKING</Text>
                  </View>
                ) : null}
              </View>
            )}
          />
        ) : null}
      </View>

      {infoOpen && photo && !applyOpen ? (
        <View style={styles.info} testID="viewer-info">
          <Text style={styles.infoFile}>{photo.fileNumber}</Text>
          <Text style={styles.infoLine}>{formatLongDate(photo.timestamp)}</Text>
          <Text style={styles.infoLine}>
            {formatPlaybackTime(photo.timestamp)}
            {'   '}
            {formatStampDate(photo.timestamp)}
          </Text>
          <Text style={styles.infoPreset}>
            {presetLabel(photo.presetId, photo.lookBaked)}
          </Text>
          {!photo.lookBaked ? (
            <TouchableOpacity
              style={styles.applyButton}
              onPress={() => setApplyOpen(true)}
              accessibilityRole="button"
              accessibilityLabel="Apply look">
              <Text style={styles.applyText}>APPLY LOOK</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      ) : null}

      {applyOpen && photo && !photo.lookBaked ? (
        <View style={styles.applyPanel}>
          <Text style={styles.applyTitle}>APPLY LOOK</Text>
          <ScrollView style={{maxHeight: Math.min(220, windowHeight * 0.32)}}>
            {presets.map(preset => {
              const selected = preset.id === presetId;
              return (
                <TouchableOpacity
                  key={preset.id}
                  style={[styles.presetRow, selected && styles.presetRowOn]}
                  onPress={() => setPresetId(preset.id)}
                  accessibilityRole="button"
                  accessibilityState={{selected}}>
                  <Text style={styles.presetName}>{preset.name}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
          <View style={styles.applyActions}>
            <TouchableOpacity
              style={styles.applySecondary}
              onPress={() => setApplyOpen(false)}
              disabled={busy === 'bake'}>
              <Text style={styles.applySecondaryText}>CANCEL</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.applyPrimary}
              onPress={applyLook}
              disabled={busy === 'bake'}>
              <Text style={styles.applyPrimaryText}>
                {busy === 'bake' ? 'BAKING' : 'BAKE'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : null}

      <View
        style={[styles.actions, {paddingBottom: Math.max(insets.bottom, 10)}]}>
        <ViewerButton
          label="INFO"
          active={infoOpen}
          onPress={() => {
            setApplyOpen(false);
            setInfoOpen(open => !open);
          }}
        />
        <ViewerButton
          label="SHARE"
          disabled={busy != null}
          onPress={shareCurrent}
        />
        <ViewerButton
          label="SAVE"
          disabled={busy != null}
          onPress={saveCurrent}
        />
        <ViewerButton
          label="DEL"
          danger
          disabled={busy != null}
          onPress={deleteCurrent}
        />
      </View>
    </View>
  );
};

const ViewerButton = ({
  label,
  onPress,
  disabled,
  danger,
  active,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  danger?: boolean;
  active?: boolean;
}) => (
  <TouchableOpacity
    style={[styles.viewerButton, active && styles.viewerButtonOn]}
    onPress={onPress}
    disabled={disabled}
    accessibilityRole="button">
    <Text
      style={[
        styles.viewerButtonText,
        danger && styles.viewerDanger,
        disabled && styles.viewerDisabled,
      ]}>
      {label}
    </Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingBottom: 10,
    backgroundColor: playback.chrome,
    borderBottomWidth: 1,
    borderBottomColor: playback.line,
  },
  headerSide: {
    color: playback.amberSoft,
    fontFamily: mono,
    letterSpacing: 1,
    fontSize: 14,
    minWidth: 56,
  },
  headerSpacer: {
    width: 56,
  },
  headerCenter: {
    alignItems: 'center',
  },
  fileNumber: {
    color: playback.amber,
    fontFamily: mono,
    fontSize: 18,
    letterSpacing: 1,
  },
  counter: {
    color: playback.muted,
    fontFamily: mono,
    fontSize: 11,
    marginTop: 2,
  },
  stage: {
    flex: 1,
    minHeight: 0,
    backgroundColor: '#000',
    overflow: 'hidden',
  },
  baking: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  bakingText: {
    color: playback.amber,
    fontFamily: mono,
    letterSpacing: 2,
    marginTop: 8,
  },
  info: {
    backgroundColor: playback.lcd,
    borderTopWidth: 1,
    borderTopColor: playback.lcdEdge,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  infoFile: {
    color: playback.amber,
    fontFamily: mono,
    fontSize: 20,
    letterSpacing: 1,
  },
  infoLine: {
    color: playback.text,
    fontFamily: mono,
    fontSize: 13,
    marginTop: 4,
    letterSpacing: 0.6,
  },
  infoPreset: {
    color: playback.amberSoft,
    fontFamily: mono,
    fontSize: 14,
    marginTop: 8,
    letterSpacing: 1,
  },
  applyButton: {
    alignSelf: 'flex-start',
    marginTop: 12,
    borderWidth: 1,
    borderColor: playback.amber,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  applyText: {
    color: playback.amber,
    fontFamily: mono,
    letterSpacing: 1,
    fontSize: 13,
  },
  applyPanel: {
    backgroundColor: playback.chrome,
    borderTopWidth: 1,
    borderTopColor: playback.line,
    paddingHorizontal: 12,
    paddingTop: 10,
  },
  applyTitle: {
    color: playback.amber,
    fontFamily: mono,
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  presetRow: {
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  presetRowOn: {
    backgroundColor: playback.selected,
  },
  presetName: {
    color: playback.text,
    fontFamily: mono,
    fontSize: 14,
  },
  applyActions: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 10,
  },
  applySecondary: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: playback.line,
  },
  applySecondaryText: {
    color: playback.muted,
    fontFamily: mono,
    letterSpacing: 1,
  },
  applyPrimary: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: playback.amber,
  },
  applyPrimaryText: {
    color: playback.amber,
    fontFamily: mono,
    letterSpacing: 1,
  },
  actions: {
    flexDirection: 'row',
    backgroundColor: playback.chrome,
    borderTopWidth: 1,
    borderTopColor: playback.line,
    paddingTop: 4,
  },
  viewerButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
  },
  viewerButtonOn: {
    borderTopWidth: 2,
    borderTopColor: playback.amber,
  },
  viewerButtonText: {
    color: playback.amberSoft,
    fontFamily: mono,
    letterSpacing: 1,
    fontSize: 13,
  },
  viewerDanger: {
    color: playback.danger,
  },
  viewerDisabled: {
    opacity: 0.4,
  },
});

export default observer(ImageViewerScreen);
