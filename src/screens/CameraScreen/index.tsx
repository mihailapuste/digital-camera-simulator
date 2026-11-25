import React, {useEffect, useState} from 'react';
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
import {sidewaysFrame} from '@/camera/sidewaysFrame';

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
      captureDisabled={hasPermission && !device}
      renderPreview={({zoom, active, sideways}) => {
        if (!hasPermission || !device) {
          return (
            <View style={styles.blocked}>
              <Text style={styles.blockedText}>
                {hasPermission ? 'CAMERA UNAVAILABLE' : 'ALLOW CAMERA ACCESS'}
              </Text>
            </View>
          );
        }
        return (
          <NativePreview sideways={sideways}>
            <Camera
              style={StyleSheet.absoluteFill}
              device={device}
              isActive={active}
              zoom={zoom}
              outputs={[photoOutput]}
              resizeMode="cover"
              orientationSource="device"
              mirrorMode="auto"
              enableNativeZoomGesture={false}
              implementationMode="compatible"
            />
          </NativePreview>
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

// VisionCamera keeps its preview aligned with the native interface. Cancel
// the camera body's turn so the preview inherits the phone's physical grip.
function NativePreview({
  sideways,
  children,
}: {
  sideways: boolean;
  children: React.ReactNode;
}) {
  const [size, setSize] = useState({width: 0, height: 0});
  return (
    <View
      style={StyleSheet.absoluteFill}
      onLayout={({
        nativeEvent: {
          layout: {width, height},
        },
      }) =>
        setSize(current =>
          current.width === width && current.height === height
            ? current
            : {width, height},
        )
      }>
      {sideways ? (
        <View style={sidewaysFrame(size.width, size.height, false)}>
          {children}
        </View>
      ) : (
        children
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  blocked: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#343859',
  },
  blockedText: {
    color: '#f4f7fb',
    fontSize: 14,
    letterSpacing: 1,
    fontWeight: '700',
    textAlign: 'center',
    paddingHorizontal: 12,
  },
});

export default observer(CameraScreen);
