import React, {useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {observer} from 'mobx-react-lite';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {RootStackParamList} from '@navigation/types';
import {useStores} from '@stores/index';
import CameraControls from '@components/CameraControls';
import RotatedPowerShotSD1000Skin from '@components/cameraSkins/RotatedPowerShotSD1000Skin';

type CameraScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Camera'
>;

function pickImageFile(): Promise<string | null> {
  return new Promise(resolve => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) {
        resolve(null);
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        resolve(typeof reader.result === 'string' ? reader.result : null);
      };
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(file);
    };
    input.click();
  });
}

const CameraScreen: React.FC = () => {
  const navigation = useNavigation<CameraScreenNavigationProp>();
  const {cameraStore} = useStores();
  const insets = useSafeAreaInsets();

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

  const uploadPhoto = async () => {
    if (cameraStore.isCapturing) {
      return;
    }
    cameraStore.setCapturing(true);
    try {
      const dataUrl = await pickImageFile();
      if (dataUrl) {
        await cameraStore.importUploadedPhoto(dataUrl);
      }
    } catch (error) {
      console.error('Error uploading photo:', error);
    } finally {
      cameraStore.setCapturing(false);
    }
  };

  const {width, height} = Dimensions.get('window');
  const cameraWidth = width * 0.72;
  const cameraHeight = cameraWidth * 1.45;

  return (
    <View style={styles.container}>
      <View style={[styles.cameraContainer, {top: insets.top, bottom: 120}]}>
        <View style={styles.skinContainer}>
          <RotatedPowerShotSD1000Skin width={width} height={height} />
        </View>
        <View
          style={[
            styles.viewfinder,
            {width: cameraWidth, height: cameraHeight},
          ]}>
          <Text style={styles.viewfinderTitle}>Browser preview</Text>
          <Text style={styles.viewfinderText}>
            Live capture runs in the iOS and Android development build. Upload
            a photo to try the gallery and the Skia filter here.
          </Text>
          <TouchableOpacity style={styles.uploadButton} onPress={uploadPhoto}>
            <Text style={styles.uploadButtonText}>Upload photo</Text>
          </TouchableOpacity>
        </View>
      </View>

      <CameraControls
        onTakePhoto={uploadPhoto}
        onOpenGallery={() => navigation.navigate('Gallery')}
        onOpenSettings={() => navigation.navigate('Settings')}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  cameraContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 1,
    alignItems: 'center',
  },
  skinContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  viewfinder: {
    position: 'absolute',
    top: '9%',
    left: '8%',
    borderRadius: 5,
    borderWidth: 4,
    borderColor: '#55554F',
    backgroundColor: '#111',
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewfinderTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  viewfinderText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 16,
  },
  uploadButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 6,
  },
  uploadButtonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '600',
  },
});

export default observer(CameraScreen);
