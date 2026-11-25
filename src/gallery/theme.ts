import {Platform} from 'react-native';

export const playback = {
  bg: '#05060A',
  chrome: '#101218',
  line: '#2C303A',
  text: '#F4F1EA',
  muted: '#9AA0AE',
  amber: '#FF8A14',
  amberSoft: '#FFD27A',
  danger: '#FF5C4A',
  scrim: 'rgba(0,0,0,0.62)',
  lcd: '#16130E',
  lcdEdge: '#4A3E2C',
  selected: 'rgba(255,138,20,0.22)',
};

export const mono = Platform.select({
  ios: 'Courier',
  android: 'monospace',
  default: 'Courier New, Courier, monospace',
});
