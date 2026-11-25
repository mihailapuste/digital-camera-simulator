import React, {useEffect} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {
  Camera,
  CommonResolutions,
  useCameraDevice,
  useCameraPermission,
  usePhotoOutput,
} from 'react-native-vision-camera';
import {observer} from 'mobx-react-lite';
import {useStores} from '@stores/index';
import {HeldCamera} from '@/camera/HeldCamera';

const CameraScreen: React.FC = () => {
  const {settingsStore} = useStores();
  const {hasPermission, requestPermission} = useCameraPermission();
  const device = useCameraDevice(settingsStore.cameraPosition);
  const photoOutput = usePhotoOutput({
    targetResolution: CommonResolutions.QHD_4_3,
  });

  useEffect(() => {
    if (!hasPermission) {
      void requestPermission();
    }
  }, [hasPermission, requestPermission]);

  return (
    <HeldCamera
      hasFlash={device?.hasFlash === true}
      minZoom={device?.minZoom ?? 1}
      maxZoom={device?.maxZoom ?? device?.minZoom ?? 1}
      renderPreview={({zoom, active}) => {
        if (!hasPermission || !device) {
          return (
            <View style={styles.blocked}>
              <Text style={styles.blockedText}>
                {hasPermission ? 'NO LENS' : 'ALLOW CAMERA'}
              </Text>
            </View>
          );
        }
        return (
          <Camera
            style={StyleSheet.absoluteFill}
            device={device}
            isActive={active}
            zoom={zoom}
            outputs={[photoOutput]}
            resizeMode="cover"
            orientationSource="interface"
            mirrorMode="auto"
            enableNativeZoomGesture={false}
            implementationMode="compatible"
          />
        );
      }}
      grabPhoto={async flash => {
        if (!hasPermission) {
          await requestPermission();
          return null;
        }
        if (!device) {
          return null;
        }
        const photo = await photoOutput.capturePhoto(
          {
            flashMode: flash.flashMode,
            enableRedEyeReduction: flash.enableRedEyeReduction,
            enableShutterSound: flash.enableShutterSound,
          },
          {},
        );
        try {
          const bytes = new Uint8Array(await photo.getFileDataAsync());
          return {
            source: bytes,
            orientation: photo.orientation,
          };
        } finally {
          photo.dispose();
        }
      }}
    />
  );
};

const styles = StyleSheet.create({
  blocked: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1a2230',
  },
  blockedText: {
    color: '#F4F7FB',
    letterSpacing: 2,
    fontSize: 16,
    fontWeight: '700',
  },
});

export default observer(CameraScreen);
