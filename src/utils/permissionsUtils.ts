import { Platform, PermissionsAndroid } from 'react-native';
import { CameraRoll } from '@react-native-camera-roll/camera-roll';

/**
 * Checks and requests permission to access the camera roll on Android
 * iOS permissions are handled through Info.plist
 *
 * @returns {Promise<boolean>} Whether permission was granted
 */
export async function hasAndroidCameraRollPermission() {
  if (Platform.OS !== 'android') {
    return true; // iOS permissions are handled through Info.plist
  }

  const getCheckPermissionPromise = () => {
    if (parseInt(Platform.Version as string, 10) >= 33) {
      return Promise.all([
        PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES),
        PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO),
      ]).then(
        ([hasReadMediaImagesPermission, hasReadMediaVideoPermission]) =>
          hasReadMediaImagesPermission && hasReadMediaVideoPermission,
      );
    } else {
      return PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE);
    }
  };

  const hasPermission = await getCheckPermissionPromise();
  if (hasPermission) {
    return true;
  }

  const getRequestPermissionPromise = () => {
    if (parseInt(Platform.Version as string, 10) >= 33) {
      return PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
        PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO,
      ]).then(
        (statuses) =>
          statuses[PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES] ===
            PermissionsAndroid.RESULTS.GRANTED &&
          statuses[PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO] ===
            PermissionsAndroid.RESULTS.GRANTED,
      );
    } else {
      return PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE
      ).then((status) => status === PermissionsAndroid.RESULTS.GRANTED);
    }
  };

  return await getRequestPermissionPromise();
}

/**
 * Save an image to the camera roll after checking permissions
 *
 * @param {string} uri - The URI of the image to save
 * @param {object} options - Options for saving (type, album)
 * @returns {Promise<string|null>} The URI of the saved image or null if failed
 */
export async function saveImageToCameraRoll(
  uri: string,
  options: { type?: 'photo' | 'video', album?: string } = {}
): Promise<string | null> {
  try {
    // Check permissions on Android
    if (Platform.OS === 'android' && !(await hasAndroidCameraRollPermission())) {
      console.log('Camera roll permission denied');
      return null;
    }

    // Save to camera roll
    const savedUri = await CameraRoll.save(uri, options);
    return savedUri;
  } catch (error) {
    console.error('Error saving to camera roll:', error);
    return null;
  }
}
