/**
 * USSYSITE4 // THE HELIX ORGANUM — PROCEDURAL WEBAUDIO SYNTHESIZER
 *
 * Pure Web Audio API harmonic pipe-organ & glass resonance director.
 * Zero binary media files required.
 *
 * Features:
 * - Windchest continuous drone whose resonant filter cutoff tracks camera speed
 * - Per-Stop 5-voice extended harmonic chord beds (Cmaj9, Gadd9, Emaj9, Dm11, etc.)
 * - Master pitch tuning (440 Hz standard, retunable to 432 Hz / custom Hz via AnomalySystem)
 * - Cooldown-protected UI/navigation cues (`hover`, `select`, `dock`, `mode`, `tick`, `anomaly`)
 */

import { USSY_PROJECTS } from './projects.js';

const MUTE_KEY = 'ussysite4.audio.muted';
const VOL_KEY = 'ussysite4.audio.volume';

export class OrganumAudioDirector {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.compressor = null;
    this.droneFilter = null;
    this.droneGain = null;
    this.droneOscs = [];
    this.activeChordVoices = [];

    this.isMuted = this._loadMuted();
    this.volume = this._loadVolume();
    this.resonanceHz = 440;
    this.focusedStopId = null;
    this.cameraSpeed = 0;
    this.anomalyState = { factor: 0, phase: 0, glitch: 0 };

    this._lastCueTimes = new Map();
    this._unlocked = false;
    this._destroyed = false;

    this._boundUnlock = () => this.unlock();
    this._boundVisChange = () => this._onVisibilityChange();

