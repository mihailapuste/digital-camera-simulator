import React, {useCallback, useState} from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  Alert,
  useWindowDimensions,
} from 'react-native';
import {observer} from 'mobx-react-lite';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import {useStores} from '@stores/index';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '@navigation/types';
import {Image} from 'expo-image';
import {FlashList} from '@shopify/flash-list';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {savePhotosToAlbum} from '@/services/photoLibrary';
import {sharePlaybackPhotos} from '@/services/sharePhotos';
import {presentSaveResult, presentShareOutcome} from '@/gallery/alerts';
import {formatPlaybackDate} from '@/gallery/format';
import {buildGalleryRows, type GalleryRow} from '@/gallery/groupPhotos';
import {shareFilename} from '@/gallery/sharePlan';
import type {GalleryPhoto} from '@/gallery/types';
import {mono, playback} from '@/gallery/theme';

type GalleryScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Gallery'
>;

const COLUMNS = 3;
const GAP = 4;

const GalleryScreen: React.FC = () => {
  const navigation = useNavigation<GalleryScreenNavigationProp>();
  const {cameraStore} = useStores();
  const [loading, setLoading] = useState(true);
  const [selecting, setSelecting] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [working, setWorking] = useState<'share' | 'delete' | 'save' | null>(
    null,
  );
  const {width} = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const cell = Math.floor((width - GAP * (COLUMNS + 1)) / COLUMNS);
  const photos = cameraStore.playbackPhotos;
  const rows = buildGalleryRows(photos, COLUMNS);

  const loadPhotos = useCallback(async () => {
    try {
      await cameraStore.loadPhotos();
    } catch (error) {
      console.error('Error loading photos:', error);
    } finally {
      setLoading(false);
    }
  }, [cameraStore]);

  useFocusEffect(
    useCallback(() => {
      loadPhotos();
    }, [loadPhotos]),
  );

  const leaveSelect = () => {
    setSelecting(false);
    setSelected([]);
  };

  const toggle = (uri: string) => {
    setSelected(current =>
      current.includes(uri)
        ? current.filter(item => item !== uri)
        : [...current, uri],
    );
  };

  const openPhoto = (photo: GalleryPhoto) => {
    const index = photos.findIndex(item => item.uri === photo.uri);
    navigation.navigate('ImageViewer', {initialIndex: Math.max(0, index)});
  };

  const chosen = photos.filter(photo => selected.includes(photo.uri));

  const shareChosen = async () => {
    if (chosen.length === 0 || working) {
      return;
    }
    setWorking('share');
    try {
      presentShareOutcome(await sharePlaybackPhotos(chosen));
    } finally {
      setWorking(null);
    }
  };

  const saveChosen = async () => {
    if (chosen.length === 0 || working) {
      return;
    }
    setWorking('save');
    try {
      presentSaveResult(
        await savePhotosToAlbum(
          chosen.map(photo => ({
            uri: photo.uri,
            filename: shareFilename(photo),
          })),
        ),
      );
    } finally {
      setWorking(null);
    }
  };

  const deleteChosen = () => {
    if (chosen.length === 0 || working) {
      return;
    }
    const count = chosen.length;
    Alert.alert(
      'Delete photos',
      count === 1
        ? `Delete ${chosen[0].fileNumber}?`
        : `Delete ${count} photos?`,
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            for (const photo of chosen) {
              cameraStore.removeImage(photo.uri);
            }
            leaveSelect();
          },
        },
      ],
    );
  };

  const renderItem = ({item}: {item: GalleryRow}) => {
    if (item.kind === 'day') {
      return (
        <View style={styles.dayRow}>
          <Text style={styles.dayLabel}>{item.label}</Text>
          <Text style={styles.dayCount}>
            {String(item.count).padStart(3, '0')}
          </Text>
        </View>
      );
    }
    return (
      <View style={styles.photoRow}>
        {item.photos.map(photo => {
          const isSelected = selected.includes(photo.uri);
          return (
            <TouchableOpacity
              key={photo.uri}
              testID={`photo-${photo.fileNumber}`}
              accessibilityRole="button"
              accessibilityLabel={`${photo.fileNumber}, ${formatPlaybackDate(photo.timestamp)}`}
              accessibilityState={{selected: isSelected}}
              activeOpacity={0.85}
              onPress={() => {
                if (selecting) {
                  toggle(photo.uri);
                  return;
                }
                openPhoto(photo);
              }}
              onLongPress={() => {
                setSelecting(true);
                setSelected(current =>
                  current.includes(photo.uri)
                    ? current
                    : [...current, photo.uri],
                );
              }}
              style={[
                styles.cell,
                {width: cell, height: cell},
                isSelected && styles.cellSelected,
              ]}>
              <Image
                source={{
                  uri: photo.uri,
                  cacheKey: `${photo.name}:${photo.revision}`,
                }}
                style={styles.thumb}
                contentFit="cover"
                recyclingKey={photo.name}
              />
              <View style={styles.caption}>
                <Text style={styles.fileNumber}>{photo.fileNumber}</Text>
                <Text style={styles.captionDate}>
                  {formatPlaybackDate(photo.timestamp)}
                </Text>
              </View>
              {selecting ? (
                <View style={[styles.check, isSelected && styles.checkOn]}>
                  <Text style={styles.checkMark}>{isSelected ? '✓' : ''}</Text>
                </View>
              ) : null}
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  return (
    <View
      style={[styles.container, {paddingTop: insets.top}]}
      testID="gallery-screen">
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel="Back to camera">
          <Text style={styles.headerSide}>CAM</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.title}>{selecting ? 'SELECT' : 'PLAYBACK'}</Text>
          <Text style={styles.count}>
            {selecting
              ? `${String(selected.length).padStart(3, '0')} PICKED`
              : `${String(photos.length).padStart(3, '0')} SHOTS`}
          </Text>
        </View>
        <View style={styles.headerActions}>
          {selecting ? (
            <TouchableOpacity onPress={leaveSelect} hitSlop={10}>
              <Text style={styles.headerSide}>DONE</Text>
            </TouchableOpacity>
          ) : photos.length > 0 ? (
            <TouchableOpacity
              onPress={() => setSelecting(true)}
              hitSlop={10}
              accessibilityRole="button"
              accessibilityLabel="Select photos">
              <Text style={styles.headerSide}>SEL</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.headerSpacer} />
          )}
        </View>
      </View>

      {loading && photos.length === 0 ? (
        <View style={styles.empty}>
          <ActivityIndicator size="large" color={playback.amber} />
          <Text style={styles.loadingText}>READING CARD</Text>
        </View>
      ) : photos.length > 0 ? (
        <View style={styles.list}>
          <FlashList
            testID="gallery-grid"
            data={rows}
            renderItem={renderItem}
            keyExtractor={item => item.id}
            getItemType={item => item.kind}
            extraData={`${selecting}:${selected.join('|')}:${cell}`}
            contentContainerStyle={{
              paddingBottom: (selecting ? 84 : 16) + insets.bottom,
            }}
          />
        </View>
      ) : (
        <View style={styles.empty} testID="gallery-empty">
          <View style={styles.lcd}>
            <Text style={styles.lcdTitle}>NO IMAGE</Text>
            <Text style={styles.lcdBody}>The card is empty.</Text>
          </View>
          <TouchableOpacity
            style={styles.cameraButton}
            onPress={() => navigation.navigate('Camera')}
            accessibilityRole="button"
            accessibilityLabel="Open the camera">
            <Text style={styles.cameraButtonText}>OPEN CAMERA</Text>
          </TouchableOpacity>
        </View>
      )}

      {selecting ? (
        <View
          style={[
            styles.actionBar,
            {paddingBottom: Math.max(insets.bottom, 12)},
          ]}>
          <ActionButton
            label="SHARE"
            disabled={chosen.length === 0 || working != null}
            onPress={shareChosen}
          />
          <ActionButton
            label="SAVE"
            disabled={chosen.length === 0 || working != null}
            onPress={saveChosen}
          />
          <ActionButton
            label="DEL"
            danger
            disabled={chosen.length === 0 || working != null}
            onPress={deleteChosen}
          />
        </View>
      ) : null}
    </View>
  );
};

const ActionButton = ({
  label,
  onPress,
  disabled,
  danger,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  danger?: boolean;
}) => (
  <TouchableOpacity
    style={[styles.action, disabled && styles.actionDisabled]}
    onPress={onPress}
    disabled={disabled}
    accessibilityRole="button">
    <Text style={[styles.actionText, danger && styles.actionDanger]}>
      {label}
    </Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: playback.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: playback.line,
    backgroundColor: playback.chrome,
  },
  headerCenter: {
    alignItems: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerSide: {
    color: playback.amberSoft,
    fontFamily: mono,
    fontSize: 14,
    letterSpacing: 1,
    minWidth: 44,
  },
  headerSpacer: {
    width: 44,
  },
  title: {
    color: playback.text,
    fontFamily: mono,
    fontSize: 15,
    letterSpacing: 2,
  },
  count: {
    color: playback.muted,
    fontFamily: mono,
    fontSize: 10,
    letterSpacing: 1,
    marginTop: 2,
  },
  list: {
    flex: 1,
  },
  dayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: GAP + 2,
    paddingTop: 14,
    paddingBottom: 6,
  },
  dayLabel: {
    color: playback.amber,
    fontFamily: mono,
    fontSize: 16,
    letterSpacing: 2,
  },
  dayCount: {
    color: playback.muted,
    fontFamily: mono,
    fontSize: 12,
    letterSpacing: 1,
  },
  photoRow: {
    flexDirection: 'row',
    gap: GAP,
    paddingHorizontal: GAP,
    marginBottom: GAP,
  },
  cell: {
    backgroundColor: '#000',
    overflow: 'hidden',
  },
  cellSelected: {
    borderWidth: 2,
    borderColor: playback.amber,
  },
  thumb: {
    width: '100%',
    height: '100%',
  },
  caption: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 4,
    paddingVertical: 3,
    backgroundColor: playback.scrim,
  },
  fileNumber: {
    color: playback.amberSoft,
    fontFamily: mono,
    fontSize: 10,
    letterSpacing: 0.4,
  },
  captionDate: {
    color: playback.text,
    fontFamily: mono,
    fontSize: 9,
    letterSpacing: 0.6,
  },
  check: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 18,
    height: 18,
    borderWidth: 1,
    borderColor: playback.amberSoft,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  checkOn: {
    backgroundColor: playback.amber,
    borderColor: playback.amber,
  },
  checkMark: {
    color: '#1A1004',
    fontSize: 12,
    fontWeight: '700',
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  loadingText: {
    color: playback.amber,
    fontFamily: mono,
    letterSpacing: 2,
    marginTop: 14,
  },
  lcd: {
    width: '100%',
    maxWidth: 280,
    borderWidth: 2,
    borderColor: playback.lcdEdge,
    backgroundColor: playback.lcd,
    paddingVertical: 28,
    paddingHorizontal: 18,
    alignItems: 'center',
  },
  lcdTitle: {
    color: playback.amber,
    fontFamily: mono,
    fontSize: 28,
    letterSpacing: 3,
  },
  lcdBody: {
    color: playback.amberSoft,
    fontFamily: mono,
    fontSize: 13,
    marginTop: 8,
  },
  cameraButton: {
    marginTop: 22,
    borderWidth: 1,
    borderColor: playback.amber,
    paddingVertical: 12,
    paddingHorizontal: 22,
  },
  cameraButtonText: {
    color: playback.amberSoft,
    fontFamily: mono,
    letterSpacing: 1.5,
    fontSize: 14,
  },
  actionBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 12,
    paddingTop: 10,
    backgroundColor: playback.chrome,
    borderTopWidth: 1,
    borderTopColor: playback.line,
  },
  action: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: playback.line,
  },
  actionDisabled: {
    opacity: 0.35,
  },
  actionText: {
    color: playback.amberSoft,
    fontFamily: mono,
    letterSpacing: 1,
    fontSize: 13,
  },
  actionDanger: {
    color: playback.danger,
  },
});

export default observer(GalleryScreen);
