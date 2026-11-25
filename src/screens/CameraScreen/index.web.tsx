import React from 'react';
import {HeldCamera} from '@/camera/HeldCamera';

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

/**
 * The same sideways body as the phone. The shutter opens a file, bakes the
 * CCD look, and plays the result back on the LCD.
 */
const CameraScreen: React.FC = () => {
  return (
    <HeldCamera
      hasFlash={false}
      minZoom={1}
      maxZoom={4}
      emptyLabel="PUSH SHUTTER"
      renderPreview={() => null}
      grabPhoto={async () => {
        const dataUrl = await pickImageFile();
        if (!dataUrl) {
          return null;
        }
        return {source: dataUrl, orientation: 'up'};
      }}
    />
  );
};

export default CameraScreen;