    if (typeof window !== 'undefined') {
      window.addEventListener('pointerdown', this._boundUnlock, { passive: true });
      window.addEventListener('keydown', this._boundUnlock, { passive: true });
      document.addEventListener('visibilitychange', this._boundVisChange);
    }
  }

  _loadMuted() {
    if (typeof window === 'undefined' || !window.localStorage) return false;
    try {
      return window.localStorage.getItem(MUTE_KEY) === 'true';
    } catch {
      return false;
    }
  }

  _loadVolume() {
    if (typeof window === 'undefined' || !window.localStorage) return 0.8;
    try {
      const raw = window.localStorage.getItem(VOL_KEY);
      if (raw === null) return 0.8;
      const num = Number(raw);
      return Number.isFinite(num) ? Math.max(0, Math.min(1, num)) : 0.8;
    } catch {
      return 0.8;
    }
  }

  _ensureContext() {
    if (this._destroyed || typeof window === 'undefined') return null;
    if (this.ctx) return this.ctx;

    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return null;

    try {
      this.ctx = new AudioCtx();
      this.compressor = this.ctx.createDynamicsCompressor();
      this.compressor.threshold.value = -16;
      this.compressor.knee.value = 18;
      this.compressor.ratio.value = 6;
      this.compressor.attack.value = 0.005;
      this.compressor.release.value = 0.2;

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this.isMuted ? 0 : this.volume * 0.45;
      this.masterGain.connect(this.compressor);
      this.compressor.connect(this.ctx.destination);

      this._startWindchestDrone();
      return this.ctx;
    } catch {
      return null;
    }
  }

  _startWindchestDrone() {
    if (!this.ctx || !this.masterGain) return;

    this.droneFilter = this.ctx.createBiquadFilter();
    this.droneFilter.type = 'lowpass';
    this.droneFilter.frequency.value = 210;
    this.droneFilter.Q.value = 3.2;

    this.droneGain = this.ctx.createGain();
    this.droneGain.gain.value = 0.08;

    this.droneFilter.connect(this.droneGain);
    this.droneGain.connect(this.masterGain);

    const baseFreqs = [65.41, 98.0, 130.81]; // C2, G2, C3 pipe-organ sub-foundation
    const types = ['sine', 'triangle', 'sawtooth'];
    const detunes = [0, -4, 5];

    for (let i = 0; i < baseFreqs.length; i++) {
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = types[i];
      osc.frequency.value = baseFreqs[i];
      osc.detune.value = detunes[i];
      g.gain.value = i === 2 ? 0.18 : 0.38;
      osc.connect(g);
      g.connect(this.droneFilter);
      osc.start();
      this.droneOscs.push({ osc, baseHz: baseFreqs[i] });
    }
  }

  unlock() {
    if (this._destroyed) return;
    const ctx = this._ensureContext();
    if (ctx && ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
    this._unlocked = true;
  }

  _onVisibilityChange() {
    if (!this.ctx) return;
    if (document.hidden) {
      this.ctx.suspend().catch(() => {});
    } else if (!this.isMuted && this._unlocked) {
      this.ctx.resume().catch(() => {});
    }
  }

  setMuted(muted) {
    this.isMuted = Boolean(muted);
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.setItem(MUTE_KEY, String(this.isMuted));
      } catch {}
    }
    if (this.masterGain && this.ctx) {
      const target = this.isMuted ? 0 : this.volume * 0.45;
      this.masterGain.gain.setTargetAtTime(target, this.ctx.currentTime, 0.04);
    }
    return this.isMuted;
  }

  toggleMute() {
    return this.setMuted(!this.isMuted);
  }

  setVolume(normalizedVolume) {
    this.volume = Math.max(0, Math.min(1, Number(normalizedVolume) || 0));
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.setItem(VOL_KEY, String(this.volume));
      } catch {}
    }
    if (this.masterGain && this.ctx && !this.isMuted) {
      this.masterGain.gain.setTargetAtTime(this.volume * 0.45, this.ctx.currentTime, 0.04);
    }
    return this.volume;
  }

  setResonanceHz(hz) {
    const num = Number(hz);
    if (!Number.isFinite(num) || num < 110 || num > 1760) return;
    this.resonanceHz = num;
    const ratio = this.resonanceHz / 440;
    if (this.ctx) {
      const now = this.ctx.currentTime;
      for (const item of this.droneOscs) {
        item.osc.frequency.setTargetAtTime(item.baseHz * ratio, now, 0.12);
      }
      if (this.focusedStopId) {
        this.setFocusedStop(this.focusedStopId);
      }
    }
  }

  setCameraSpeed(mps) {
    this.cameraSpeed = Math.max(0, Number(mps) || 0);
    if (this.ctx && this.droneFilter && !this.isMuted) {
      const cutoff = Math.min(1650, 190 + this.cameraSpeed * 28 + this.anomalyState.factor * 420);
      this.droneFilter.frequency.setTargetAtTime(cutoff, this.ctx.currentTime, 0.08);
    }
  }

  setAnomaly({ factor = 0, phase = 0, glitch = 0 } = {}) {
    this.anomalyState.factor = factor;
    this.anomalyState.phase = phase;
    this.anomalyState.glitch = glitch;
    if (this.ctx && this.droneFilter) {
      this.droneFilter.Q.setTargetAtTime(3.0 + factor * 5.5 + glitch * 4.0, this.ctx.currentTime, 0.1);
    }
  }

  setFocusedStop(stopId) {
    this.focusedStopId = stopId || null;
    if (!this.ctx || this.isMuted) return;

    const now = this.ctx.currentTime;
    // Fade out previous chord voices
    while (this.activeChordVoices.length > 0) {
      const old = this.activeChordVoices.pop();
      try {
        old.gain.gain.setTargetAtTime(0.0001, now, 0.18);
        old.osc.stop(now + 0.85);
      } catch {}
    }

    if (!stopId) return;
    const project = USSY_PROJECTS.find((p) => p.id === stopId);
    if (!project || !project.chord || !Array.isArray(project.chord.notesHz)) return;

    const ratio = this.resonanceHz / 440;
    for (let i = 0; i < project.chord.notesHz.length; i++) {
      const freq = project.chord.notesHz[i] * ratio;
      const osc = this.ctx.createOscillator();
      const filter = this.ctx.createBiquadFilter();
      const gain = this.ctx.createGain();

      osc.type = i === 0 ? 'triangle' : i % 2 === 0 ? 'sine' : 'sawtooth';
      osc.frequency.value = freq;
      osc.detune.value = (i - 2) * 3.5;

      filter.type = 'lowpass';
      filter.frequency.value = 980 + i * 240;

      gain.gain.value = 0.0001;
      const targetVoiceGain = i === 0 ? 0.045 : 0.024;
      gain.gain.setTargetAtTime(targetVoiceGain, now + 0.02, 0.24);
      gain.gain.setTargetAtTime(targetVoiceGain * 0.45, now + 1.2, 1.4);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      this.activeChordVoices.push({ osc, gain });
    }
  }

  pulse(kind = 'hover', stopId = null) {
    if (this.isMuted || this._destroyed) return;
    const ctx = this._ensureContext();
    if (!ctx || ctx.state !== 'running') return;

    const nowMs = performance.now();
    const cooldownMs = kind === 'hover' ? 55 : kind === 'tick' ? 35 : 80;
    const last = this._lastCueTimes.get(kind) || 0;
    if (nowMs - last < cooldownMs) return;
    this._lastCueTimes.set(kind, nowMs);

    const t = ctx.currentTime;
    const ratio = this.resonanceHz / 440;
    const project = stopId ? USSY_PROJECTS.find((p) => p.id === stopId) : null;
    const baseRoot = (project?.chord?.rootHz || 261.63) * ratio;

    if (kind === 'hover') {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(baseRoot * 1.5, t);
      osc.frequency.exponentialRampToValueAtTime(baseRoot * 2.0, t + 0.09);
      g.gain.setValueAtTime(0.05, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.11);
      osc.connect(g);
      g.connect(this.masterGain);
      osc.start(t);
      osc.stop(t + 0.12);
      return;
    }

    if (kind === 'select' || kind === 'dock') {
      const ratios = [1.0, 1.5, 2.0];
      for (let i = 0; i < ratios.length; i++) {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = i === 1 ? 'triangle' : 'sine';
        osc.frequency.setValueAtTime(baseRoot * ratios[i], t + i * 0.03);
        g.gain.setValueAtTime(0.06, t + i * 0.03);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.42 + i * 0.05);
        osc.connect(g);
        g.connect(this.masterGain);
        osc.start(t + i * 0.03);
        osc.stop(t + 0.5);
      }
      return;
    }

    if (kind === 'mode') {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(220 * ratio, t);
      osc.frequency.exponentialRampToValueAtTime(440 * ratio, t + 0.18);
      g.gain.setValueAtTime(0.055, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);
      osc.connect(g);
      g.connect(this.masterGain);
      osc.start(t);
      osc.stop(t + 0.24);
      return;
    }

    if (kind === 'tick') {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880 * ratio, t);
      g.gain.setValueAtTime(0.018, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.03);
      osc.connect(g);
      g.connect(this.masterGain);
      osc.start(t);
      osc.stop(t + 0.035);
      return;
    }

    if (kind === 'anomaly') {
      const notes = [220, 277.18, 329.63, 440, 554.37].map((n) => n * ratio);
      for (let i = 0; i < notes.length; i++) {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(notes[i], t + i * 0.055);
        g.gain.setValueAtTime(0.065, t + i * 0.055);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.9 + i * 0.08);
        osc.connect(g);
        g.connect(this.masterGain);
        osc.start(t + i * 0.055);
        osc.stop(t + 1.05);
      }
    }
  }

  // Compatibility aliases
  hover(stopId) { this.pulse('hover', stopId); }
  select(stopId) { this.pulse('select', stopId); }
  warp() { this.pulse('mode'); }
  tick() { this.pulse('tick'); }

  destroy() {
    this._destroyed = true;
    if (typeof window !== 'undefined') {
      window.removeEventListener('pointerdown', this._boundUnlock);
      window.removeEventListener('keydown', this._boundUnlock);
      document.removeEventListener('visibilitychange', this._boundVisChange);
    }
    if (this.ctx) {
      try {
        this.ctx.close();
      } catch {}
      this.ctx = null;
    }
  }
}
