import React from 'react';
import {Pressable, ScrollView, StyleSheet, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {observer} from 'mobx-react-lite';
import {useIsFocused, useNavigation} from '@react-navigation/native';
import {StatusBar} from 'expo-status-bar';
import Svg, {Path} from 'react-native-svg';
import {useStores} from '@stores/index';
import {GearIcon, LcdBackdrop, LcdLabel} from '@/components/LcdChrome';
import {MetalKey, MetalPanel} from '@/components/MetalPanel';
import {listPresets} from '@/look';

const WHITE = '#F4F1EA';
const AMBER = '#FFAA0A';
const INK = '#28231C';

const flashOptions = [
  {value: 'off', label: 'Off'},
  {value: 'on', label: 'On'},
  {value: 'auto', label: 'Auto'},
  {value: 'red-eye', label: 'Red-eye'},
] as const;

const cameraOptions = [
  {value: 'back', label: 'Back'},
  {value: 'front', label: 'Front'},
] as const;

const SettingsScreen: React.FC = () => {
  const navigation = useNavigation();
  const focused = useIsFocused();
  const insets = useSafeAreaInsets();
  const {settingsStore} = useStores();

  return (
    <View
      testID="settings-screen"
      style={[styles.screen, {paddingTop: insets.top}]}>
      {focused ? <StatusBar style="light" hidden={false} /> : null}
      <LcdBackdrop />
      <View style={[styles.header, {paddingLeft: insets.left + 17}]}>
        <GearIcon size={20} color={AMBER} />
        <LcdLabel text="SETTINGS" scale={1.8} color={WHITE} />
      </View>

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingLeft: insets.left + 12,
          paddingRight: insets.right + 12,
        }}>
        <SettingsRow label="Flash Mode" tall>
          <View style={styles.options}>
            {flashOptions.map(({value, label}) => (
              <Choice
                key={value}
                label={label}
                selected={settingsStore.flashMode === value}
                onPress={() => settingsStore.setFlashMode(value)}
              />
            ))}
          </View>
        </SettingsRow>

        <View style={styles.look}>
          <LcdLabel text="Look" scale={1.58} color={WHITE} />
          <View style={styles.presets}>
            {listPresets().map(preset => (
              <Choice
                key={preset.id}
                label={preset.name}
                selected={settingsStore.presetId === preset.id}
                onPress={() => settingsStore.setPresetId(preset.id)}
                preset
              />
            ))}
          </View>
        </View>

        <SettingsRow label="Camera">
          <View style={styles.options}>
            {cameraOptions.map(({value, label}) => (
              <Choice
                key={value}
                label={label}
                accessibilityLabel={`${label} camera`}
                selected={settingsStore.cameraPosition === value}
                onPress={() => settingsStore.setCameraPosition(value)}
                wide
              />
            ))}
          </View>
        </SettingsRow>

        <ToggleRow
          label="Date stamp"
          value={settingsStore.dateStampEnabled}
          onChange={settingsStore.setDateStampEnabled}
        />

        <SettingsRow label="Stamp format">
          <Choice
            label={settingsStore.dateStampFormat}
            accessibilityLabel={`Stamp format, ${settingsStore.dateStampFormat}`}
            onPress={settingsStore.cycleDateStampFormat}
            wide
          />
        </SettingsRow>

        <SettingsRow label="Stamp year">
          <View style={styles.options}>
            <Choice
              label={String(settingsStore.retroYear)}
              selected={settingsStore.dateStampClock === 'retro-year'}
              onPress={() => settingsStore.setDateStampClock('retro-year')}
              wide
            />
            <Choice
              label="Today"
              selected={settingsStore.dateStampClock === 'current'}
              onPress={() => settingsStore.setDateStampClock('current')}
              wide
            />
          </View>
        </SettingsRow>

        <ToggleRow
          label="Shutter sound"
          value={settingsStore.shutterSound}
          onChange={settingsStore.setShutterSound}
        />
        <ToggleRow
          label="Save to camera roll"
          value={settingsStore.saveToGallery}
          onChange={settingsStore.setSaveToGallery}
        />
        <ToggleRow
          label="Grid Lines"
          value={settingsStore.showGridLines}
          onChange={settingsStore.setShowGridLines}
        />
      </ScrollView>

      <View
        style={[
          styles.footer,
          {
            paddingLeft: insets.left,
            paddingRight: insets.right,
            paddingBottom: Math.max(10, insets.bottom),
          },
        ]}>
        <MetalPanel />
        <MetalKey
          label="Back"
          onPress={() => navigation.goBack()}
          style={styles.back}>
          <Svg width={23} height={21} viewBox="0 0 23 21" accessible={false}>
            <Path
              d="M20 10.5H4m7-7-7 7 7 7"
              fill="none"
              stroke="#41403B"
              strokeWidth={2.4}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
          <LcdLabel text="BACK" color="#41403B" scale={1.9} spoken={false} />
        </MetalKey>
      </View>
    </View>
  );
};

