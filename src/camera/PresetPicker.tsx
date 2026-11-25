import React from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import {listPresets} from '../look';
import {sidewaysFrame} from './sidewaysFrame';

type PresetPickerProps = {
  visible: boolean;
  sideways: boolean;
  selectedId: string;
  onSelect: (id: string) => void;
  onCancel: () => void;
  onApply: () => void;
};

export function PresetPicker({
  visible,
  sideways,
  selectedId,
  onSelect,
  onCancel,
  onApply,
}: PresetPickerProps) {
  const {width, height} = useWindowDimensions();
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      supportedOrientations={['portrait', 'landscape']}
      onRequestClose={onCancel}>
      <View style={[styles.scrim, sideways && sidewaysFrame(width, height)]}>
        <View accessibilityViewIsModal style={styles.panel}>
          <Text accessibilityRole="header" style={styles.title}>
            Camera presets
          </Text>
          <ScrollView
            style={styles.list}
            contentContainerStyle={styles.options}>
            {listPresets().map(preset => {
              const selected = preset.id === selectedId;
              return (
                <Pressable
                  key={preset.id}
                  testID={`preset-${preset.id}`}
                  accessibilityRole="radio"
                  accessibilityState={{checked: selected}}
                  onPress={() => onSelect(preset.id)}
                  style={[styles.row, selected && styles.selected]}>
                  <Text style={styles.label}>{preset.name}</Text>
                  {selected ? (
                    <Text style={styles.check} accessible={false}>
                      ✓
                    </Text>
                  ) : null}
                </Pressable>
              );
            })}
          </ScrollView>
          <View style={styles.actions}>
            <Pressable
              accessibilityRole="button"
              onPress={onCancel}
              style={styles.action}>
              <Text style={styles.label}>Cancel</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={onApply}
              style={[styles.action, styles.apply]}>
              <Text style={styles.applyLabel}>Apply</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  scrim: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  panel: {
    width: '100%',
    maxWidth: 500,
    maxHeight: '100%',
    borderRadius: 20,
    padding: 16,
    backgroundColor: '#1b2028',
  },
  title: {
    color: '#f4f7fb',
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 12,
  },
  list: {
    flexGrow: 0,
    flexShrink: 1,
  },
  options: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  row: {
    width: '50%',
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  selected: {
    backgroundColor: '#333038',
  },
  label: {
    color: '#f4f7fb',
    fontSize: 16,
  },
  check: {
    color: '#f5c77d',
    fontSize: 18,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  action: {
    flex: 1,
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: '#303641',
  },
  apply: {
    backgroundColor: '#f5c77d',
  },
  applyLabel: {
    color: '#1a140d',
    fontWeight: '700',
    fontSize: 16,
  },
});
