import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import {NavigationContainer} from '@react-navigation/native';
import CameraScreen from '@screens/CameraScreen';
import SettingsScreen from '@screens/SettingsScreen';
import GalleryScreen from '@screens/GalleryScreen';
import ImageViewerScreen from '@screens/ImageViewerScreen';
import {RootStackParamList} from '@navigation/types';

const Stack = createStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Camera"
        screenOptions={{
          headerShown: false,
          cardStyle: {backgroundColor: 'black'},
        }}>
        <Stack.Screen name="Camera" component={CameraScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="Gallery" component={GalleryScreen} />
        <Stack.Screen name="ImageViewer" component={ImageViewerScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
