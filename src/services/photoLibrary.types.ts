import type {CaptureMetaInput, PhotoMeta} from '../gallery/types';

export type StoredPhoto = {
  uri: string;
  name: string;
  modifiedAt: number;
  /** Absent on photos saved before playback metadata existed. */
  meta?: PhotoMeta;
};

export type {CaptureMetaInput, PhotoMeta};
