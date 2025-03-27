import {types, flow, Instance, getRoot} from 'mobx-state-tree';
import {Platform, Alert} from 'react-native';
import {Camera} from 'react-native-vision-camera';
import RNFS from 'react-native-fs';
import {IRootStore} from './RootStore';
import {CameraRoll} from '@react-native-camera-roll/camera-roll';
import {hasAndroidCameraRollPermission} from '../utils/permissionsUtils';

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
  .actions(self => {
    // Define action methods that will be used by other actions
    const setCapturing = (isCapturing: boolean) => {
      self.isCapturing = isCapturing;
    };

    const addImage = (path: string) => {
      self.images.push(path);
      self.lastImagePath = path;
    };

    const rootStore = getRoot(self);

    return {
      // Add image path to the store
      addImage,

      // Set capturing status
      setCapturing,

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
            self.lastImagePath =
              self.images.length > 0 ? self.images[self.images.length - 1] : '';
          }
        }
      },

      // Load all photos from the app's directory
      loadPhotos: flow(function* () {
        try {
          // Determine the directory to read from based on platform
          const directory =
            Platform.OS === 'ios'
              ? RNFS.DocumentDirectoryPath
              : RNFS.ExternalDirectoryPath;

          console.log('Loading photos from directory:', directory);

          // Read the directory
          const files = yield RNFS.readDir(directory);
          console.log('Files found in directory:', files.length);

          // Log all files for debugging
          files.forEach((file: any) => {
            console.log('File:', file.name, file.path);
          });

          // Filter for image files (DigiCamSim_*.jpg)
          const imageFiles = files
            .filter(
              (file: any) =>
                file.name.startsWith('DigiCamSim_') &&
                file.name.endsWith('.jpg'),
            )
            .sort((a: any, b: any) => b.mtime.getTime() - a.mtime.getTime()); // Sort by modification time, newest first

          console.log('Filtered image files:', imageFiles.length);

          // Clear existing images
          self.images.clear();

          // Add all image paths to the store
          imageFiles.forEach((file: any) => {
            console.log('Adding image to store:', file.path);
            self.images.push(file.path);
          });

          // Set the last image path
          if (imageFiles.length > 0) {
            self.lastImagePath = imageFiles[0].path;
            console.log('Set last image path:', self.lastImagePath);
          } else {
            console.log('No images found');
          }

          return self.images;
        } catch (error) {
          console.error('Error loading photos:', error);
          return [];
        }
      }),

      // Load only the latest photo
      loadLatestPhoto: flow(function* () {
        try {
          // Determine the directory to read from based on platform
          const directory =
            Platform.OS === 'ios'
              ? RNFS.DocumentDirectoryPath
              : RNFS.ExternalDirectoryPath;

          console.log('Loading latest photo from directory:', directory);

          // Read the directory
          const files = yield RNFS.readDir(directory);

          // Filter for image files (DigiCamSim_*.jpg)
          const imageFiles = files
            .filter(
              (file: any) =>
                file.name.startsWith('DigiCamSim_') &&
                file.name.endsWith('.jpg'),
            )
            .sort((a: any, b: any) => b.mtime.getTime() - a.mtime.getTime()); // Sort by modification time, newest first

          // Set the last image path if any images found
          if (imageFiles.length > 0) {
            self.lastImagePath = imageFiles[0].path;
            console.log('Set last image path:', self.lastImagePath);
            return self.lastImagePath;
          } else {
            console.log('No images found');
            return null;
          }
        } catch (error) {
          console.error('Error loading latest photo:', error);
          return null;
        }
      }),

      // Take a photo using the camera and save it to the device
      takePhoto: flow(function* (camera: React.RefObject<Camera>) {
        if (!camera.current || self.isCapturing) {
          console.log('Camera is not available or is currently capturing');
          return null;
        }

        try {
          setCapturing(true);

          // Get the flash mode from the environment
          const flashMode = (rootStore as IRootStore).settingsStore
            .flashMode as 'on' | 'off' | 'auto' | undefined;

          // Take the photo
          const photo = yield camera.current.takePhoto({
            flash: flashMode,
          });

          console.log('Photo taken:', photo);

          // Get the path to save the photo
          const timestamp = new Date().getTime();
          const photoFileName = `DigiCamSim_${timestamp}.jpg`;

          // Determine the directory to save to based on platform
          const directory =
            Platform.OS === 'ios'
              ? RNFS.DocumentDirectoryPath
              : RNFS.ExternalDirectoryPath;

          const destPath = `${directory}/${photoFileName}`;

          console.log('Saving photo to:', destPath);

          // Move the photo from the cache to our app's directory
          yield RNFS.moveFile(photo.path, destPath);

          console.log('Photo saved to:', destPath);

          // Add the image to our store
          addImage(destPath);

          console.log('Image added to store:', destPath);

          return destPath;
        } catch (error) {
          console.error('Error taking photo:', error);
          return null;
        } finally {
          setCapturing(false);
        }
      }),

      // Save an image to the device gallery
      saveToGallery: flow(function* (imagePath: string) {
        try {
          console.log('Saving image to gallery:', imagePath);

          // Check for Android permissions
          if (Platform.OS === 'android') {
            const hasPermission = yield hasAndroidCameraRollPermission();
            if (!hasPermission) {
              Alert.alert(
                'Permission Required',
                'Camera roll permission is needed to save photos to your gallery.',
                [{text: 'OK'}]
              );
              return null;
            }
          }

          // Make sure the path starts with file:// for CameraRoll
          const formattedPath = imagePath.startsWith('file://')
            ? imagePath
            : `file://${imagePath}`;

          // Save to camera roll
          const result = yield CameraRoll.save(formattedPath, {
            type: 'photo',
            album: 'DigiCamSim',
          });

          console.log('Image saved to gallery:', result);
          return result;
        } catch (error) {
          console.error('Error saving to gallery:', error);
          throw error;
        }
      }),
    };
  });

export interface ICameraStore extends Instance<typeof CameraStore> {}
