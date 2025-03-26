import React, {useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import {useCameraDevice, useCameraPermission} from 'react-native-vision-camera';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {observer} from 'mobx-react-lite';

import {RootStackParamList} from '@navigation/types';
import {useStores} from '@stores/index';
import PowerShotSD1000Camera from '../components/PowerShotSD1000Camera';

type CameraScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Camera'
>;

const CameraScreen: React.FC = () => {
  const navigation = useNavigation<CameraScreenNavigationProp>();
  const {hasPermission, requestPermission} = useCameraPermission();
  const device = useCameraDevice('back');

  // Get the camera store from our root store
  const {cameraStore} = useStores();

  // Request camera permissions on component mount
  useEffect(() => {
    const checkPermission = async () => {
      if (!hasPermission) {
        await requestPermission();
      }
    };
    checkPermission();
  }, [hasPermission, requestPermission]);

  // Function to navigate to settings screen
  const navigateToSettings = () => {
    navigation.navigate('Settings');
  };

  // Function to save the last taken photo to the gallery
  const saveToGallery = async () => {
    if (!cameraStore.lastImagePath) {
      Alert.alert('Error', 'No photo to save');
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
      Alert.alert('Error', 'An error occurred while saving the photo');
      console.error('Error saving to gallery:', error);
    }
  };

  // If no permission, show a message
  if (!hasPermission) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionText}>
            Camera permission is required to use this app
          </Text>
          <TouchableOpacity
            style={styles.permissionButton}
            onPress={requestPermission}>
            <Text style={styles.permissionButtonText}>Grant Permission</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // If no device, show a message
  if (!device) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionText}>No camera device found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Main Camera Component with PowerShot Skin */}
      <View style={styles.cameraContainer}>
        <PowerShotSD1000Camera device={device} isActive={true} />
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

      {/* Gallery at the bottom */}
      {cameraStore.images.length > 0 && (
        <ScrollView horizontal style={styles.galleryContainer}>
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
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  cameraContainer: {
    flex: 1,
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
  previewContainer: {
    position: 'absolute',
    top: 20,
    left: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 10,
    padding: 5,
  },
  imagePreview: {
    width: 60,
    height: 60,
    borderRadius: 5,
  },
  saveButton: {
    marginLeft: 10,
    backgroundColor: '#2196F3',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 12,
  },
  settingsButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsButtonText: {
    fontSize: 24,
  },
  galleryContainer: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    height: 80,
    paddingHorizontal: 10,
  },
  galleryImage: {
    width: 70,
    height: 70,
    marginHorizontal: 5,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: 'white',
  },
});

export default observer(CameraScreen);
