import type {SkinLayout} from './types';

export const silverCompactMeta = {
  id: 'silver-compact',
  name: 'Silver Compact',
  description: 'LUMEN L-80 with a brushed silver body and a 4:3 LCD.',
  lcdTheme: 'classic' as const,
};

// Coordinates are measured on the unrotated body artwork.
export const silverCompactLayout: SkinLayout = {
  viewBox: {width: 1282, height: 724},
  bleed: {x: 48, y: 48, width: 1206, height: 642},
  rotation: 90,
  lcd: {x: 104, y: 139, width: 678, height: 505},
  lcdBezel: {x: 64, y: 96, width: 758, height: 588},
  lcdRadius: 5,
  controls: {
    shutter: {x: 1085, y: 98, width: 155, height: 155},
    zoomOut: {x: 849, y: 151, width: 106, height: 65},
    zoomIn: {x: 955, y: 151, width: 106, height: 65},
    review: {x: 1122, y: 403, width: 98, height: 99},
    display: {x: 1013, y: 564, width: 140, height: 75},
    menu: {x: 849, y: 564, width: 142, height: 75},
    set: {x: 913, y: 335, width: 118, height: 118},
    flash: {x: 922, y: 274, width: 100, height: 61},
    mode: {x: 852, y: 344, width: 61, height: 100},
    func: {x: 1031, y: 344, width: 61, height: 100},
    viewfinder: {x: 922, y: 453, width: 100, height: 64},
  },
};
