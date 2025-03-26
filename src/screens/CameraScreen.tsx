import React, {useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import {useCameraDevice, useCameraPermission} from 'react-native-vision-camera';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {observer} from 'mobx-react-lite';

import {RootStackParamList} from '@navigation/types';
import {useStores} from '@stores/index';
import PowerShotSD1000Camera, {
  PowerShotSD1000CameraHandle,
} from '../components/PowerShotSD1000Camera';

type CameraScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Camera'
>;

const CameraScreen: React.FC = () => {
  const navigation = useNavigation<CameraScreenNavigationProp>();
  const {hasPermission, requestPermission} = useCameraPermission();
  const device = useCameraDevice('back');
  const cameraRef = useRef<PowerShotSD1000CameraHandle>(null);

  // Get the camera store from our root store
  const {cameraStore} = useStores();

  // Request camera permission on component mount
  useEffect(() => {
    if (!hasPermission) {
      requestPermission();
    }
  }, [hasPermission, requestPermission]);

  // Function to navigate to settings screen
  const navigateToSettings = () => {
    navigation.navigate('Settings');
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
    <SafeAreaView style={styles.container}>
      {/* Main Camera Component with PowerShot Skin */}
      <View style={styles.cameraContainer}>
        <PowerShotSD1000Camera
          ref={cameraRef}
          device={device}
          isActive={true}
        />
      </View>

      {/* Bottom Controls Area */}
      <SafeAreaView style={styles.bottomControlsWrapper}>
        <View style={styles.bottomControlsContainer}>
          {/* Gallery Box (Left) */}
          <View style={styles.galleryBox}>
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
          </View>

          {/* Take Photo Button (Middle) */}
          <TouchableOpacity style={styles.takePhotoButton} onPress={takePhoto}>
            <View style={styles.takePhotoButtonInner} />
          </TouchableOpacity>

          {/* Settings Button (Right) */}
          <TouchableOpacity
            style={styles.settingsButton}
            onPress={navigateToSettings}>
            <Text style={styles.settingsButtonText}>⚙️</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </SafeAreaView>
  );
};

const {height} = Dimensions.get('window');
// Adjust camera height to account for safe area
const cameraHeight = height * 0.8; // Match the height in PowerShotSD1000Camera

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  cameraContainer: {
    height: cameraHeight,
    position: 'relative',
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
  bottomControlsWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  bottomControlsContainer: {
    paddingHorizontal: 20,
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

export default observer(CameraScreen);
