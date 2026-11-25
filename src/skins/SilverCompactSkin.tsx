import React from 'react';
import {CameraBodySkin} from './CameraBodySkin';
import {silverCompactLayout, silverCompactMeta} from './silverCompact';
import type {CameraSkinProps} from './types';

const bodyArtwork = require('../../assets/lumen-l80.png');

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
    artwork={bodyArtwork}
  />
);
