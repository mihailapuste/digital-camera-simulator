import React, {useCallback, useRef} from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  Image,
  Alert,
  ScrollView,
} from 'react-native';
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
} from 'react-native-vision-camera';
import {observer} from 'mobx-react-lite';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '@navigation/types';
import {useStores} from '@stores/index';

type CameraScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Camera'
>;

const CameraScreen: React.FC = () => {
  const navigation = useNavigation<CameraScreenNavigationProp>();
  const {hasPermission, requestPermission} = useCameraPermission();
  const device = useCameraDevice('back');
  const cameraRef = useRef<Camera>(null);

  // Get the camera store from our root store
  const {cameraStore} = useStores();

  // Request camera permissions on component mount
  React.useEffect(() => {
    if (!hasPermission) {
      requestPermission();
    }
  }, [hasPermission, requestPermission]);

  // Handle camera errors
  const onError = useCallback((error: Error) => {
    console.error('Camera error:', error);
  }, []);

  const navigateToSettings = () => {
    navigation.navigate('Settings');
  };

  // Take a photo using the camera
  const takePhoto = async () => {
    try {
      const imagePath = await cameraStore.takePhoto(cameraRef);
      if (imagePath) {
        console.log('Photo taken and saved to:', imagePath);
      } else {
        console.log('Failed to take photo');
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo');
    }
  };

  // Save the last taken photo to the gallery
  const saveToGallery = async () => {
    if (!cameraStore.lastImagePath) {
      Alert.alert('No Photo', 'Take a photo first');
      return;
    }

    try {
      const success = await cameraStore.saveToGallery(
        cameraStore.lastImagePath,
      );
      if (success) {
        Alert.alert('Success', 'Photo saved to gallery');
      } else {
        Alert.alert('Error', 'Failed to save photo to gallery');
      }
    } catch (error) {
      console.error('Error saving to gallery:', error);
      Alert.alert('Error', 'Failed to save photo to gallery');
    }
  };

  // Render loading view while waiting for camera
  if (device == null) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Loading camera...</Text>
      </View>
    );
  }

  // Render permission view if permissions not granted
  if (!hasPermission) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>
          Camera permission is required to use the camera
        </Text>
        <TouchableOpacity
          style={styles.permissionButton}
          onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      <Camera
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={true}
        photo={true}
        video={false}
        audio={false}
        onError={onError}
      />

      {/* Camera controls overlay */}
      <View style={styles.controlsContainer}>
        <TouchableOpacity style={styles.captureButton} onPress={takePhoto} />
      </View>

      {/* Last image preview and save button */}
      {cameraStore.lastImagePath ? (
        <View style={styles.previewContainer}>
          <Image
            source={{uri: `file://${cameraStore.lastImagePath}`}}
            style={styles.imagePreview}
          />
          <TouchableOpacity style={styles.saveButton} onPress={saveToGallery}>
            <Text style={styles.saveButtonText}>Save to Gallery</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {/* Settings button */}
      <TouchableOpacity
        style={styles.settingsButton}
        onPress={navigateToSettings}>
        <Text style={styles.settingsButtonText}>⚙️</Text>
      </TouchableOpacity>

      {/* Image gallery */}
      {cameraStore.images.length > 0 && (
        <View style={styles.galleryContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {cameraStore.images.map((imagePath, index) => (
              <TouchableOpacity
                key={`${imagePath}-${index}`}
                onPress={() =>
                  Alert.alert('Image Options', 'What would you like to do?', [
                    {
                      text: 'Delete',
                      onPress: () => cameraStore.removeImage(imagePath),
                      style: 'destructive',
                    },
                    {
                      text: 'Save to Gallery',
                      onPress: () => cameraStore.saveToGallery(imagePath),
                    },
                    {
                      text: 'Cancel',
                      style: 'cancel',
                    },
                  ])
                }>
                <Image
                  source={{uri: `file://${imagePath}`}}
                  style={styles.galleryImage}
                />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </SafeAreaView>
  );
};

export default observer(CameraScreen);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  text: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    padding: 20,
  },
  permissionButton: {
    backgroundColor: '#2196F3',
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 50,
    marginTop: 20,
  },
  permissionButtonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  controlsContainer: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'white',
    borderWidth: 5,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  settingsButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsButtonText: {
    fontSize: 24,
  },
  previewContainer: {
    position: 'absolute',
    top: 50,
    left: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 10,
    padding: 5,
    alignItems: 'center',
  },
  imagePreview: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  saveButton: {
    marginTop: 5,
    backgroundColor: '#4CAF50',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 12,
  },
  galleryContainer: {
    position: 'absolute',
    bottom: 120,
    left: 0,
    right: 0,
    height: 80,
    paddingHorizontal: 10,
  },
  galleryImage: {
    width: 60,
    height: 60,
    borderRadius: 5,
    marginRight: 10,
    borderWidth: 2,
    borderColor: 'white',
  },
});
