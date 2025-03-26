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
        // Use the takePhoto method from CameraStore directly with the camera reference
        const camera = cameraRef.current;
        await camera
          .takePhoto({
            flash: 'off',
          })
          .then(photo => {
            // Process the photo after taking it
            cameraStore.addImage(photo.path);
            // The addImage method already sets the lastImagePath
          });
      } catch (e) {
        if (e instanceof CameraRuntimeError) {
          console.error(`Error taking photo: ${e.message}`);
        } else {
          console.error('Unknown error taking photo:', e);
        }
      }
    }
  };

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    takePhoto,
  }));

  // Calculate camera dimensions with 3/4 aspect ratio
  // We'll make the camera fill the width of the container
  const {width, height} = Dimensions.get('window');
  const cameraWidth = width * 0.75; // 75% of the width
  const cameraHeight = cameraWidth * (4 / 3); // 4:3 aspect ratio

  return (
    <SafeAreaView style={styles.container}>
      {/* Skin Layer (Bottom) */}
      <View style={styles.skinContainer}>
        <RotatedPowerShotSD1000Skin width={width} height={height} />
      </View>
      {/* Camera Preview Layer (Top) */}
      <View style={[styles.cameraContainer, {width: cameraWidth, height: cameraHeight}]}>
        {device && (
          <Camera
            ref={cameraRef}
            style={styles.camera}
            device={device}
            isActive={isActive}
            photo={true}
          />
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
    borderRadius: 8,
    overflow: 'hidden',
    zIndex: 10, // Ensure camera is on top of skin but below controls
    top: '5%', // Position the camera closer to the top of the skin
  },
  skinContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    top: 0,
    zIndex: 5, // Below the camera
  },
  camera: {
    width: '100%',
    height: '100%',
  },
});

export default observer(PowerShotSD1000Camera);
