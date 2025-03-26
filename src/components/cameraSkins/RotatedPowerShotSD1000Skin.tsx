import React from 'react';
import { View, StyleSheet } from 'react-native';
import PowerShotSD1000Skin from './PowerShotSD1000Skin';
import { SvgProps } from 'react-native-svg';

const RotatedPowerShotSD1000Skin: React.FC<SvgProps> = (props) => {
  const { width = '100%', height = '100%' } = props;

  return (
    <View style={styles.container}>
      {/* We swap width and height here to account for the 90 degree rotation */}
      <PowerShotSD1000Skin
        width={height}
        height={width}
        style={styles.rotatedSkin}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
  rotatedSkin: {
    transform: [{ rotate: '90deg' }],
  },
});

export default RotatedPowerShotSD1000Skin;
