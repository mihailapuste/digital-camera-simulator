import React, {useRef, useImperativeHandle, forwardRef} from 'react';
import {View, StyleSheet, Dimensions, SafeAreaView} from 'react-native';
import {Camera, CameraRuntimeError} from 'react-native-vision-camera';
import {observer} from 'mobx-react-lite';
import {useStores} from '@stores/index';
import RotatedPowerShotSD1000Skin from '../cameraSkins/RotatedPowerShotSD1000Skin';

interface PowerShotSD1000CameraProps {
  device: any;
  isActive: boolean;
}

export interface PowerShotSD1000CameraHandle {
  takePhoto: () => Promise<void>;
}

const PowerShotSD1000Camera = forwardRef<
  PowerShotSD1000CameraHandle,
  PowerShotSD1000CameraProps
>(({device, isActive}, ref) => {
  const cameraRef = useRef<Camera>(null);
  const {cameraStore} = useStores();

  const takePhoto = async () => {
    if (cameraRef.current) {
      try {
        // Create a properly typed reference to pass to the store
        const camera = {current: cameraRef.current};
        // Use the cameraStore's takePhoto method which handles saving the photo properly
        await cameraStore.takePhoto(camera);
      } catch (e) {
        if (e instanceof CameraRuntimeError) {
          console.error(`Error taking photo: ${e.message}`);
        } else {
          console.error('Unknown error taking photo:', e);
        }
      }
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
        {device && (
          <View style={StyleSheet.absoluteFill}>
            <Camera
              ref={cameraRef}
              format={device.formats[0]} // lowers quality of view
              style={styles.camera}
              device={device}
              isActive={isActive}
              photo={true}
              enableZoomGesture={false}
              videoStabilizationMode="off"
              photoHdr={true}
              fps={30} // 40 is not supported on all devices
            />
          </View>
        )}
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
    top: '7%',
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

export default observer(PowerShotSD1000Camera);
