import {buildLcdScene, shotCounterLayout} from '../lcd/buildLcdScene';
import {resolveLcdTheme} from '../lcd/theme';
import {LCD_VIEWBOX} from '../lcd/types';
import {planDateStamp} from '../look/segments';
import {sceneToSvg} from './sceneToSvg';
import {fmt, rect} from './sceneModel';
import {silverCompactLayout} from './silverCompact';

export type SkinPreview = {
  id: string;
  filename: string;
  svg: string;
};

export function buildPreviews(bodyUrl: string, harborUrl: string): SkinPreview[] {
  const {viewBox, lcd, lcdRadius} = silverCompactLayout;
  const {width, height} = viewBox;
  const hud = buildLcdScene({
    theme: resolveLcdTheme('classic'),
    flashMode: 'auto',
    focus: 'idle',
    mode: 'live',
    shotsRemaining: 68,
    batteryLevel: 1,
    dateText: '2004.11.24',
    showBrackets: true,
  });
  const stamp = planDateStamp("'04 11 24", LCD_VIEWBOX.width, LCD_VIEWBOX.height);
  const inset = LCD_VIEWBOX.width - shotCounterLayout('68').x;
  const stampMarks = stamp.marks.map(mark =>
    rect(mark.x - inset, mark.y, mark.width, mark.height, {
      rx: mark.radius,
      fill: stamp.color,
      opacity: stamp.opacity,
    }),
  );
  const hudSvg = sceneToSvg({...hud, nodes: [...stampMarks, ...hud.nodes]});

  return [{
    id: 'silver-compact',
    filename: 'silver-compact.png',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <defs>
        <clipPath id="lcd"><rect x="${lcd.x}" y="${lcd.y}" width="${lcd.width}" height="${lcd.height}" rx="${lcdRadius ?? 0}" /></clipPath>
      </defs>
      <image width="${width}" height="${height}" xlink:href="${bodyUrl}" />
      <g clip-path="url(#lcd)">
        <image x="${lcd.x}" y="${lcd.y}" width="${lcd.width}" height="${lcd.height}" preserveAspectRatio="xMidYMid slice" xlink:href="${harborUrl}" />
        <g transform="translate(${lcd.x} ${lcd.y}) scale(${fmt(lcd.width / LCD_VIEWBOX.width)} ${fmt(lcd.height / LCD_VIEWBOX.height)})">
          ${hudSvg}
        </g>
      </g>
    </svg>`,
  }];
}
