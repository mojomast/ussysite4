/**
 * USSYSITE4 // MIRROR CONSISTENCY VERIFIER
 *
 * Ensures root `projects.js` and `js/projects.js` stay byte-identical,
 * and if `web/out/` exists for Nginx static deployment, verifies its files match.
 */

import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = fileURLToPath(new URL('..', import.meta.url));

const rootProjects = readFileSync(join(rootDir, 'projects.js'), 'utf8');
const jsProjects = readFileSync(join(rootDir, 'js/projects.js'), 'utf8');

if (rootProjects !== jsProjects) {
  console.error('[check:mirrors] FAIL: projects.js and js/projects.js have drifted.');
  process.exit(1);
}

const webOutDir = join(rootDir, 'web/out');
if (existsSync(webOutDir)) {
  const mirroredFiles = ['index.html', 'index.css', 'projects.js', 'js/app.js', 'js/projects.js'];
  for (const rel of mirroredFiles) {
    const src = readFileSync(join(rootDir, rel), 'utf8');
    const dstPath = join(webOutDir, rel);
    if (!existsSync(dstPath) || readFileSync(dstPath, 'utf8') !== src) {
      console.error(`[check:mirrors] FAIL: web/out/${rel} does not match source ${rel}.`);
      process.exit(1);
    }
  }
}

console.log('[check:mirrors] OK: Catalog mirrors are byte-identical.');
