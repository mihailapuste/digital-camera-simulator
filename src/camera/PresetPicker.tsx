import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {listPresets} from '../look';

type PresetPickerProps = {
  selectedId: string;
  onSelect: (id: string) => void;
};

/** On-LCD look list. It sits in the rotated plate, so it reads sideways. */
export function PresetPicker({selectedId, onSelect}: PresetPickerProps) {
  const presets = listPresets();
  return (
    <View testID="preset-picker" style={styles.scrim} pointerEvents="box-none">
      <View style={styles.panel}>
        <Text style={styles.title}>FUNC</Text>
        {presets.map(preset => {
          const selected = preset.id === selectedId;
          return (
            <Pressable
              key={preset.id}
              testID={`preset-${preset.id}`}
              accessibilityRole="button"
              accessibilityState={{selected}}
              onPress={() => onSelect(preset.id)}
              style={[styles.row, selected && styles.rowOn]}>
              <Text style={[styles.name, selected && styles.nameOn]}>
                {preset.name}
              </Text>
            </Pressable>
          );
        })}
        <Text style={styles.hint}>SET</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  scrim: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    paddingHorizontal: 18,
    backgroundColor: 'rgba(6, 8, 14, 0.35)',
  },
  panel: {
    backgroundColor: 'rgba(10, 14, 22, 0.92)',
    borderWidth: 2,
    borderColor: '#F4F7FB',
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  title: {
    color: '#F4F7FB',
    fontSize: 12,
    letterSpacing: 3,
    textAlign: 'center',
    marginBottom: 6,
    fontVariant: ['tabular-nums'],
  },
  row: {
    paddingVertical: 6,
    paddingHorizontal: 8,
    marginBottom: 3,
  },
  rowOn: {
    backgroundColor: '#1B2836',
    borderLeftWidth: 3,
    borderLeftColor: '#FF8A14',
  },
  name: {
    color: '#D5DCE6',
    fontSize: 15,
    letterSpacing: 0.4,
  },
  nameOn: {
    color: '#FFFFFF',
  },
  hint: {
    color: '#FF8A14',
    textAlign: 'center',
    letterSpacing: 2,
    fontSize: 11,
    marginTop: 4,
  },
});
