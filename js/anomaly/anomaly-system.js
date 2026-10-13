/**
 * USSYSITE4 // ANOMALY SYSTEM & EASTER EGG FOUNDATION
 *
 * First-class extensible foundation designed for future agents to attach easter egg payloads
 * without modifying the renderer, particle engine, post-processing stack, or audio synth.
 *
 * Capabilities included out of the box:
 * 1. Typed EventBus (`on`, `off`, `once`, `emit`)
 * 2. Shared `WorldUniforms` (`uAnomalyFactor`, `uWorldPhase`, `uGlitchIntensity`, `uVolumetricPulse`, `uCryptReveal`)
 * 3. Multi-modal `SequenceDetector` (key-chords, station visit chains, 3D rune raycast dwell, terminal commands, frequency resonance)
 * 4. Smooth uniform tweening (`tween()`) with easing curves
 * 5. LocalStorage + optional `/api/anomaly/state` persistence
 * 6. Frozen `window.__USSY4_SDK__` runtime inspection & control interface
 */

export const STORAGE_KEY = 'ussysite4.anomaly.v1';

export const RUNE_ANCHOR_SPECS = [
  {
    id: 'rune:windchest',
    label: 'Windchest Heart Sigil',
    position: [0, 2.5, 0],
    dwellMs: 1200,
    hint: 'Inscribed upon the inner glass lung of the central Windchest.'
  },
  {
    id: 'rune:crypt-seal',
    label: 'Sub-Floor Crypt Seal',
    position: [0, -10.8, 0],
    dwellMs: 1200,
    hint: 'Visible through the central ferrofluid basin tesserae into the locked Crypt below.'
  },
  {
    id: 'rune:vault-keystone',
    label: 'Caustic Vault Keystone',
    position: [0, 34.5, 0],
    dwellMs: 1200,
    hint: 'Suspended at the apex of the salt-glass refractive vault ceiling.'
  },
  {
    id: 'rune:caduceus-gate',
    label: 'Hermes Caduceus Gate',
    position: [-26.0, 12.0, -18.0],
    dwellMs: 1200,
    hint: 'Nestled between the upper helix windrail and the Winged Operations Lectern.'
  }
];

