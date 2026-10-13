/**
 * USSYSITE4 // VENDOR THREE.JS (r186 / 0.186.1) BOOTSTRAPPER
 *
 * Restores `js/vendor/three/` (gitignored due to >2 MB bundle size)
 * from local `node_modules/three` (after `npm install --no-save three@0.186.1`).
 */

import { cpSync, existsSync, mkdirSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = fileURLToPath(new URL('..', import.meta.url));
const nmThree = join(rootDir, 'node_modules/three');
const vendorThree = join(rootDir, 'js/vendor/three');

if (!existsSync(join(nmThree, 'build/three.module.js'))) {
  console.log('[setup:vendor] Installing three@0.186.1...');
  execSync('npm install --no-save three@0.186.1', { cwd: rootDir, stdio: 'inherit' });
}

mkdirSync(join(vendorThree, 'build'), { recursive: true });
mkdirSync(join(vendorThree, 'addons/postprocessing'), { recursive: true });
mkdirSync(join(vendorThree, 'addons/shaders'), { recursive: true });
mkdirSync(join(vendorThree, 'addons/environments'), { recursive: true });

for (const f of ['three.core.js', 'three.module.js']) {
  cpSync(join(nmThree, 'build', f), join(vendorThree, 'build', f));
}
for (const f of ['EffectComposer.js', 'MaskPass.js', 'OutputPass.js', 'Pass.js', 'RenderPass.js', 'ShaderPass.js', 'UnrealBloomPass.js']) {
  cpSync(join(nmThree, 'examples/jsm/postprocessing', f), join(vendorThree, 'addons/postprocessing', f));
}
for (const f of ['CopyShader.js', 'LuminosityHighPassShader.js', 'OutputShader.js']) {
  cpSync(join(nmThree, 'examples/jsm/shaders', f), join(vendorThree, 'addons/shaders', f));
}
cpSync(join(nmThree, 'examples/jsm/environments/RoomEnvironment.js'), join(vendorThree, 'addons/environments/RoomEnvironment.js'));

console.log('[setup:vendor] OK: js/vendor/three (r186) populated.');
