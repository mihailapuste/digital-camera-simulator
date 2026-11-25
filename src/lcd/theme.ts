import type {LcdTheme, LcdThemeName} from './types';

export const lcdThemes: Record<LcdThemeName, LcdTheme> = {
  classic: {
    text: '#F3F6EE',
    shadow: 'rgba(0,0,0,0.7)',
    bracket: '#F3F6EE',
    bracketLocked: '#3DFF6E',
    reviewScrim: 'rgba(0,0,0,0.42)',
    reviewFrame: '#F3F6EE',
    battery: '#F3F6EE',
    batteryLow: '#FF5A4A',
    icon: '#F3F6EE',
    redEye: '#FF3B3B',
  },
  amber: {
    text: '#FFD27A',
    shadow: 'rgba(0,0,0,0.72)',
    bracket: '#FFD27A',
    bracketLocked: '#C6FF4A',
    reviewScrim: 'rgba(40,18,0,0.48)',
    reviewFrame: '#FFD27A',
    battery: '#FFD27A',
    batteryLow: '#FF5A4A',
    icon: '#FFD27A',
    redEye: '#FF4D3A',
  },
  ice: {
    text: '#C9F6FF',
    shadow: 'rgba(0,0,0,0.72)',
    bracket: '#C9F6FF',
    bracketLocked: '#39FFB0',
    reviewScrim: 'rgba(0,12,24,0.5)',
    reviewFrame: '#C9F6FF',
    battery: '#C9F6FF',
    batteryLow: '#FF6B6B',
    icon: '#C9F6FF',
    redEye: '#FF4D6A',
  },
};

export function resolveLcdTheme(
  theme?: LcdThemeName | Partial<LcdTheme>,
): LcdTheme {
  if (!theme) {
    return lcdThemes.classic;
  }
  if (typeof theme === 'string') {
    return lcdThemes[theme];
  }
  return {...lcdThemes.classic, ...theme};
}