export const DEFAULT_DETECTORS = [
  {
    id: 'ussy-chord',
    type: 'keys',
    label: 'The Ussy Chord',
    description: 'Type u-s-s-y anywhere outside an input field within 1.5s.',
    sequence: ['KeyU', 'KeyS', 'KeyS', 'KeyY'],
    windowMs: 1500,
    armed: true
  },
  {
    id: 'konami',
    type: 'keys',
    label: 'Organum Konami',
    description: 'Classic directional invocation sequence.',
    sequence: [
      'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
      'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
      'KeyB', 'KeyA'
    ],
    windowMs: 4000,
    armed: true
  },
  {
    id: 'hermes-triad',
    type: 'stops',
    label: 'Hermes Runtime Triad',
    description: 'Inspect OrbitDesktop -> HermesDashboard -> Warpi in sequence.',
    sequence: ['orbitdesktop', 'hermesdashboard', 'warpi'],
    windowMs: 60000,
    armed: true
  },
  {
    id: 'cocs-duality',
    type: 'stops',
    label: 'Authoritative Arena Duality',
    description: 'Inspect COCS -> COCS-Godot -> MothBake in sequence.',
    sequence: ['cocs', 'cocs-godot', 'mothbake'],
    windowMs: 60000,
    armed: true
  },
  {
    id: 'steward-covenant',
    type: 'stops',
    label: 'Steward Governance Covenant',
    description: 'Inspect VelvetRP -> RouteTok -> Becomussy in sequence.',
    sequence: ['velvetrp', 'routetok', 'becomussy'],
    windowMs: 60000,
    armed: true
  },
  {
    id: 'helix-circuit',
    type: 'stops',
    label: 'Full Helix Pilgrimage',
    description: 'Walk all 11 Nave Stops in ascending order I through XI.',
    sequence: [
      'orbitdesktop', 'velvetrp', 'jammate', 'cocs', 'cocs-godot',
      'routetok', 'rgbagentflightindicator', 'mothbake', 'warpi',
      'hermesdashboard', 'becomussy'
    ],
    windowMs: 300000,
    armed: true
  },
  {
    id: 'rune:windchest',
    type: 'rune',
    label: 'Windchest Heart Sigil',
    description: 'Hold pointer focus on the central Windchest rune for 1.2s.',
    sequence: ['rune:windchest'],
    windowMs: 2000,
    armed: true
  },
  {
    id: 'rune:crypt-seal',
    type: 'rune',
    label: 'Sub-Floor Crypt Seal',
    description: 'Hold pointer focus on the sub-floor Crypt seal for 1.2s.',
    sequence: ['rune:crypt-seal'],
    windowMs: 2000,
    armed: true
  },
  {
    id: 'rune:vault-keystone',
    type: 'rune',
    label: 'Caustic Vault Keystone',
    description: 'Hold pointer focus on the Caustic Vault apex keystone for 1.2s.',
    sequence: ['rune:vault-keystone'],
    windowMs: 2000,
    armed: true
  },
  {
    id: 'rune:caduceus-gate',
    type: 'rune',
    label: 'Hermes Caduceus Gate',
    description: 'Hold pointer focus on the upper helix Caduceus rune for 1.2s.',
    sequence: ['rune:caduceus-gate'],
    windowMs: 2000,
    armed: true
  },
  {
    id: 'cmd:tune-432',
    type: 'command',
    label: 'Natural Harmonic Retune (432 Hz)',
    description: 'Execute `tune 432` in the Organum Console (~).',
    sequence: ['tune 432'],
    windowMs: 1000,
    armed: true
  },
  {
    id: 'resonance:verdi',
    type: 'resonance',
    label: 'Verdi Pitch Alignment',
    description: 'Align the Organum master resonance to 432 Hz within 0.5 Hz.',
    sequence: ['432'],
    windowMs: 1000,
    armed: true
  }
];

export class EventBus {
  constructor() {
    this._listeners = new Map();
  }

  on(event, handler) {
    if (typeof handler !== 'function') return () => {};
    if (!this._listeners.has(event)) {
      this._listeners.set(event, new Set());
    }
    this._listeners.get(event).add(handler);
    return () => this.off(event, handler);
  }

  once(event, handler) {
    if (typeof handler !== 'function') return () => {};
    const wrapper = (payload) => {
      this.off(event, wrapper);
      handler(payload);
    };
    return this.on(event, wrapper);
  }

  off(event, handler) {
    const set = this._listeners.get(event);
    if (!set) return;
    set.delete(handler);
    if (set.size === 0) {
      this._listeners.delete(event);
    }
  }

  emit(event, payload = {}) {
    const set = this._listeners.get(event);
    if (set) {
      for (const fn of [...set]) {
        try {
          fn(payload);
        } catch (err) {
          console.error(`[AnomalyBus] Listener error on "${event}":`, err);
        }
      }
    }
    const wildcard = this._listeners.get('*');
    if (wildcard) {
      for (const fn of [...wildcard]) {
        try {
          fn({ event, payload });
        } catch (err) {
          console.error('[AnomalyBus] Wildcard listener error:', err);
        }
      }
    }
  }

  destroy() {
    this._listeners.clear();
  }
}

export function createWorldUniforms() {
  return {
    uTime: { value: 0 },
    uAnomalyFactor: { value: 0 },
    uWorldPhase: { value: 0 },
    uGlitchIntensity: { value: 0 },
    uVolumetricPulse: { value: 0.25 },
    uCryptReveal: { value: 0 }
  };
}

export function isTypingTarget(target) {
  if (!target || typeof target !== 'object') return false;
  const tag = String(target.tagName || '').toUpperCase();
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
  if (target.isContentEditable) return true;
  return false;
}

const EASE_FNS = {
  linear: (t) => t,
  quadInOut: (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2),
  cubicOut: (t) => 1 - Math.pow(1 - t, 3),
  expoOut: (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t))
};

