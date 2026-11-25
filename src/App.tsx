import React from 'react';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import AppNavigator from '@navigation/AppNavigator';
import {StoreProvider} from '@stores/index';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {StyleSheet, Appearance} from 'react-native';
import {StatusBar} from 'expo-status-bar';
import {SetupToadly} from '@services/ToadlyService';

if (typeof Appearance.setColorScheme === 'function') {
  Appearance.setColorScheme('light');
}

SetupToadly();

/**
 * Main App component that sets up providers and navigation
 */
const App = () => {
  return (
    <GestureHandlerRootView style={styles.container}>
      <StatusBar style="light" />
      <SafeAreaProvider>
        <StoreProvider>
          <AppNavigator />
        </StoreProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
