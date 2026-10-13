/**
 * USSYSITE4 // THE HELIX ORGANUM — HARDENED NODE HTTP SERVER & API GATEWAY
 *
 * Zero external runtime dependencies.
 * Exports `createAppServer()` for in-process `node --test` verification.
 *
 * Routes:
 * - GET  /api/health          -> Organum runtime & catalog health summary
 * - GET  /api/anomaly/state   -> Current server-side AnomalySystem foundation state
 * - POST /api/anomaly/state   -> Persist client AnomalySystem state snapshot
 * - GET  /api/tts/health      -> OpenRouter TTS configuration status (never leaks API key)
 * - POST /api/tts             -> Same-origin OpenRouter TTS proxy
 * - POST /api/orchestrate     -> Same-origin Organum anomaly/event orchestrator
 * - POST /api/orchestrator    -> Alias for /api/orchestrate
 * - GET/HEAD /*               -> Defense-in-depth allowlisted static file server
 */

import { createServer } from 'node:http';
import { existsSync, readFileSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { USSY_PROJECTS } from './js/projects.js';

const rootDir = fileURLToPath(new URL('.', import.meta.url));
const rootDirSafe = rootDir.endsWith(sep) ? rootDir : rootDir + sep;
const envPath = join(rootDir, '.env');

function loadLocalEnv() {
  if (!existsSync(envPath)) return;
  const lines = readFileSync(envPath, 'utf8').split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    const val = trimmed.slice(idx + 1).trim().replace(/^['"]|['"]$/g, '');
    if (key && process.env[key] === undefined) {
      process.env[key] = val;
    }
  }
}

loadLocalEnv();

const defaultPort = Number(process.env.PORT || 3000);
const defaultHost = process.env.HOST || '127.0.0.1';
const publicOrigin = process.env.PUBLIC_ORIGIN || '';
const openRouterModel = process.env.OPENROUTER_TTS_MODEL || 'hexgrad/kokoro-82m';
const openRouterVoice = process.env.OPENROUTER_TTS_VOICE || 'onyx';
const openRouterFormat = process.env.OPENROUTER_TTS_FORMAT || 'pcm16';
const openRouterSampleRate = Number(process.env.OPENROUTER_TTS_SAMPLE_RATE || 24000);
const orchestratorModel = process.env.ORCHESTRATOR_MODEL || 'google/gemini-2.5-flash-preview';
const orchestratorEnabled = process.env.ORCHESTRATOR_ENABLED !== 'false';
const maxBodyBytes = 16 * 1024;

export const KOKORO_VOICE_MAP = {
  onyx: 'am_adam',
  alloy: 'af_heart',
  echo: 'am_michael',
  fable: 'bf_emma',
  nova: 'af_nova',
  shimmer: 'af_sky',
  default: 'am_adam'
};

const commonSecurityHeaders = {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin'
};

const htmlSecurityHeaders = {
  ...commonSecurityHeaders,
  'Content-Security-Policy':
    "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://openrouter.ai; img-src 'self' data: blob:; worker-src 'self' blob:; frame-ancestors 'none'"
};

const CONTENT_TYPES = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.txt': 'text/plain; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.glb': 'model/gltf-binary',
  '.gltf': 'model/gltf+json'
};

const SERVABLE_STATIC_EXTENSIONS = new Set(Object.keys(CONTENT_TYPES));

const DENIED_STATIC_FILES = new Set([
  'server.mjs',
  'package.json',
  'package-lock.json'
]);

const DENIED_STATIC_DIRS = new Set([
  'test',
  'scripts',
  'node_modules',
  'server',
  'data',
  'deploy'
]);

function isStaticPathAllowed(relSegments) {
  if (!Array.isArray(relSegments) || relSegments.length === 0) return false;
  for (const seg of relSegments) {
    if (!seg || seg.startsWith('.')) return false;
  }
  const topLower = relSegments[0].toLowerCase();
  if (DENIED_STATIC_DIRS.has(topLower)) return false;
  if (relSegments.length === 1 && DENIED_STATIC_FILES.has(topLower)) return false;
  const ext = extname(relSegments[relSegments.length - 1]).toLowerCase();
  return SERVABLE_STATIC_EXTENSIONS.has(ext);
}

function isSameOriginRequest(req) {
  const origin = req.headers.origin;
  if (!origin) return true;
  const hostHeader = req.headers.host;
  if (!hostHeader) return false;
  try {
    const parsedOrigin = new URL(origin);
    if (parsedOrigin.host === hostHeader) return true;
    if (publicOrigin) {
      const parsedPublic = new URL(publicOrigin);
      if (parsedOrigin.origin === parsedPublic.origin) return true;
    }
    return false;
  } catch {
    return false;
  }
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    const contentType = String(req.headers['content-type'] || '').toLowerCase();
    if (!contentType.includes('application/json')) {
      reject(Object.assign(new Error('Content-Type must be application/json'), { statusCode: 415 }));
      return;
    }
    let total = 0;
    const chunks = [];
    req.on('data', (chunk) => {
      total += chunk.length;
      if (total > maxBodyBytes) {
        reject(Object.assign(new Error('Payload too large'), { statusCode: 413 }));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => {
      try {
        const raw = Buffer.concat(chunks).toString('utf8');
        resolve(raw ? JSON.parse(raw) : {});
      } catch {
        reject(Object.assign(new Error('Invalid JSON payload'), { statusCode: 400 }));
      }
    });
    req.on('error', (err) => reject(err));
  });
}

function sendJson(res, statusCode, data) {
  const body = JSON.stringify(data);
  res.writeHead(statusCode, {
    ...commonSecurityHeaders,
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store'
  });
  res.end(body);
}

export function createAppServer() {
  let anomalyMemoryState = {
    v: 1,
    unlocked: [],
    counters: {},
    flags: {},
    resonanceHz: 440,
    updatedAt: Date.now()
  };

  const rateLimitMap = new Map();

  function checkRateLimit(ip, bucket, limitPerMin) {
    const now = Date.now();
    const key = `${ip}::${bucket}`;
    const timestamps = (rateLimitMap.get(key) || []).filter((t) => now - t < 60_000);
    if (timestamps.length >= limitPerMin) return false;
    timestamps.push(now);
    rateLimitMap.set(key, timestamps);
    return true;
  }

  return createServer(async (req, res) => {
    const method = req.method || 'GET';
    let parsedUrl;
    try {
      parsedUrl = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
    } catch {
      sendJson(res, 400, { error: 'Malformed URL' });
      return;
    }

    const pathname = parsedUrl.pathname;
    const clientIp = req.socket?.remoteAddress || '127.0.0.1';

    // 1. Health Endpoint
    if (method === 'GET' && pathname === '/api/health') {
      sendJson(res, 200, {
        status: 'ok',
        version: '4.0.0',
        world: 'The Helix Organum',
        stops: USSY_PROJECTS.length,
        stopIds: USSY_PROJECTS.map((p) => p.id)
      });
      return;
    }

    // 2. TTS Health Endpoint
    if (method === 'GET' && pathname === '/api/tts/health') {
      sendJson(res, 200, {
        configured: Boolean(process.env.OPENROUTER_API_KEY),
        model: openRouterModel,
        voice: openRouterVoice,
        format: openRouterFormat,
        sampleRate: openRouterSampleRate,
        kokoroVoices: KOKORO_VOICE_MAP,
        orchestrator: {
          enabled: orchestratorEnabled,
          model: orchestratorModel
        }
      });
      return;
    }

    // 3. AnomalySystem State Endpoint (Easter Egg Foundation Backend Hook)
    if (pathname === '/api/anomaly/state') {
      if (method === 'GET') {
        sendJson(res, 200, { ok: true, state: anomalyMemoryState });
        return;
      }
      if (method === 'POST') {
        if (!isSameOriginRequest(req)) {
          sendJson(res, 403, { error: 'Cross-origin POST forbidden' });
          return;
        }
        if (!checkRateLimit(clientIp, 'anomaly', 60)) {
          sendJson(res, 429, { error: 'Rate limit exceeded' });
          return;
        }
        try {
          const payload = await readJsonBody(req);
          const incoming = payload?.state || payload;
          if (incoming && typeof incoming === 'object') {
            anomalyMemoryState = {
              v: 1,
              unlocked: Array.isArray(incoming.unlocked)
                ? incoming.unlocked.slice(0, 32).map(String)
                : anomalyMemoryState.unlocked,
              counters: incoming.counters && typeof incoming.counters === 'object'
                ? incoming.counters
                : anomalyMemoryState.counters,
              flags: incoming.flags && typeof incoming.flags === 'object'
                ? incoming.flags
                : anomalyMemoryState.flags,
              resonanceHz: Number(incoming.resonanceHz) || 440,
              updatedAt: Date.now()
            };
          }
          sendJson(res, 200, { ok: true, state: anomalyMemoryState });
        } catch (err) {
          sendJson(res, err.statusCode || 400, { error: err.message || 'Bad request' });
        }
        return;
      }
    }

    // 4. Orchestrator Endpoint (Foundation Stub / Proxy)
    if (method === 'POST' && (pathname === '/api/orchestrate' || pathname === '/api/orchestrator')) {
      if (!isSameOriginRequest(req)) {
        sendJson(res, 403, { error: 'Cross-origin POST forbidden' });
        return;
      }
      if (!checkRateLimit(clientIp, 'orchestrate', 20)) {
        sendJson(res, 429, { error: 'Rate limit exceeded' });
        return;
      }
      try {
        const body = await readJsonBody(req);
        sendJson(res, 200, {
          fire: false,
          event: null,
          organumHook: 'ready',
          nearestStop: body?.nearestStop || null
        });
      } catch (err) {
        sendJson(res, err.statusCode || 400, { error: err.message || 'Bad request' });
      }
      return;
    }

    // 5. Static File Serving
    if (method !== 'GET' && method !== 'HEAD') {
      sendJson(res, 405, { error: 'Method not allowed' });
      return;
    }

    let decodedPath;
    try {
      decodedPath = decodeURIComponent(pathname === '/' ? '/index.html' : pathname);
    } catch {
      res.writeHead(400, commonSecurityHeaders);
      res.end('Bad Request');
      return;
    }

    if (decodedPath.includes('\0')) {
      res.writeHead(404, commonSecurityHeaders);
      res.end('Not Found');
      return;
    }

    const absTarget = normalize(join(rootDir, '.' + decodedPath));
    if (!absTarget.startsWith(rootDirSafe)) {
      res.writeHead(404, commonSecurityHeaders);
      res.end('Not Found');
      return;
    }

    const relPath = absTarget.slice(rootDirSafe.length);
    const relSegments = relPath.split(sep).filter(Boolean);

    if (!isStaticPathAllowed(relSegments)) {
      res.writeHead(404, commonSecurityHeaders);
      res.end('Not Found');
      return;
    }

    try {
      const fileBuffer = await readFile(absTarget);
      const ext = extname(absTarget).toLowerCase();
      const contentType = CONTENT_TYPES[ext] || 'application/octet-stream';
      const headers = ext === '.html' ? htmlSecurityHeaders : commonSecurityHeaders;

      res.writeHead(200, {
        ...headers,
        'Content-Type': contentType,
        'Content-Length': fileBuffer.length
      });
      if (method === 'HEAD') {
        res.end();
      } else {
        res.end(fileBuffer);
      }
    } catch {
      res.writeHead(404, commonSecurityHeaders);
      res.end('Not Found');
    }
  });
}

const isMainEntry =
  process.argv[1] && fileURLToPath(import.meta.url) === normalize(process.argv[1]);

if (isMainEntry) {
  const server = createAppServer();
  server.listen(defaultPort, defaultHost, () => {
    console.log(`[ussysite4] The Helix Organum listening on http://${defaultHost}:${defaultPort}`);
  });
}
