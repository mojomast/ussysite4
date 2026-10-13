import test from 'node:test';
import assert from 'node:assert/strict';
import {
  AnomalySystem,
  RUNE_ANCHOR_SPECS,
  DEFAULT_DETECTORS
} from '../js/anomaly/anomaly-system.js';

function createMemoryStorage() {
  const map = new Map();
  return {
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => map.set(k, String(v)),
    removeItem: (k) => map.delete(k)
  };
}

test('AnomalySystem initializes default detectors, uniforms, and rune anchors', () => {
  const sys = new AnomalySystem({ storage: createMemoryStorage(), bindWindowKeys: false });
  assert.equal(sys.listDetectors().length, DEFAULT_DETECTORS.length);
  assert.equal(RUNE_ANCHOR_SPECS.length, 4);

  const u = sys.getUniforms();
  assert.equal(u.uAnomalyFactor, 0);
  assert.equal(u.uGlitchIntensity, 0);
  assert.equal(u.uCryptReveal, 0);
  sys.destroy();
});

test('Key-chord sequence detector unlocks ussy-chord when u-s-s-y is pressed', () => {
  const sys = new AnomalySystem({ storage: createMemoryStorage(), bindWindowKeys: false });
  const unlockedEvents = [];
  sys.bus.on('anomaly:unlock', (ev) => unlockedEvents.push(ev));

  for (const code of ['KeyU', 'KeyS', 'KeyS', 'KeyY']) {
    sys.handleKeyDown({ code, key: code.slice(3).toLowerCase() });
  }

  assert.equal(unlockedEvents.length, 1);
  assert.equal(unlockedEvents[0].id, 'ussy-chord');
  assert.ok(sys.getStateSnapshot().unlocked.includes('ussy-chord'));
  sys.destroy();
});

test('Stop sequence detector unlocks hermes-triad and invokes registered payload hook', () => {
  const sys = new AnomalySystem({ storage: createMemoryStorage(), bindWindowKeys: false });
  let payloadCalled = false;
  sys.registerPayload('hermes-triad', ({ detector }) => {
    payloadCalled = detector.id === 'hermes-triad';
  });

  sys.recordStopActivation('orbitdesktop');
  sys.recordStopActivation('hermesdashboard');
  sys.recordStopActivation('warpi');

  assert.equal(payloadCalled, true);
  assert.ok(sys.getStateSnapshot().unlocked.includes('hermes-triad'));
  sys.destroy();
});

test('3D Rune raycast dwell and terminal commands update uniforms and resonance', async () => {
  const sys = new AnomalySystem({ storage: createMemoryStorage(), bindWindowKeys: false });

  sys.recordRuneRaycast('rune:crypt-seal', { x: 0.5, y: 0.5 });
  assert.ok(sys.getStateSnapshot().unlocked.includes('rune:crypt-seal'));

  const tuneRes = sys.handleCommand('tune 432');
  assert.equal(tuneRes.ok, true);
  assert.equal(sys.getStateSnapshot().resonanceHz, 432);
  assert.ok(sys.getStateSnapshot().unlocked.includes('cmd:tune-432'));
  assert.ok(sys.getStateSnapshot().unlocked.includes('resonance:verdi'));

  const tweenPromise = sys.tween({ uAnomalyFactor: 0.8, uCryptReveal: 0.9, duration: 0.1 });
  sys.tick(0.06, 5.0);
  sys.tick(0.06, 5.0);
  await tweenPromise;

  const u = sys.getUniforms();
  assert.ok(Math.abs(u.uAnomalyFactor - 0.8) < 1e-4);
  assert.ok(Math.abs(u.uCryptReveal - 0.9) < 1e-4);
  sys.destroy();
});