export class AnomalySystem {
  constructor(options = {}) {
    this.bus = new EventBus();
    this.uniforms = createWorldUniforms();
    this.storage = options.storage ?? (typeof window !== 'undefined' ? window.localStorage : null);
    this.serverEndpoint = options.serverEndpoint ?? null;
    this.materials = new Set();
    this._tweens = [];
    this._saveTimer = null;
    this._payloadHooks = new Map();

    this.state = this._loadState();
    this.detectors = new Map();
    for (const def of options.detectors || DEFAULT_DETECTORS) {
      this.registerDetector(def);
    }

    this._keyHistory = [];
    this._stopHistory = [];
    this._boundKeyDown = null;

    if (typeof window !== 'undefined' && options.bindWindowKeys !== false) {
      this._boundKeyDown = (e) => this.handleKeyDown(e);
      window.addEventListener('keydown', this._boundKeyDown);
    }
  }

  _defaultState() {
    return {
      v: 1,
      unlocked: [],
      counters: {},
      flags: {},
      lastVisit: Date.now(),
      resonanceHz: 440
    };
  }

  _loadState() {
    const fallback = this._defaultState();
    if (!this.storage) return fallback;
    try {
      const raw = this.storage.getItem(STORAGE_KEY);
      if (!raw) return fallback;
      const parsed = JSON.parse(raw);
      if (!parsed || parsed.v !== 1) return fallback;
      return {
        v: 1,
        unlocked: Array.isArray(parsed.unlocked) ? [...new Set(parsed.unlocked)] : [],
        counters: parsed.counters && typeof parsed.counters === 'object' ? { ...parsed.counters } : {},
        flags: parsed.flags && typeof parsed.flags === 'object' ? { ...parsed.flags } : {},
        lastVisit: Number(parsed.lastVisit) || Date.now(),
        resonanceHz: Number(parsed.resonanceHz) || 440
      };
    } catch {
      return fallback;
    }
  }

