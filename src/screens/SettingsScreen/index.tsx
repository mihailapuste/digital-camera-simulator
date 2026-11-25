import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Switch,
} from 'react-native';
import {observer} from 'mobx-react-lite';
import {useNavigation} from '@react-navigation/native';
import {useStores} from '@stores/index';
import {showToadlyReportDialog, testCrashJs} from '@services/ToadlyService';
import {listPresets} from '@/look';

const SettingsScreen: React.FC = () => {
  const navigation = useNavigation();
  const {settingsStore} = useStores();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.reportButton}
          onPress={() => showToadlyReportDialog()}>
          <Text style={styles.reportButtonText}>Need Help?</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Flash Mode</Text>
          <View style={styles.settingOptions}>
            <TouchableOpacity
              style={[
                styles.optionButton,
                settingsStore.flashMode === 'off' && styles.optionButtonActive,
              ]}
              onPress={() => settingsStore.setFlashMode('off')}>
              <Text style={styles.optionText}>Off</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.optionButton,
                settingsStore.flashMode === 'on' && styles.optionButtonActive,
              ]}
              onPress={() => settingsStore.setFlashMode('on')}>
              <Text style={styles.optionText}>On</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.optionButton,
                settingsStore.flashMode === 'auto' && styles.optionButtonActive,
              ]}
              onPress={() => settingsStore.setFlashMode('auto')}>
              <Text style={styles.optionText}>Auto</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.optionButton,
                settingsStore.flashMode === 'red-eye' &&
                  styles.optionButtonActive,
              ]}
              onPress={() => settingsStore.setFlashMode('red-eye')}>
              <Text style={styles.optionText}>Red-eye</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.settingBlock}>
          <Text style={styles.settingLabel}>Look</Text>
          <View style={styles.chips}>
            {listPresets().map(preset => (
              <TouchableOpacity
                key={preset.id}
                style={[
                  styles.optionButton,
                  settingsStore.presetId === preset.id &&
                    styles.optionButtonActive,
                ]}
                onPress={() => settingsStore.setPresetId(preset.id)}>
                <Text style={styles.optionText}>{preset.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Camera</Text>
          <View style={styles.settingOptions}>
            <TouchableOpacity
              style={[
                styles.optionButton,
                settingsStore.cameraPosition === 'back' &&
                  styles.optionButtonActive,
              ]}
              onPress={() => settingsStore.setCameraPosition('back')}>
              <Text style={styles.optionText}>Back</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.optionButton,
                settingsStore.cameraPosition === 'front' &&
                  styles.optionButtonActive,
              ]}
              onPress={() => settingsStore.setCameraPosition('front')}>
              <Text style={styles.optionText}>Front</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Date stamp</Text>
          <Switch
            value={settingsStore.dateStampEnabled}
            onValueChange={value => settingsStore.setDateStampEnabled(value)}
            trackColor={{false: '#767577', true: '#2196F3'}}
            thumbColor={settingsStore.dateStampEnabled ? '#ffffff' : '#f4f3f4'}
          />
        </View>

        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Stamp format</Text>
          <TouchableOpacity
            style={styles.optionButton}
            onPress={() => settingsStore.cycleDateStampFormat()}>
            <Text style={styles.optionText}>
              {settingsStore.dateStampFormat}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Stamp year</Text>
          <View style={styles.settingOptions}>
            <TouchableOpacity
              style={[
                styles.optionButton,
                settingsStore.dateStampClock === 'retro-year' &&
                  styles.optionButtonActive,
              ]}
              onPress={() => settingsStore.setDateStampClock('retro-year')}>
              <Text style={styles.optionText}>{settingsStore.retroYear}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.optionButton,
                settingsStore.dateStampClock === 'current' &&
                  styles.optionButtonActive,
              ]}
              onPress={() => settingsStore.setDateStampClock('current')}>
              <Text style={styles.optionText}>Today</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Shutter sound</Text>
          <Switch
            value={settingsStore.shutterSound}
            onValueChange={value => settingsStore.setShutterSound(value)}
            trackColor={{false: '#767577', true: '#2196F3'}}
            thumbColor={settingsStore.shutterSound ? '#ffffff' : '#f4f3f4'}
          />
        </View>

        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Save to camera roll</Text>
          <Switch
            value={settingsStore.saveToGallery}
            onValueChange={value => settingsStore.setSaveToGallery(value)}
            trackColor={{false: '#767577', true: '#2196F3'}}
            thumbColor={settingsStore.saveToGallery ? '#ffffff' : '#f4f3f4'}
          />
        </View>

        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Grid Lines</Text>
          <Switch
            value={settingsStore.showGridLines}
            onValueChange={value => settingsStore.setShowGridLines(value)}
            trackColor={{false: '#767577', true: '#2196F3'}}
            thumbColor={settingsStore.showGridLines ? '#ffffff' : '#f4f3f4'}
          />
        </View>

        {__DEV__ ? (
          <TouchableOpacity
            style={styles.crashButton}
            onPress={() => testCrashJs()}>
            <Text style={styles.crashButtonText}>Test Crash</Text>
          </TouchableOpacity>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
};

export default observer(SettingsScreen);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: 'white',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  backButton: {
    position: 'absolute',
    left: 16,
  },
  backButtonText: {
    color: '#2196F3',
    fontSize: 16,
  },
  content: {
    flex: 1,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    marginBottom: 1,
  },
  settingLabel: {
    fontSize: 16,
  },
  settingOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    flex: 1,
    marginLeft: 12,
  },
  settingBlock: {
    padding: 16,
    backgroundColor: 'white',
    marginBottom: 1,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  optionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    marginLeft: 8,
    backgroundColor: '#f0f0f0',
  },
  optionButtonActive: {
    backgroundColor: '#2196F3',
  },
  optionText: {
    fontSize: 14,
    color: 'black',
  },
  reportButton: {
    position: 'absolute',
    right: 16,
  },
  reportButtonText: {
    color: '#2196F3',
    fontSize: 16,
  },
  crashButton: {
    color: '#2196F3',
    fontSize: 16,
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 4,
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    width: 200,
  },
  crashButtonText: {
    color: 'red',
    fontSize: 16,
  },
});
