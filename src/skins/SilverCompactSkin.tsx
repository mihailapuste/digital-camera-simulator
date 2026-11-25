import React from 'react';
import {CameraBodySkin} from './CameraBodySkin';
import {
  silverCompactLayout,
  silverCompactMeta,
  silverCompactScene,
} from './silverCompact';
import type {CameraSkinProps} from './types';

export const SilverCompactSkin: React.FC<CameraSkinProps> = ({
  rotation,
  ...props
}) => (
  <CameraBodySkin
    {...props}
    skinId={silverCompactMeta.id}
    layout={{
      ...silverCompactLayout,
      rotation: rotation ?? silverCompactLayout.rotation,
    }}
    scene={silverCompactScene}
    surfaceColor="#D4CDC0"
  />
);
