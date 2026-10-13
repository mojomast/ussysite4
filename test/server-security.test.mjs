import test from 'node:test';
import assert from 'node:assert/strict';
import { createAppServer } from '../server.mjs';

async function withServer(fn) {
  const server = createAppServer();
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address();
  const baseUrl = `http://127.0.0.1:${port}`;
  try {
    await fn(baseUrl);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
}

test('Server serves index.html, projects.js, and vendored Three.js r186 ESM with security headers', async () => {
  await withServer(async (baseUrl) => {
    const indexRes = await fetch(`${baseUrl}/`);
    assert.equal(indexRes.status, 200);
    assert.equal(indexRes.headers.get('x-frame-options'), 'DENY');
    assert.equal(indexRes.headers.get('x-content-type-options'), 'nosniff');
    assert.ok(indexRes.headers.get('content-security-policy')?.includes("default-src 'self'"));
    const html = await indexRes.text();
    assert.ok(html.includes('THE HELIX ORGANUM'));

    const threeRes = await fetch(`${baseUrl}/js/vendor/three/build/three.module.js`);
    assert.equal(threeRes.status, 200);
    assert.ok(threeRes.headers.get('content-type')?.includes('text/javascript'));
  });
});

test('Server blocks sensitive files, dotfiles, internal directories, and path traversal with 404', async () => {
  await withServer(async (baseUrl) => {
    const blockedPaths = [
      '/server.mjs',
      '/package.json',
      '/.env',
      '/.gitignore',
      '/test/catalog.test.mjs',
      '/scripts/check-mirrors.mjs',
      '/deploy/ussysite4.service',
      '/..%2fpackage.json'
    ];

    for (const p of blockedPaths) {
      const res = await fetch(`${baseUrl}${p}`);
      assert.equal(res.status, 404, `Expected 404 for blocked path ${p}, got ${res.status}`);
    }
  });
});

test('Server exposes /api/health, /api/tts/health, /api/anomaly/state, and /api/orchestrate', async () => {
  await withServer(async (baseUrl) => {
    const healthRes = await fetch(`${baseUrl}/api/health`);
    assert.equal(healthRes.status, 200);
    const health = await healthRes.json();
    assert.equal(health.stops, 11);
    assert.equal(health.world, 'The Helix Organum');

    const ttsRes = await fetch(`${baseUrl}/api/tts/health`);
    assert.equal(ttsRes.status, 200);
    const tts = await ttsRes.json();
    assert.equal(typeof tts.configured, 'boolean');

    const postAnomaly = await fetch(`${baseUrl}/api/anomaly/state`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        state: {
          unlocked: ['ussy-chord', 'hermes-triad'],
          resonanceHz: 432
        }
      })
    });
    assert.equal(postAnomaly.status, 200);
    const saved = await postAnomaly.json();
    assert.deepEqual(saved.state.unlocked, ['ussy-chord', 'hermes-triad']);
    assert.equal(saved.state.resonanceHz, 432);
  });
});