  saveStateImmediate() {
    if (this._saveTimer) {
      clearTimeout(this._saveTimer);
      this._saveTimer = null;
    }
    this.state.lastVisit = Date.now();
    if (this.storage) {
      try {
        this.storage.setItem(STORAGE_KEY, JSON.stringify(this.state));
      } catch {
        // Ignore quota / private browsing errors
      }
    }
    this.bus.emit('persist:changed', { state: this.getStateSnapshot() });

    if (this.serverEndpoint && typeof fetch === 'function') {
      fetch(this.serverEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ state: this.state })
      }).catch(() => {});
    }
  }

  _scheduleSave() {
    if (this._saveTimer) clearTimeout(this._saveTimer);
    this._saveTimer = setTimeout(() => this.saveStateImmediate(), 200);
  }

  getStateSnapshot() {
    return {
      v: this.state.v,
      unlocked: [...this.state.unlocked],
      counters: { ...this.state.counters },
      flags: { ...this.state.flags },
      lastVisit: this.state.lastVisit,
      resonanceHz: this.state.resonanceHz
    };
  }

  registerDetector(def) {
    if (!def || !def.id) throw new Error('Detector definition requires an id');
    const normalized = {
      id: def.id,
      type: def.type || 'keys',
      label: def.label || def.id,
      description: def.description || '',
      sequence: Array.isArray(def.sequence) ? [...def.sequence] : [],
      windowMs: Number(def.windowMs) || 1500,
      progress: 0,
      armed: def.armed !== false,
      onComplete: def.onComplete || 'anomaly:unlock',
      lastStepAt: 0
    };
    this.detectors.set(normalized.id, normalized);
    return normalized;
  }

  /**
   * Hook for a future agent to attach a custom Easter Egg payload handler to any detector id.
   * When that detector completes, `callback({ detector, system, state })` is invoked automatically.
   */
  registerPayload(detectorId, callback) {
    if (typeof callback !== 'function') return () => {};
    if (!this._payloadHooks.has(detectorId)) {
      this._payloadHooks.set(detectorId, new Set());
    }
    this._payloadHooks.get(detectorId).add(callback);
    return () => {
      const set = this._payloadHooks.get(detectorId);
      if (set) set.delete(callback);
    };
  }

  listDetectors() {
    return [...this.detectors.values()].map((d) => ({
      id: d.id,
      type: d.type,
      label: d.label,
      description: d.description,
      sequence: [...d.sequence],
      progress: d.progress,
      armed: d.armed,
      unlocked: this.state.unlocked.includes(d.id),
      count: this.state.counters[d.id] || 0
    }));
  }

  attachMaterial(material) {
    if (!material) return material;
    this.materials.add(material);
    material.userData = material.userData || {};
    material.userData.anomalyUniforms = this.uniforms;
    if (material.uniforms && typeof material.uniforms === 'object') {
      material.uniforms.uTime = this.uniforms.uTime;
      material.uniforms.uAnomalyFactor = this.uniforms.uAnomalyFactor;
      material.uniforms.uWorldPhase = this.uniforms.uWorldPhase;
      material.uniforms.uGlitchIntensity = this.uniforms.uGlitchIntensity;
      material.uniforms.uVolumetricPulse = this.uniforms.uVolumetricPulse;
      material.uniforms.uCryptReveal = this.uniforms.uCryptReveal;
    }
    return material;
  }

  getUniforms() {
    return {
      uTime: this.uniforms.uTime.value,
      uAnomalyFactor: this.uniforms.uAnomalyFactor.value,
      uWorldPhase: this.uniforms.uWorldPhase.value,
      uGlitchIntensity: this.uniforms.uGlitchIntensity.value,
      uVolumetricPulse: this.uniforms.uVolumetricPulse.value,
      uCryptReveal: this.uniforms.uCryptReveal.value
    };
  }

  setUniforms(partial = {}) {
    if (typeof partial.uAnomalyFactor === 'number') {
      this.uniforms.uAnomalyFactor.value = Math.max(0, Math.min(1, partial.uAnomalyFactor));
      this.bus.emit('anomaly:factor', { value: this.uniforms.uAnomalyFactor.value });
    }
    if (typeof partial.uWorldPhase === 'number') {
      this.uniforms.uWorldPhase.value = partial.uWorldPhase;
      this.bus.emit('world:phase', { phase: this.uniforms.uWorldPhase.value });
    }
    if (typeof partial.uGlitchIntensity === 'number') {
      this.uniforms.uGlitchIntensity.value = Math.max(0, Math.min(1, partial.uGlitchIntensity));
    }
    if (typeof partial.uVolumetricPulse === 'number') {
      this.uniforms.uVolumetricPulse.value = Math.max(0, Math.min(1, partial.uVolumetricPulse));
    }
    if (typeof partial.uCryptReveal === 'number') {
      this.uniforms.uCryptReveal.value = Math.max(0, Math.min(1, partial.uCryptReveal));
    }
    return this.getUniforms();
  }

  tween(spec = {}) {
    const duration = Math.max(0.01, Number(spec.duration ?? 1.6));
    const easeName = spec.ease || 'expoOut';
    const easeFn = EASE_FNS[easeName] || EASE_FNS.expoOut;
    const keys = ['uAnomalyFactor', 'uWorldPhase', 'uGlitchIntensity', 'uVolumetricPulse', 'uCryptReveal']
      .filter((k) => typeof spec[k] === 'number');

    const startValues = {};
    const targetValues = {};
    for (const k of keys) {
      startValues[k] = this.uniforms[k].value;
      targetValues[k] = spec[k];
    }

    return new Promise((resolve) => {
      this._tweens.push({
        elapsed: 0,
        duration,
        easeFn,
        keys,
        startValues,
        targetValues,
        resolve
      });
    });
  }

  unlock(detectorId, payload = {}) {
    const det = this.detectors.get(detectorId);
    if (!this.state.unlocked.includes(detectorId)) {
      this.state.unlocked.push(detectorId);
    }
    this.state.counters[detectorId] = (this.state.counters[detectorId] || 0) + 1;
    if (det) {
      det.progress = 1;
    }

    const eventPayload = {
      id: detectorId,
      label: det ? det.label : detectorId,
      count: this.state.counters[detectorId],
      at: Date.now(),
      ...payload
    };

    // Subtle visual & harmonic pulse acknowledging foundation trigger
    const prevGlitch = this.uniforms.uGlitchIntensity.value;
    this.uniforms.uGlitchIntensity.value = Math.min(1, prevGlitch + 0.32);
    this.tween({ uGlitchIntensity: prevGlitch, duration: 0.9, ease: 'cubicOut' });

    const eventName = det?.onComplete || 'anomaly:unlock';
    this.bus.emit(eventName, eventPayload);
    if (eventName !== 'anomaly:unlock') {
      this.bus.emit('anomaly:unlock', eventPayload);
    }

    const hooks = this._payloadHooks.get(detectorId);
    if (hooks) {
      for (const hook of hooks) {
        try {
          hook({ detector: det, system: this, state: this.getStateSnapshot(), payload: eventPayload });
        } catch (err) {
          console.error(`[AnomalySystem] Payload hook error for "${detectorId}":`, err);
        }
      }
    }

    this._scheduleSave();
    return eventPayload;
  }

  fire(detectorId) {
    return this.unlock(detectorId, { manual: true });
  }

  setFlag(key, value = true) {
    this.state.flags[key] = Boolean(value);
    this._scheduleSave();
    return this.state.flags[key];
  }

  handleKeyDown(event) {
    if (!event) return;
    if (event.metaKey || event.ctrlKey || event.altKey) return;
    if (isTypingTarget(event.target)) return;

    const now = Date.now();
    const code = event.code || '';
    const key = (event.key || '').toLowerCase();

    this.bus.emit('input:key', { key, code, at: now });

    for (const det of this.detectors.values()) {
      if (!det.armed || det.type !== 'keys' || det.sequence.length === 0) continue;

      if (det.progress > 0 && now - det.lastStepAt > det.windowMs) {
        det.progress = 0;
      }

      const expected = det.sequence[det.progress];
      const matches = expected === code || expected.toLowerCase() === key;

      if (matches) {
        det.progress += 1;
        det.lastStepAt = now;
        this.bus.emit('anomaly:progress', {
          detectorId: det.id,
          progress: det.progress / det.sequence.length
        });

        if (det.progress >= det.sequence.length) {
          det.progress = 0;
          this.bus.emit('input:chord', { id: det.id, keys: [...det.sequence] });
          this.unlock(det.id, { trigger: 'keys' });
        }
      } else {
        // Check if current key matches first element of sequence
        const first = det.sequence[0];
        if (first === code || first.toLowerCase() === key) {
          det.progress = 1;
          det.lastStepAt = now;
        } else {
          det.progress = 0;
        }
      }
    }
  }

  recordStopActivation(stopId) {
    if (!stopId) return;
    const now = Date.now();
    this._stopHistory.push({ id: stopId, at: now });
    if (this._stopHistory.length > 24) {
      this._stopHistory.shift();
    }
    this.bus.emit('nav:stop-activate', { id: stopId, at: now });

    for (const det of this.detectors.values()) {
      if (!det.armed || det.type !== 'stops' || det.sequence.length === 0) continue;

      if (det.progress > 0 && now - det.lastStepAt > det.windowMs) {
        det.progress = 0;
      }

      const expected = det.sequence[det.progress];
      if (expected === stopId) {
        det.progress += 1;
        det.lastStepAt = now;
        this.bus.emit('anomaly:progress', {
          detectorId: det.id,
          progress: det.progress / det.sequence.length
        });

        if (det.progress >= det.sequence.length) {
          det.progress = 0;
          this.bus.emit('nav:stop-sequence', { id: det.id, ids: [...det.sequence] });
          this.unlock(det.id, { trigger: 'stops' });
        }
      } else if (det.sequence[0] === stopId) {
        det.progress = 1;
        det.lastStepAt = now;
      } else if (det.sequence[Math.max(0, det.progress - 1)] !== stopId) {
        // Only reset if they didn't re-click the immediately previous stop
        det.progress = 0;
      }
    }
  }

  recordRuneRaycast(runeId, uv = { x: 0.5, y: 0.5 }) {
    if (!runeId) return;
    this.bus.emit('rune:raycast', { runeId, uv, at: Date.now() });
    const det = this.detectors.get(runeId);
    if (det && det.armed) {
      this.unlock(det.id, { trigger: 'rune', uv });
    }
  }

  setResonance(hz) {
    const numeric = Number(hz);
    if (!Number.isFinite(numeric) || numeric < 110 || numeric > 1760) {
      return { ok: false, error: 'Resonance frequency must be between 110 Hz and 1760 Hz.' };
    }
    this.state.resonanceHz = Math.round(numeric * 100) / 100;
    const errorFrom432 = Math.abs(this.state.resonanceHz - 432);
    this.bus.emit('resonance:tune', { hz: this.state.resonanceHz, error: errorFrom432 });

    if (errorFrom432 <= 0.5) {
      const det = this.detectors.get('resonance:verdi');
      if (det && det.armed) {
        this.unlock('resonance:verdi', { trigger: 'resonance', hz: this.state.resonanceHz });
      }
    }
    this._scheduleSave();
    return { ok: true, hz: this.state.resonanceHz };
  }

  /**
   * Processes a line from the Organum Console (`~`).
   * Built-in foundation verbs inspect/control the scene or uniforms;
   * any custom command is emitted on `terminal:command` for future easter-egg payloads.
   */
  handleCommand(rawLine, context = {}) {
    const line = String(rawLine || '').trim();
    if (!line) return { ok: false, output: 'Enter a command (type `help` for Organum Console verbs).' };

    const normalized = line.toLowerCase().replace(/\s+/g, ' ');
    this.bus.emit('terminal:command', { line, normalized, at: Date.now() });

    // Check command detectors
    for (const det of this.detectors.values()) {
      if (det.armed && det.type === 'command' && det.sequence.includes(normalized)) {
        this.unlock(det.id, { trigger: 'command', line });
      }
    }

    const parts = normalized.split(' ');
    const verb = parts[0];
    const arg = parts[1];

    if (verb === 'help' || verb === '?') {
      return {
        ok: true,
        output: [
          'ORGANUM CONSOLE // FOUNDATION COMMANDS:',
          '  help                 Show available console verbs',
          '  status               Inspect AnomalySystem uniforms & unlocked detectors',
          '  detectors            List all armed easter-egg foundation detectors',
          '  go <stop-id>         Dive camera to one of the 11 Stops (e.g. `go orbitdesktop`)',
          '  mode <name>          Switch view: `overview` | `rail` | `lineage` | `matrix`',
          '  tune <hz>            Retune Windchest harmonic pitch (e.g. `tune 432`, `tune 440`)',
          '  anomaly <0..1>       Tween uAnomalyFactor (wakes ferrofluid, caustics & crypt)',
          '  glitch <0..1>        Tween uGlitchIntensity (chromatic split & scanline hash)',
          '  crypt <open|close>   Toggle sub-floor Crypt Reliquary illumination',
          '  fire <detector-id>   Manually trigger a detector for testing payloads',
          '  reset                Reset AnomalySystem state and uniforms to baseline'
        ].join('\n')
      };
    }

    if (verb === 'status') {
      const u = this.getUniforms();
      return {
        ok: true,
        output: [
          `ANOMALY_STATE // v${this.state.v} | Resonance: ${this.state.resonanceHz} Hz`,
          `  uAnomalyFactor   : ${u.uAnomalyFactor.toFixed(3)}`,
          `  uGlitchIntensity : ${u.uGlitchIntensity.toFixed(3)}`,
          `  uWorldPhase      : ${u.uWorldPhase.toFixed(3)} rad`,
          `  uVolumetricPulse : ${u.uVolumetricPulse.toFixed(3)}`,
          `  uCryptReveal     : ${u.uCryptReveal.toFixed(3)}`,
          `  Unlocked (${this.state.unlocked.length}/${this.detectors.size}): ${this.state.unlocked.join(', ') || 'none'}`
        ].join('\n')
      };
    }

    if (verb === 'detectors') {
      const lines = this.listDetectors().map(
        (d) => `  [${d.unlocked ? 'UNLOCKED' : 'ARMED   '}] ${d.id.padEnd(20)} (${d.type}) — ${d.description}`
      );
      return {
        ok: true,
        output: ['REGISTERED ANOMALY DETECTORS:', ...lines].join('\n')
      };
    }

    if (verb === 'tune') {
      const res = this.setResonance(arg);
      if (!res.ok) return { ok: false, output: res.error };
      if (context.onTune) context.onTune(res.hz);
      return {
        ok: true,
        output: `[RESONANCE] Retuned Organum harmonic reference to ${res.hz} Hz.`
      };
    }

    if (verb === 'anomaly') {
      const val = Math.max(0, Math.min(1, Number(arg)));
      if (!Number.isFinite(val)) return { ok: false, output: 'Usage: anomaly <0.0 .. 1.0>' };
      this.tween({ uAnomalyFactor: val, uCryptReveal: val * 0.85, duration: 1.4 });
      return {
        ok: true,
        output: `[UNIFORMS] Tweening uAnomalyFactor -> ${val.toFixed(2)}`
      };
    }

    if (verb === 'glitch') {
      const val = Math.max(0, Math.min(1, Number(arg)));
      if (!Number.isFinite(val)) return { ok: false, output: 'Usage: glitch <0.0 .. 1.0>' };
      this.tween({ uGlitchIntensity: val, duration: 1.0 });
      return {
        ok: true,
        output: `[UNIFORMS] Tweening uGlitchIntensity -> ${val.toFixed(2)}`
      };
    }

    if (verb === 'crypt') {
      const open = arg !== 'close' && arg !== '0' && arg !== 'off';
      this.tween({
        uCryptReveal: open ? 1.0 : 0.0,
        uAnomalyFactor: open ? Math.max(0.65, this.uniforms.uAnomalyFactor.value) : 0.0,
        duration: 1.8
      });
      return {
        ok: true,
        output: open
          ? '[CRYPT] Sub-floor Crypt Reliquary aperture illuminated (foundation hook ready for payload).'
          : '[CRYPT] Crypt Reliquary sealed.'
      };
    }

    if (verb === 'fire' && arg) {
      if (!this.detectors.has(arg)) {
        return { ok: false, output: `Unknown detector "${arg}". Type \`detectors\` to list valid ids.` };
      }
      const ev = this.fire(arg);
      return {
        ok: true,
        output: `[TRIGGER] Fired detector "${ev.id}" (unlock count: ${ev.count}).`
      };
    }

    if (verb === 'go' && arg) {
      if (context.onGo) {
        const found = context.onGo(arg);
        if (found) {
          return { ok: true, output: `[NAV] Diving to Stop "${arg}"...` };
        }
      }
      return { ok: false, output: `Stop "${arg}" not found in Organum catalog.` };
    }

    if (verb === 'mode' && arg) {
      if (context.onMode) {
        const ok = context.onMode(arg);
        if (ok) return { ok: true, output: `[NAV] Switched Organum view mode to "${arg}".` };
      }
      return { ok: false, output: 'Valid modes: overview | rail | lineage | matrix' };
    }

    if (verb === 'reset') {
      this.reset();
      return {
        ok: true,
        output: '[ANOMALY] Cleared persistent state and restored baseline Organum uniforms.'
      };
    }

    return {
      ok: true,
      output: `[BUS] Dispatched "terminal:command" -> "${line}" (no payload bound yet; foundation hook active).`
    };
  }

  reset() {
    this.state = this._defaultState();
    for (const det of this.detectors.values()) {
      det.progress = 0;
      det.lastStepAt = 0;
    }
    this._tweens.length = 0;
    this.setUniforms({
      uAnomalyFactor: 0,
      uWorldPhase: 0,
      uGlitchIntensity: 0,
      uVolumetricPulse: 0.25,
      uCryptReveal: 0
    });
    this.saveStateImmediate();
  }

  tick(dt = 0.016, cameraSpeed = 0) {
    const safeDt = Math.min(0.1, Math.max(0, dt));
    this.uniforms.uTime.value += safeDt;

    // Advance active uniform tweens
    for (let i = this._tweens.length - 1; i >= 0; i--) {
      const tw = this._tweens[i];
      tw.elapsed += safeDt;
      const rawT = Math.min(1, tw.elapsed / tw.duration);
      const eased = tw.easeFn(rawT);
      const next = {};
      for (const k of tw.keys) {
        next[k] = tw.startValues[k] + (tw.targetValues[k] - tw.startValues[k]) * eased;
      }
      this.setUniforms(next);
      if (rawT >= 1) {
        this._tweens.splice(i, 1);
        tw.resolve(this.getUniforms());
      }
    }

    // Living phase advances continuously, accelerated by uAnomalyFactor
    const phaseRate = 0.08 * (1 + 2.5 * this.uniforms.uAnomalyFactor.value);
    this.uniforms.uWorldPhase.value += safeDt * phaseRate;

    // Volumetric pulse breathes with phase and camera velocity
    const speedBoost = Math.min(0.45, cameraSpeed * 0.015);
    const breath = 0.22 + 0.12 * Math.sin(this.uniforms.uTime.value * 1.4 + this.uniforms.uWorldPhase.value);
    this.uniforms.uVolumetricPulse.value = Math.min(
      1.0,
      breath + speedBoost + this.uniforms.uAnomalyFactor.value * 0.35
    );
  }

  installWindowSDK(appContext = {}) {
    if (typeof window === 'undefined') return null;
    const sdk = Object.freeze({
      version: '4.0.0-organum',
      threeRevision: appContext.threeRevision || '186',
      backend: appContext.backend || 'webgl2',
      nav: {
        getMode: () => appContext.getMode?.() || 'overview',
        setMode: (mode) => appContext.setMode?.(mode),
        go: (stopId) => appContext.go?.(stopId),
        getSplineT: () => appContext.getSplineT?.() ?? 0,
        setSplineT: (t) => appContext.setSplineT?.(t)
      },
      audio: {
        setFocusedStop: (id) => appContext.audio?.setFocusedStop?.(id),
        setCameraSpeed: (mps) => appContext.audio?.setCameraSpeed?.(mps),
        pulse: (kind) => appContext.audio?.pulse?.(kind),
        getResonanceHz: () => this.state.resonanceHz,
        setResonanceHz: (hz) => this.setResonance(hz)
      },
      anomaly: {
        bus: this.bus,
        uniforms: this.uniforms,
        getUniforms: () => this.getUniforms(),
        set: (partial) => this.setUniforms(partial),
        tween: (spec) => this.tween(spec),
        unlock: (id, payload) => this.unlock(id, payload),
        fire: (id) => this.fire(id),
        registerDetector: (def) => this.registerDetector(def),
        registerPayload: (id, fn) => this.registerPayload(id, fn),
        listDetectors: () => this.listDetectors(),
        getState: () => this.getStateSnapshot(),
        command: (line) => this.handleCommand(line, appContext.commandHooks),
        reset: () => this.reset()
      },
      quality: {
        get: () => appContext.getQuality?.() || 'high',
        set: (tier) => appContext.setQuality?.(tier)
      },
      scene: appContext.scene || null,
      camera: appContext.camera || null,
      renderer: appContext.renderer || null,
      stations: appContext.stations || null
    });

    window.__USSY4_SDK__ = sdk;
    return sdk;
  }

  destroy() {
    if (this._saveTimer) {
      clearTimeout(this._saveTimer);
      this._saveTimer = null;
    }
    if (this._boundKeyDown && typeof window !== 'undefined') {
      window.removeEventListener('keydown', this._boundKeyDown);
      this._boundKeyDown = null;
    }
    this._tweens.length = 0;
    this.materials.clear();
    this._payloadHooks.clear();
    this.bus.destroy();
  }
}
