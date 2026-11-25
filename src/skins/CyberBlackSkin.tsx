import React from 'react';
import {CameraBodySkin} from './CameraBodySkin';
import {cyberBlackLayout, cyberBlackMeta, cyberBlackScene} from './cyberBlack';
import type {CameraSkinProps} from './types';

export const CyberBlackSkin: React.FC<CameraSkinProps> = props => (
  <CameraBodySkin
    {...props}
    skinId={cyberBlackMeta.id}
    layout={cyberBlackLayout}
    scene={cyberBlackScene}
  />
);
