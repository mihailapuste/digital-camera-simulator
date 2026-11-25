import React from 'react';
import {StyleSheet} from 'react-native';
import {Image} from 'expo-image';

const harbor = require('../../assets/lumen-harbor.jpg');

export function DemoViewfinder({zoom}: {zoom: number}) {
  return (
    <Image
      testID="demo-viewfinder"
      source={harbor}
      contentFit="cover"
      style={[StyleSheet.absoluteFill, {transform: [{scale: zoom}]}]}
    />
  );
}
