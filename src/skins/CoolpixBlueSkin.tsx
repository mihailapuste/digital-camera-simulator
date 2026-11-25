import React from 'react';
import {CameraBodySkin} from './CameraBodySkin';
import {
  coolpixBlueLayout,
  coolpixBlueMeta,
  coolpixBlueScene,
} from './coolpixBlue';
import type {CameraSkinProps} from './types';

export const CoolpixBlueSkin: React.FC<CameraSkinProps> = props => (
  <CameraBodySkin
    {...props}
    skinId={coolpixBlueMeta.id}
    layout={coolpixBlueLayout}
    scene={coolpixBlueScene}
  />
);
