import {getPreset} from '@/look';

export function presetLabel(
  presetId: string | null,
  lookBaked: boolean,
): string {
  if (!lookBaked) {
    return 'No look';
  }
  if (!presetId) {
    return 'Look applied';
  }
  try {
    return getPreset(presetId).name;
  } catch {
    return presetId;
  }
}
