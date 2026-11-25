export type DownloadFile = {
  uri: string;
  filename: string;
};

type DownloadDocument = {
  createElement: (tag: string) => DownloadAnchor;
  body: {appendChild: (node: DownloadAnchor) => void};
};

type DownloadAnchor = {
  href: string;
  download: string;
  click: () => void;
  remove: () => void;
};

/** Browser download fallback. No-ops are the caller's job when `document` is missing. */
export function downloadFiles(
  files: DownloadFile[],
  doc: DownloadDocument | undefined = globalThis.document as
    DownloadDocument | undefined,
): void {
  if (!doc) {
    throw new Error('Downloads are only available in the browser.');
  }
  for (const file of files) {
    const link = doc.createElement('a');
    link.href = file.uri;
    link.download = file.filename;
    doc.body.appendChild(link);
    link.click();
    link.remove();
  }
}
