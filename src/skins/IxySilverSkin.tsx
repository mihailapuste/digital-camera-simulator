import React from 'react';
import {CameraBodySkin} from './CameraBodySkin';
import {ixySilverLayout, ixySilverMeta, ixySilverScene} from './ixySilver';
import type {CameraSkinProps} from './types';

export const IxySilverSkin: React.FC<CameraSkinProps> = props => (
  <CameraBodySkin
    {...props}
    skinId={ixySilverMeta.id}
    layout={ixySilverLayout}
    scene={ixySilverScene}
  />
);
