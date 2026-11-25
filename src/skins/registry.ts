import {CoolpixBlueSkin} from './CoolpixBlueSkin';
import {CyberBlackSkin} from './CyberBlackSkin';
import {IxySilverSkin} from './IxySilverSkin';
import {coolpixBlueLayout, coolpixBlueMeta} from './coolpixBlue';
import {cyberBlackLayout, cyberBlackMeta} from './cyberBlack';
import {ixySilverLayout, ixySilverMeta} from './ixySilver';
import type {SkinDefinition} from './types';

export const skinList: readonly SkinDefinition[] = [
  {
    ...ixySilverMeta,
    layout: ixySilverLayout,
    Component: IxySilverSkin,
  },
  {
    ...cyberBlackMeta,
    layout: cyberBlackLayout,
    Component: CyberBlackSkin,
  },
  {
    ...coolpixBlueMeta,
    layout: coolpixBlueLayout,
    Component: CoolpixBlueSkin,
  },
];

export const defaultSkinId = ixySilverMeta.id;

export function listSkins(): readonly SkinDefinition[] {
  return skinList;
}

export function getDefaultSkin(): SkinDefinition {
  const skin = skinList.find(entry => entry.id === defaultSkinId);
  if (!skin) {
    throw new Error('Default camera skin is missing from the registry.');
  }
  return skin;
}

export function getSkin(id: string = defaultSkinId): SkinDefinition {
  return skinList.find(entry => entry.id === id) ?? getDefaultSkin();
}
