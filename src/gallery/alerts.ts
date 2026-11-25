import {Alert, Linking} from 'react-native';
import type {SaveLibraryResult} from './saveAlbum';
import type {ShareOutcome} from './sharePlan';

export function presentShareOutcome(outcome: ShareOutcome): void {
  if (!outcome.ok) {
    Alert.alert('Share', outcome.message);
    return;
  }
  if (outcome.channel === 'download') {
    Alert.alert(
      'Share',
      outcome.count === 1
        ? 'Download started.'
        : `${outcome.count} downloads started.`,
    );
  }
}

export function presentSaveResult(result: SaveLibraryResult): void {
  if (!result.ok) {
    if (result.reason === 'denied') {
      Alert.alert(
        'Permission required',
        result.message,
        result.canAskAgain
          ? [{text: 'OK'}]
          : [
              {text: 'Cancel', style: 'cancel'},
              {
                text: 'Open Settings',
                onPress: () => {
                  void Linking.openSettings();
                },
              },
            ],
      );
      return;
    }
    Alert.alert('Save', result.message);
    return;
  }
  Alert.alert(
    'Saved',
    result.channel === 'download'
      ? 'Download started.'
      : 'Saved to the DigiCamSim album.',
  );
}
