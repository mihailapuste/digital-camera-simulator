import {dayKey, formatPlaybackDate} from './format';
import type {GalleryPhoto} from './types';

export type GallerySection = {
  key: string;
  label: string;
  photos: GalleryPhoto[];
};

export type GalleryRow =
  | {kind: 'day'; id: string; label: string; count: number}
  | {kind: 'photos'; id: string; photos: GalleryPhoto[]};

export function compareNewestFirst(
  a: {timestamp: number; fileNumber: string},
  b: {timestamp: number; fileNumber: string},
): number {
  return b.timestamp - a.timestamp || b.fileNumber.localeCompare(a.fileNumber);
}

/** Newest day first. Within a day, newest frame first. */
export function groupPhotosByDay(photos: GalleryPhoto[]): GallerySection[] {
  const sorted = [...photos].sort(compareNewestFirst);
  const order: string[] = [];
  const groups = new Map<string, GalleryPhoto[]>();
  for (const photo of sorted) {
    const key = dayKey(photo.timestamp);
    const existing = groups.get(key);
    if (existing) {
      existing.push(photo);
    } else {
      groups.set(key, [photo]);
      order.push(key);
    }
  }
  return order.map(key => {
    const sectionPhotos = groups.get(key) ?? [];
    return {
      key,
      label: formatPlaybackDate(sectionPhotos[0]?.timestamp ?? 0),
      photos: sectionPhotos,
    };
  });
}

export function buildGalleryRows(
  photos: GalleryPhoto[],
  columns = 3,
): GalleryRow[] {
  const width = Math.max(1, columns);
  const rows: GalleryRow[] = [];
  for (const section of groupPhotosByDay(photos)) {
    rows.push({
      kind: 'day',
      id: `day-${section.key}`,
      label: section.label,
      count: section.photos.length,
    });
    for (let index = 0; index < section.photos.length; index += width) {
      rows.push({
        kind: 'photos',
        id: `photos-${section.key}-${index}`,
        photos: section.photos.slice(index, index + width),
      });
    }
  }
  return rows;
}

export function flatSectionPhotos(photos: GalleryPhoto[]): GalleryPhoto[] {
  return groupPhotosByDay(photos).flatMap(section => section.photos);
}
