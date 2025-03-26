import React, {useRef} from 'react';
import {View, StyleSheet, Dimensions} from 'react-native';
import {Camera, CameraRuntimeError} from 'react-native-vision-camera';
import {observer} from 'mobx-react-lite';
import {useStores} from '@stores/index';
import PowerShotSD1000Skin from '../cameraSkins/PowerShotSD1000Skin';

interface PowerShotSD1000CameraProps {
  device: any;
  isActive: boolean;
}

const PowerShotSD1000Camera: React.FC<PowerShotSD1000CameraProps> = ({
  device,
  isActive,
}) => {
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

  console.log('Camera dimensions:', {width, height});

  return (
    <View style={styles.container}>
      {/* Camera Preview */}
      <View style={styles.cameraContainer}>
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

      <PowerShotSD1000Skin width={width} height={height} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  cameraContainer: {
    flex: 1,
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  camera: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
});

const {width, height} = Dimensions.get('window');

export default observer(PowerShotSD1000Camera);
