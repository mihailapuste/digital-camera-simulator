import {config} from '../config';

let hasBeenSetup = false;

/**
 * react-native-toadly is not an Expo module and is not part of this build.
 * Setup is a no-op when credentials are missing so a fresh clone still boots.
 * When credentials are present we only record that, and do not call native code.
 */
export const SetupToadly = (): void => {
  if (
    !config.github.token ||
    !config.github.repoOwner ||
    !config.github.repoName
  ) {
    return;
  }

  if (hasBeenSetup) {
    return;
  }

  hasBeenSetup = true;
  console.info(
    'GitHub credentials are set, but the native Toadly reporter is not bundled in this Expo build.',
  );
};

export const testCrashJs = () => {
  throw new Error('Test crash');
};

export const showToadlyReportDialog = () => {
  if (!hasBeenSetup) {
    console.info('Bug reports are unavailable until a reporter is configured.');
    return;
  }

  console.info('Bug reports are not available in this build.');
};
