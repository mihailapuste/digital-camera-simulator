import React, {useRef, useImperativeHandle, forwardRef} from 'react';
import {View, StyleSheet, Dimensions} from 'react-native';
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

const PowerShotSD1000Camera = forwardRef<PowerShotSD1000CameraHandle, PowerShotSD1000CameraProps>(
  ({device, isActive}, ref) => {
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

    console.log('Camera dimensions:', {width, height});

    // Calculate camera container height to leave space at the bottom for controls
    // Using 80% of the screen height for the camera
    const cameraHeight = height * 0.8;

    return (
      <View style={styles.container}>
        {/* Camera Preview */}
        <View style={[styles.cameraContainer, { height: cameraHeight }]}>
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

        <View style={[styles.skinContainer, { height: cameraHeight }]}>
          <RotatedPowerShotSD1000Skin width={width} height={cameraHeight} />
        </View>

        {/* Space for controls */}
        <View style={styles.controlsContainer}>
          {/* Controls will be added here */}
        </View>
      </View>
    );
  }
);

const {width, height} = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  cameraContainer: {
    position: 'absolute',
    width: '100%',
    top: 0,
  },
  skinContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    top: 0,
  },
  camera: {
    width: '100%',
    height: '100%',
  },
  controlsContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: height * 0.2, // 20% of screen height for controls
    backgroundColor: 'transparent',
  },
});

export default observer(PowerShotSD1000Camera);
