import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { USSY_PROJECTS, USSY_CATEGORIES } from '../js/projects.js';

const rootDir = fileURLToPath(new URL('..', import.meta.url));

const REQUIRED_REPOS = [
  'orbitdesktop',
  'velvetrp',
  'jammate',
  'cocs',
  'cocs-godot',
  'routetok',
  'rgbagentflightindicator',
  'mothbake',
  'warpi',
  'hermesdashboard',
  'becomussy'
];

test('Catalog contains exact 11 requested mojomast repositories in order', () => {
  assert.equal(USSY_PROJECTS.length, 11);
  const actualIds = USSY_PROJECTS.map((p) => p.id);
  assert.deepEqual(actualIds, REQUIRED_REPOS);
});

test('Every Stop has complete metadata, Roman numeral, sculpture archetype, chord, and valid connections', () => {
  const validIds = new Set(USSY_PROJECTS.map((p) => p.id));
  const romans = new Set();
  const archetypes = new Set();

  for (const proj of USSY_PROJECTS) {
    assert.ok(proj.name && proj.name.length > 0, `Missing name for ${proj.id}`);
    assert.ok(proj.stopRoman && proj.stopRoman.length > 0, `Missing stopRoman for ${proj.id}`);
    assert.ok(proj.stopName && proj.stopName.length > 0, `Missing stopName for ${proj.id}`);
    assert.ok(proj.sculptureArchetype, `Missing sculptureArchetype for ${proj.id}`);
    assert.ok(USSY_CATEGORIES[proj.category], `Invalid category ${proj.category} for ${proj.id}`);
    assert.equal(proj.github, `https://github.com/mojomast/${proj.id}`);

    assert.ok(proj.chord && proj.chord.name, `Missing chord for ${proj.id}`);
    assert.equal(proj.chord.notesHz.length, 5, `Chord notesHz must have 5 voices for ${proj.id}`);
    assert.ok(Object.keys(proj.specs).length >= 4, `Expected >=4 specs for ${proj.id}`);
    assert.ok(proj.features.length >= 4, `Expected >=4 features for ${proj.id}`);
    assert.ok(proj.telemetry.includes('\n'), `Expected multiline telemetry for ${proj.id}`);

    for (const conn of proj.connections) {
      assert.ok(validIds.has(conn), `Unknown connection "${conn}" on ${proj.id}`);
      assert.notEqual(conn, proj.id, `Self connection on ${proj.id}`);
    }

    romans.add(proj.stopRoman);
    archetypes.add(proj.sculptureArchetype);
  }

  assert.equal(romans.size, 11, 'All 11 Stops must have distinct Roman numerals');
  assert.equal(archetypes.size, 11, 'All 11 Stops must have distinct 3D sculpture archetypes');
});

test('Root projects.js and js/projects.js mirrors are byte-identical', () => {
  const a = readFileSync(join(rootDir, 'projects.js'), 'utf8');
  const b = readFileSync(join(rootDir, 'js/projects.js'), 'utf8');
  assert.equal(a, b);
});
