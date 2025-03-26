import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Image} from 'react-native';
import {observer} from 'mobx-react-lite';
import {useStores} from '@stores/index';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

interface CameraControlsProps {
  onTakePhoto: () => Promise<void>;
  onOpenGallery: () => void;
  onOpenSettings: () => void;
}

const CameraControls: React.FC<CameraControlsProps> = ({
  onTakePhoto,
  onOpenGallery,
  onOpenSettings,
}) => {
  const {cameraStore} = useStores();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.bottomControlsWrapper,
        {
          paddingBottom: insets.bottom,
        },
      ]}>
      <View style={styles.bottomControlsContainer}>
        {/* Gallery Box (Left) */}
        <TouchableOpacity
          style={styles.galleryBox}
          onPress={onOpenGallery}
          disabled={!cameraStore.lastImagePath}>
          {cameraStore.lastImagePath ? (
            <Image
              source={{uri: `file://${cameraStore.lastImagePath}`}}
              style={styles.galleryBoxImage}
            />
          ) : (
            <View style={styles.galleryBoxPlaceholder}>
              <Text style={styles.placeholderText}>No Photos</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Take Photo Button (Middle) */}
        <TouchableOpacity style={styles.takePhotoButton} onPress={onTakePhoto}>
          <View style={styles.takePhotoButtonInner} />
        </TouchableOpacity>

        {/* Settings Button (Right) */}
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={onOpenSettings}>
          <Text style={styles.settingsButtonText}>⚙️</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  bottomControlsWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 120, // Fixed height for controls area
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    zIndex: 100, // Higher z-index to ensure controls are above everything
    justifyContent: 'center',
  },
  bottomControlsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  // Gallery Box (Left)
  galleryBox: {
    width: 70,
    height: 70,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'white',
  },
  galleryBoxImage: {
    width: '100%',
    height: '100%',
  },
  galleryBoxPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
    textAlign: 'center',
  },
  // Take Photo Button (Middle)
  takePhotoButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  takePhotoButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'white',
  },
  // Settings Button (Right)
  settingsButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(33, 150, 243, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  settingsButtonText: {
    fontSize: 24,
  },
});

export default observer(CameraControls);
