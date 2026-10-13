import { register } from 'node:module';
import { pathToFileURL } from 'node:url';
import path from 'node:path';

const rootDir = path.resolve(import.meta.dirname, '..');
const threeModuleUrl = pathToFileURL(path.join(rootDir, 'js/vendor/three/build/three.module.js')).href;
const threeAddonsPrefix = pathToFileURL(path.join(rootDir, 'js/vendor/three/addons/')).href;

const hookSource = `
export async function resolve(specifier, context, nextResolve) {
  if (specifier === 'three') {
    return { url: ${JSON.stringify(threeModuleUrl)}, shortCircuit: true };
  }
  if (specifier.startsWith('three/addons/')) {
    const subpath = specifier.slice('three/addons/'.length);
    return { url: ${JSON.stringify(threeAddonsPrefix)} + subpath, shortCircuit: true };
  }
  return nextResolve(specifier, context);
}
`;

register(`data:text/javascript,${encodeURIComponent(hookSource)}`, pathToFileURL('./'));
