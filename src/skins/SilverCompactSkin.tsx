import React from 'react';
import {CameraBodySkin} from './CameraBodySkin';
import {
  silverCompactLayout,
  silverCompactMeta,
  silverCompactScene,
} from './silverCompact';
import type {CameraSkinProps} from './types';

export const SilverCompactSkin: React.FC<CameraSkinProps> = props => (
  <CameraBodySkin
    {...props}
    skinId={silverCompactMeta.id}
    layout={silverCompactLayout}
    scene={silverCompactScene}
  />
);
