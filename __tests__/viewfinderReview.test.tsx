import React from 'react';
import {View} from 'react-native';
import {act, create, type ReactTestRenderer} from 'react-test-renderer';
import {ViewfinderPlate} from '../src/camera/ViewfinderPlate';

test('showing and clearing the saving label keeps the same camera mounted', async () => {
  const unmount = jest.fn();
  function CameraPreview() {
    React.useEffect(() => unmount, []);
    return <View />;
  }

  const plate = (busy: boolean) => (
    <ViewfinderPlate
      preview={<CameraPreview />}
      presetId="ccd-classic"
      stamp={null}
      showGrid={false}
      busy={busy}
    />
  );
  let tree!: ReactTestRenderer;
  await act(() => { tree = create(plate(false)); });
  await act(() => tree.update(plate(true)));
  expect(tree.root.findAllByProps({children: 'SAVING'}).length).toBeGreaterThan(0);
  expect(tree.root.findByType(CameraPreview)).toBeDefined();
  await act(() => tree.update(plate(false)));
  expect(tree.root.findAllByProps({children: 'SAVING'})).toHaveLength(0);
  expect(unmount).not.toHaveBeenCalled();
  await act(() => tree.unmount());
});
