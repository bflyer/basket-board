import { cp, mkdir, rm } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const outputDir = join(projectRoot, 'www');
const assets = [
  'index.html',
  'basketball_court.png',
  'manifest.json',
  'service-worker.js',
  'icon-192.png',
  'icon-512.png',
  'fix-webm-duration.js',
  'tactics',
  'ffmpeg'
];

await rm(outputDir, { recursive: true, force: true });
await mkdir(outputDir, { recursive: true });

for (const asset of assets) {
  await cp(join(projectRoot, asset), join(outputDir, asset), { recursive: true });
}

console.log(`Prepared ${assets.length} web assets in www/`);
