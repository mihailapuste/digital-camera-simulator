import {config} from '../config';
import * as Toadly from 'react-native-toadly';
import RNShake from 'react-native-shake';

let hasBeenSetup = false;

export const SetupToadly = (): void => {
    if(!config.github.token || !config.github.repoOwner || !config.github.repoName) {
        throw new Error('Toadly configuration is not set up correctly');
    }

    if (hasBeenSetup) {
        return;
    }

    hasBeenSetup = true;

    try {
    Toadly.setup(
        config.github.token,
        config.github.repoOwner,
        config.github.repoName,
    );

    Toadly.enableAutomaticIssueSubmission();
    Toadly.startNetworkMonitoring();

    } catch (error) {
        console.error('Failed to setup Toadly:', error);
    }
};

export const showToadlyReportDialog = () => {
    if (!hasBeenSetup) {
        throw new Error('Toadly has not been setup');
    }
    
    try {
        Toadly.show();
    } catch (error) {
        console.error('Failed to show Toadly report dialog:', error);
    }
};
