const FILES_PER_FOLDER = 9999;
const FIRST_FOLDER = 100;

const FILE_NUMBER = /^(\d+)-(\d{4})$/;

/** `1` is `100-0001`, `9999` is `100-9999`, `10000` is `101-0001`. */
export function fileNumberFromIndex(index: number): string {
  if (!Number.isInteger(index) || index < 1) {
    throw new Error('File index must be a positive integer');
  }
  const folder = FIRST_FOLDER + Math.floor((index - 1) / FILES_PER_FOLDER);
  const file = ((index - 1) % FILES_PER_FOLDER) + 1;
  return `${folder}-${String(file).padStart(4, '0')}`;
}

export function indexFromFileNumber(fileNumber: string): number | null {
  const match = FILE_NUMBER.exec(fileNumber);
  if (!match) {
    return null;
  }
  const folder = Number(match[1]);
  const file = Number(match[2]);
  if (folder < FIRST_FOLDER || file < 1 || file > FILES_PER_FOLDER) {
    return null;
  }
  return (folder - FIRST_FOLDER) * FILES_PER_FOLDER + file;
}

export function isFileNumber(value: string): boolean {
  return indexFromFileNumber(value) != null;
}
