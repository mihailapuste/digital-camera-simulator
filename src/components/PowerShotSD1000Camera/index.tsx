import React, {useImperativeHandle, forwardRef} from 'react';
import {View, StyleSheet, Dimensions, SafeAreaView} from 'react-native';
import {
  Camera,
  CameraDevice,
  usePhotoOutput,
} from 'react-native-vision-camera';
import {observer} from 'mobx-react-lite';
import {useStores} from '@stores/index';
import RotatedPowerShotSD1000Skin from '../cameraSkins/RotatedPowerShotSD1000Skin';

interface PowerShotSD1000CameraProps {
  device: CameraDevice;
  isActive: boolean;
}

export interface PowerShotSD1000CameraHandle {
  takePhoto: () => Promise<void>;
}

const PowerShotSD1000Camera = forwardRef<
  PowerShotSD1000CameraHandle,
  PowerShotSD1000CameraProps
>(({device, isActive}, ref) => {
  const photoOutput = usePhotoOutput();
  const {cameraStore, settingsStore} = useStores();

  const takePhoto = async () => {
    if (cameraStore.isCapturing) {
      return;
    }
    cameraStore.setCapturing(true);
    try {
      const photoFile = await photoOutput.capturePhotoToFile(
        {flashMode: settingsStore.flashMode},
        {},
      );
      await cameraStore.saveCapturedPhoto(photoFile.filePath);
    } catch (error) {
      console.error('Error taking photo:', error);
    } finally {
      cameraStore.setCapturing(false);
    }
  };

  useImperativeHandle(ref, () => ({
    takePhoto,
  }));

  const {width, height} = Dimensions.get('window');
  const cameraWidth = width * 0.72;
  const cameraHeight = cameraWidth * 1.45;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.skinContainer}>
        <RotatedPowerShotSD1000Skin width={width} height={height} />
      </View>

      <View
        style={[
          styles.cameraContainer,
          {width: cameraWidth, height: cameraHeight},
        ]}>
        <View style={StyleSheet.absoluteFill}>
          <Camera
            style={styles.camera}
            device={device}
            isActive={isActive}
            outputs={[photoOutput]}
            enableNativeZoomGesture={false}
          />
        </View>
      </View>
    </SafeAreaView>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  cameraContainer: {
    position: 'absolute',
    borderRadius: 5,
    overflow: 'hidden',
    borderWidth: 4,
    borderColor: '#55554F',
    top: '9%',
    left: '8%',
  },
  skinContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    top: 0,
  },
  camera: {
    width: '100%',
    height: '100%',
  },
});

PowerShotSD1000Camera.displayName = 'PowerShotSD1000Camera';

export default observer(PowerShotSD1000Camera);