function SettingsRow({
  label,
  children,
  tall,
  spoken = true,
}: {
  label: string;
  children: React.ReactNode;
  tall?: boolean;
  spoken?: boolean;
}) {
  return (
    <View style={[styles.row, tall && styles.flashRow]}>
      <LcdLabel text={label} scale={1.58} color={WHITE} spoken={spoken} />
      {children}
    </View>
  );
}

function Choice({
  label,
  accessibilityLabel = label,
  onPress,
  selected,
  preset,
  wide,
}: {
  label: string;
  accessibilityLabel?: string;
  onPress: () => void;
  selected?: boolean;
  preset?: boolean;
  wide?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole={selected === undefined ? 'button' : 'radio'}
      accessibilityLabel={accessibilityLabel}
      accessibilityState={
        selected === undefined ? undefined : {checked: selected}
      }
      onPress={onPress}
      style={({pressed}) => [
        styles.choiceTarget,
        preset && styles.presetTarget,
        pressed && styles.pressed,
      ]}>
      <View
        style={[
          styles.choice,
          preset && styles.presetChoice,
          wide && styles.wideChoice,
          selected && styles.selected,
        ]}>
        <LcdLabel
          text={label}
          scale={1.45}
          color={selected ? INK : WHITE}
          spoken={false}
        />
      </View>
    </Pressable>
  );
}

function ToggleRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <SettingsRow label={label} spoken={false}>
      <Pressable
        accessibilityRole="switch"
        accessibilityLabel={label}
        accessibilityState={{checked: value}}
        onPress={() => onChange(!value)}
        style={({pressed}) => [styles.toggleTarget, pressed && styles.pressed]}>
        <View style={[styles.toggle, value && styles.toggleOn]}>
          <View style={styles.thumb} />
        </View>
      </Pressable>
    </SettingsRow>
  );
}

export default observer(SettingsScreen);

const styles = StyleSheet.create({
  screen: {flex: 1, backgroundColor: '#10131B'},
  header: {
    minHeight: 45,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#51545C',
    backgroundColor: 'rgba(20, 24, 33, 0.44)',
  },
  scroll: {flex: 1},
  row: {
    minHeight: 50,
    paddingHorizontal: 4,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#51545C',
  },
  flashRow: {minHeight: 68, paddingVertical: 5},
  options: {flexDirection: 'row', gap: 7},
  look: {
    paddingTop: 17,
    paddingBottom: 14,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#51545C',
  },
  presets: {
    marginTop: 9,
    marginHorizontal: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    columnGap: 8,
  },
  choiceTarget: {minHeight: 44, justifyContent: 'center'},
  presetTarget: {width: '48.5%', minHeight: 38},
  choice: {
    minHeight: 27,
    paddingHorizontal: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(232, 229, 218, 0.055)',
    borderWidth: 1.25,
    borderColor: '#8C8984',
    borderRadius: 5,
  },
  presetChoice: {minHeight: 30},
  wideChoice: {minWidth: 66, paddingHorizontal: 11},
  selected: {backgroundColor: AMBER, borderColor: AMBER},
  pressed: {opacity: 0.75},
  toggleTarget: {
    minHeight: 44,
    minWidth: 46,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  toggle: {
    width: 45,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.25,
    borderColor: '#898783',
    backgroundColor: '#22242A',
    justifyContent: 'center',
    paddingHorizontal: 1.25,
  },
  toggleOn: {
    backgroundColor: AMBER,
    borderColor: AMBER,
    alignItems: 'flex-end',
  },
  thumb: {
    width: 19,
    height: 19,
    borderRadius: 10,
    borderWidth: 0.8,
    borderColor: '#9E968C',
    backgroundColor: '#DCD3C8',
  },
  footer: {
    alignItems: 'center',
    paddingTop: 10,
    backgroundColor: '#DCD0C4',
  },
  back: {width: 202, height: 55, flexDirection: 'row', gap: 11},
});
