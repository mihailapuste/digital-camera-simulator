/**
 * Rasterize the camera skin to PNG.
 * Run from the repo root after `npm install --no-save --prefix /tmp/skinrender @resvg/resvg-js esbuild`
 * or with those packages available on NODE_PATH.
 */
import {execFileSync} from 'node:child_process';
import {mkdirSync, readFileSync, writeFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const bundle = '/tmp/skin-preview-bundle.cjs';
const esbuild = process.env.ESBUILD_BIN ?? 'esbuild';

execFileSync(
  esbuild,
  [
    join(root, 'src/skins/previewEntry.ts'),
    '--bundle',
    '--format=cjs',
    '--platform=node',
    `--outfile=${bundle}`,
  ],
  {stdio: 'inherit'},
);

const require = createRequire(import.meta.url);
const {buildPreviews} = require(bundle);
const {Resvg} = require('@resvg/resvg-js');

const outDir = join(root, 'src/skins/previews');
mkdirSync(outDir, {recursive: true});

const body = readFileSync(join(root, 'assets/lumen-l80.png')).toString('base64');
const harbor = readFileSync(join(root, 'assets/lumen-harbor.jpg')).toString('base64');

for (const preview of buildPreviews(
  `data:image/png;base64,${body}`,
  `data:image/jpeg;base64,${harbor}`,
)) {
  const resvg = new Resvg(preview.svg, {
    fitTo: {mode: 'width', value: 720},
    background: '#E6E1D6',
  });
  const png = resvg.render().asPng();
  const file = join(outDir, preview.filename);
  writeFileSync(file, png);
  process.stdout.write(`${file} ${png.length}\n`);
}
