import {types, flow, Instance} from 'mobx-state-tree';
import {Platform} from 'react-native';
import {Camera} from 'react-native-vision-camera';
import RNFS from 'react-native-fs';

/**
 * Store to handle camera operations and image storage
 */
export const CameraStore = types
  .model('CameraStore')
  .props({
    images: types.array(types.string),
    isCapturing: types.optional(types.boolean, false),
    lastImagePath: types.optional(types.string, ''),
  })
  .views(self => ({
    get imageCount() {
      return self.images.length;
    },
  }))
  .actions(self => ({
    // Add image path to the store
    addImage(path: string) {
      self.images.push(path);
      self.lastImagePath = path;
    },

    // Set capturing status
    setCapturing(isCapturing: boolean) {
      self.isCapturing = isCapturing;
    },

    // Clear all images
    clearImages() {
      self.images.clear();
      self.lastImagePath = '';
    },

    // Remove a specific image by path
    removeImage(path: string) {
      const index = self.images.findIndex(imagePath => imagePath === path);
      if (index !== -1) {
        self.images.splice(index, 1);

        // Delete the file from the device
        RNFS.unlink(path).catch(err => {
          console.error('Error deleting image file:', err);
        });

        // Update lastImagePath if needed
        if (self.lastImagePath === path) {
          self.lastImagePath = self.images.length > 0 ? self.images[self.images.length - 1] : '';
        }
      }
    },
  }))
  .actions(self => ({
    // Take a photo using the camera and save it to the device
    takePhoto: flow(function* (camera: React.RefObject<Camera>) {
      if (!camera.current || self.isCapturing) {
        return null;
      }

      try {
        self.setCapturing(true);

        // Take the photo
        const photo = yield camera.current.takePhoto({
          flash: 'off',
        });

        // Get the path to save the photo
        const timestamp = new Date().getTime();
        const fileName = `DigiCamSim_${timestamp}.jpg`;

        // Determine the directory to save to based on platform
        const directory = Platform.OS === 'ios'
          ? RNFS.DocumentDirectoryPath
          : RNFS.ExternalDirectoryPath;

        const destPath = `${directory}/${fileName}`;

        // Move the photo from the cache to our app's directory
        yield RNFS.moveFile(photo.path, destPath);

        // Add the image to our store
        self.addImage(destPath);

        return destPath;
      } catch (error) {
        console.error('Error taking photo:', error);
        return null;
      } finally {
        self.setCapturing(false);
      }
    }),

    // Save an image to the device's gallery/photos app
    saveToGallery: flow(function* (imagePath: string) {
      if (!imagePath) {
        return false;
      }

      try {
        // For Android, we need to use the CameraRoll module or MediaStore API
        // For iOS, we can use RNFS.copyFile to the Photos directory
        if (Platform.OS === 'ios') {
          // For iOS, we need to use the CameraRoll API or Photos framework
          // This is a simplified version
          const timestamp = new Date().getTime();
          const fileName = `DigiCamSim_${timestamp}.jpg`;
          const photoDir = RNFS.PicturesDirectoryPath;
          const destPath = `${photoDir}/${fileName}`;

          yield RNFS.copyFile(imagePath, destPath);
          return true;
        } else {
          // For Android, we would use the MediaStore API
          // This is a simplified version
          const timestamp = new Date().getTime();
          const fileName = `DigiCamSim_${timestamp}.jpg`;
          const photoDir = RNFS.PicturesDirectoryPath;
          const destPath = `${photoDir}/${fileName}`;

          yield RNFS.copyFile(imagePath, destPath);
          return true;
        }
      } catch (error) {
        console.error('Error saving to gallery:', error);
        return false;
      }
    }),
  }));

export interface ICameraStore extends Instance<typeof CameraStore> {}
