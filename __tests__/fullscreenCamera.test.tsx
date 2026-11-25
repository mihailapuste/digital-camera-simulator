import React from 'react';
import {View} from 'react-native';
import {act, create, type ReactTestRenderer} from 'react-test-renderer';
import {SafeAreaInsetsContext} from 'react-native-safe-area-context';
import {HeldCamera} from '../src/camera/HeldCamera';
import {ExpandedCameraControls} from '../src/camera/ExpandedCameraControls';
import {SkinStage} from '../src/skins';
import {StoreProvider} from '../src/stores';

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({}),
  useIsFocused: () => true,
}));

test('entering and leaving full screen preserves the mounted camera', async () => {
  const unmount = jest.fn();
  function CameraPreview() {
    React.useEffect(() => unmount, []);
    return <View />;
  }
  let tree!: ReactTestRenderer;
  await act(() => {
    tree = create(
      <SafeAreaInsetsContext.Provider value={{top: 0, right: 0, bottom: 0, left: 0}}>
        <StoreProvider>
          <HeldCamera hasFlash minZoom={1} maxZoom={4}
            renderPreview={() => <CameraPreview />}
            grabPhoto={async () => null}
          />
        </StoreProvider>
      </SafeAreaInsetsContext.Provider>,
    );
  });
  const stage = tree.root.findAllByType(View).find(view => view.props.onLayout)!;
  await act(() => stage.props.onLayout({nativeEvent: {layout: {width: 390, height: 844}}}));
  const preview = tree.root.findByType(CameraPreview);
  await act(() => tree.root.findByType(SkinStage).props.onExpandViewfinder());
  expect(tree.root.findByType(CameraPreview)).toBe(preview);
  await act(() => tree.root.findByType(ExpandedCameraControls).props.onClose());
  expect(tree.root.findByType(CameraPreview)).toBe(preview);
  expect(unmount).not.toHaveBeenCalled();
  await act(() => tree.unmount());
});
