import {SilverCompactSkin} from './SilverCompactSkin';
import {silverCompactLayout, silverCompactMeta} from './silverCompact';
import type {SkinDefinition} from './types';

export const skinList: readonly SkinDefinition[] = [
  {
    ...silverCompactMeta,
    layout: silverCompactLayout,
    Component: SilverCompactSkin,
  },
];

export const defaultSkinId = silverCompactMeta.id;

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
