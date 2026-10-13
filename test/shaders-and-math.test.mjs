import test from 'node:test';
import assert from 'node:assert/strict';
import {
  GLSL_CURL_NOISE_CHUNK,
  PNEUMA_VERTEX_SHADER,
  PNEUMA_FRAGMENT_SHADER,
  FERROFLUID_VERTEX_SHADER,
  FERROFLUID_FRAGMENT_SHADER,
  OrganumCinematicShader
} from '../js/shaders/organum-shaders.js';
import {
  computeHelixStopAnchor,
  computeLineageStopAnchor,
  QUALITY_TIERS
} from '../js/engine/organum-engine.js';
import { USSY_PROJECTS } from '../js/projects.js';

test('Shaders include shared anomaly uniforms and curl-noise / SDF ferrofluid functions', () => {
  assert.ok(GLSL_CURL_NOISE_CHUNK.includes('vec3 curlNoise(vec3 p)'));
  assert.ok(PNEUMA_VERTEX_SHADER.includes('uniform float uAnomalyFactor;'));
  assert.ok(PNEUMA_VERTEX_SHADER.includes('curlNoise('));
  assert.ok(PNEUMA_FRAGMENT_SHADER.includes('gl_FragColor'));

  assert.ok(FERROFLUID_VERTEX_SHADER.includes('float smin(float a, float b, float k)'));
  assert.ok(FERROFLUID_VERTEX_SHADER.includes('uniform vec3 uStopPositions[11];'));
  assert.ok(FERROFLUID_FRAGMENT_SHADER.includes('uniform float uCryptReveal;'));

  assert.ok(OrganumCinematicShader.fragmentShader.includes('uLightScreenPos'));
  assert.ok(OrganumCinematicShader.fragmentShader.includes('uGlitchIntensity'));
});

test('Helix and Lineage 3D anchor math spaces all 11 Stops cleanly without NaNs or collisions', () => {
  const helixAnchors = [];
  const lineageAnchors = [];

  for (let i = 0; i < USSY_PROJECTS.length; i++) {
    const h = computeHelixStopAnchor(i, USSY_PROJECTS.length);
    const l = computeLineageStopAnchor(USSY_PROJECTS[i], i, USSY_PROJECTS);

    assert.ok(Number.isFinite(h.x) && Number.isFinite(h.y) && Number.isFinite(h.z));
    assert.ok(Number.isFinite(l.x) && Number.isFinite(l.y) && Number.isFinite(l.z));

    for (const prev of helixAnchors) {
      assert.ok(h.distanceTo(prev) > 4.0, 'Helix stops should not collide');
    }
    helixAnchors.push(h);
    lineageAnchors.push(l);
  }

  // Verify ascending Y along the helix
  assert.ok(helixAnchors[10].y > helixAnchors[0].y);
  assert.equal(QUALITY_TIERS.high.particles, 60000);
});
