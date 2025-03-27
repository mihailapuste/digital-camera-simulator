import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  Modal,
} from 'react-native';
import {useCameraDevice, useCameraPermission} from 'react-native-vision-camera';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {observer} from 'mobx-react-lite';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {RootStackParamList} from '@navigation/types';
import {useStores} from '@stores/index';
import PowerShotSD1000Camera, {
  PowerShotSD1000CameraHandle,
} from '@components/PowerShotSD1000Camera';
import CameraControls from '@components/CameraControls';

type CameraScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Camera'
>;

const CameraScreen: React.FC = () => {
  const navigation = useNavigation<CameraScreenNavigationProp>();
  const {hasPermission, requestPermission} = useCameraPermission();
  const device = useCameraDevice('back');
  const cameraRef = useRef<PowerShotSD1000CameraHandle>(null);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const insets = useSafeAreaInsets(); // Get safe area insets

  // Get the camera store from our root store
  const {cameraStore} = useStores();

  // Request camera permission on component mount
  useEffect(() => {
    if (!hasPermission) {
      requestPermission();
    }
  }, [hasPermission, requestPermission]);

  // Load the latest photo when the app starts
  useEffect(() => {
    const loadLatestPhoto = async () => {
      try {
        await cameraStore.loadLatestPhoto();
      } catch (error) {
        console.error('Error loading latest photo:', error);
      }
    };

    loadLatestPhoto();
  }, [cameraStore]);

  // Function to navigate to settings screen
  const navigateToSettings = () => {
    navigation.navigate('Settings');
  };

  const navigateToGallery = () => {
    navigation.navigate('Gallery');
  };

  // Function to take a photo
  const takePhoto = async () => {
    try {
      if (cameraRef.current) {
        await cameraRef.current.takePhoto();
      }
    } catch (error) {
      console.error('Error taking photo:', error);
    }
  };

  // Function to close the photo modal
  const closePhotoModal = () => {
    setShowPhotoModal(false);
  };

  // If no permission, show a message
  if (!hasPermission) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>
          We need your permission to use the camera
        </Text>
        <TouchableOpacity
          style={styles.permissionButton}
          onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // If no device found, show a message
  if (!device) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>No camera device found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Main Camera Component with PowerShot Skin */}
      <View
        style={[
          styles.cameraContainer,
          {
            // Respect safe area at the top
            top: insets.top,
            // Leave space for controls at the bottom
            bottom: controlsHeight,
          },
        ]}>
        <PowerShotSD1000Camera
          ref={cameraRef}
          device={device}
          isActive={true}
        />
      </View>

      {/* Camera Controls Component */}
      <CameraControls
        onTakePhoto={takePhoto}
        onOpenGallery={navigateToGallery}
        onOpenSettings={navigateToSettings}
      />

      {/* Photo Modal */}
      <Modal
        visible={showPhotoModal}
        transparent={true}
        animationType="fade"
        onRequestClose={closePhotoModal}>
        <View style={styles.modalContainer}>
          <TouchableOpacity
            style={styles.modalCloseButton}
            onPress={closePhotoModal}>
            <Text style={styles.modalCloseButtonText}>✕</Text>
          </TouchableOpacity>
          {cameraStore.lastImagePath && (
            <Image
              source={{uri: `file://${cameraStore.lastImagePath}`}}
              style={styles.modalImage}
              resizeMode="contain"
            />
          )}
        </View>
      </Modal>
    </View>
  );
};

const {width, height} = Dimensions.get('window');
// Calculate control area height (approximately 20% of screen height)
const controlsHeight = 120; // Fixed height for controls area

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  cameraContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 1, // Lower z-index for camera container
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  permissionText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  permissionButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  permissionButtonText: {
    color: 'white',
    fontSize: 16,
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 200, // Highest z-index for the modal
  },
  modalImage: {
    width: width * 0.9,
    height: height * 0.7,
    borderRadius: 10,
  },
  modalCloseButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  modalCloseButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default observer(CameraScreen);
