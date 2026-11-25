import React from 'react';
import {StyleSheet, View} from 'react-native';
import {Image} from 'expo-image';

const harbor = require('../../assets/lumen-harbor.jpg');

export function DemoViewfinder({zoom}: {zoom: number}) {
  return (
    <View style={[StyleSheet.absoluteFill, {transform: [{scale: zoom}]}]}>
      <Image
        testID="demo-viewfinder"
        source={harbor}
        contentFit="cover"
        style={StyleSheet.absoluteFill}
      />
    </View>
  );
}
