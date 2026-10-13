/**
 * USSYSITE4 // THE HELIX ORGANUM — APPLICATION CONTROLLER
 *
 * Coordinates:
 * - OrganumEngine (Three.js r186 3D scene, camera modes, 11 Stops, shaders & post-processing)
 * - OrganumAudioDirector (WebAudio windchest drone & harmonic Stop chords)
 * - AnomalySystem (Easter egg foundation, detectors, uniforms, terminal, window.__USSY4_SDK__)
 * - DOM UI (Stop Ribbon, Sector Filters, 4 View Modes, Inspector Drawer, Command Palette, Organum Console, Matrix Index)
 */

import * as THREE from 'three';
import { USSY_PROJECTS, USSY_CATEGORIES } from './projects.js';
import { OrganumAudioDirector } from './audio.js';
import { AnomalySystem, isTypingTarget } from './anomaly/anomaly-system.js';
import { OrganumEngine } from './engine/organum-engine.js';

export class OrganumApp {
  constructor() {
    this.projects = USSY_PROJECTS;
    this.categories = USSY_CATEGORIES;

    this.activeView = 'overview'; // 'overview' | 'rail' | 'lineage' | 'matrix'
    this.activeCategory = 'all';
    this.selectedProject = null;
    this.paletteIndex = 0;
    this.filteredPaletteProjects = [...this.projects];
    this._telemetryTimer = null;
    this._toastTimer = null;

    this.audio = new OrganumAudioDirector();
    this.anomaly = new AnomalySystem({
      serverEndpoint: '/api/anomaly/state'
    });

    this._initDOMRefs();
    this._initEngine();
    this._renderStopRibbon();
    this._renderMatrixTable('');
    this._bindUIEvents();
    this._bindAnomalyEvents();
    this._syncAudioUI();
    this._updateAnomalyStatusBar();
    this._applyInitialHash();

    // Install frozen global SDK for browser console & next-agent continuation
    this.sdk = this.anomaly.installWindowSDK({
      threeRevision: THREE.REVISION,
      backend: 'webgl2',
      audio: this.audio,
      scene: this.engine?.scene,
      camera: this.engine?.camera,
      renderer: this.engine?.renderer,
      stations: this.engine?.stations,
      getMode: () => this.activeView,
      setMode: (m) => this.setViewMode(m),
      go: (id) => this.inspectProject(id),
      getSplineT: () => this.engine?.splineT ?? 0,
      setSplineT: (t) => {
        if (this.engine) {
          this.engine.setViewMode('rail');
          this.engine.targetSplineT = Math.max(0, Math.min(1, Number(t) || 0));
        }
      },
      getQuality: () => this.engine?.qualityTier || 'high',
      setQuality: (tier) => this.engine?.setQuality(tier),
      commandHooks: {
        onGo: (id) => this.inspectProject(id),
        onMode: (m) => this.setViewMode(m),
        onTune: (hz) => {
          this.audio.setResonanceHz(hz);
          this._updateAnomalyStatusBar();
        }
      }
    });

    window.__USSY_APP__ = this;
    console.info('[ussysite4] The Helix Organum initialized. SDK ready at window.__USSY4_SDK__');
  }

  _initDOMRefs() {
    this.canvasContainer = document.getElementById('canvas-container');
    this.stopRibbonEl = document.getElementById('stop-ribbon');
    this.sectorButtons = [...document.querySelectorAll('.sector-chip')];
    this.viewButtons = [...document.querySelectorAll('.view-mode-btn')];

    // Inspector Drawer
    this.inspectorDrawer = document.getElementById('inspector-drawer');
    this.inspectStopBadge = document.getElementById('inspect-stop-badge');
    this.inspectCategory = document.getElementById('inspect-category');
    this.inspectChord = document.getElementById('inspect-chord');
    this.inspectStatus = document.getElementById('inspect-status');
    this.inspectTitle = document.getElementById('inspect-title');
    this.inspectSubtitle = document.getElementById('inspect-subtitle');
    this.inspectDesc = document.getElementById('inspect-desc');
    this.inspectSpecs = document.getElementById('inspect-specs');
    this.inspectFeatures = document.getElementById('inspect-features');
    this.inspectConnections = document.getElementById('inspect-connections');
    this.inspectTelemetry = document.getElementById('inspect-telemetry');
    this.inspectBtnGithub = document.getElementById('inspect-btn-github');
    this.inspectBtnDemo = document.getElementById('inspect-btn-demo');
    this.inspectBtnCopy = document.getElementById('inspect-btn-copy');
    this.inspectorCloseBtn = document.getElementById('inspector-close-btn');

    // Matrix View
    this.matrixContainer = document.getElementById('matrix-view-container');
    this.matrixTableBody = document.getElementById('matrix-table-body');
    this.matrixSearchInput = document.getElementById('matrix-search-input');

    // Command Palette Modal
    this.paletteModal = document.getElementById('command-palette-modal');
    this.paletteInput = document.getElementById('command-palette-input');
    this.paletteResults = document.getElementById('command-palette-results');

    // Organum Console Modal (Easter Egg Foundation)
    this.consoleModal = document.getElementById('console-modal');
    this.consoleOutput = document.getElementById('console-output');
    this.consoleForm = document.getElementById('console-form');
    this.consoleInput = document.getElementById('console-input');
    this.detectorGrid = document.getElementById('detector-grid');

    // About / Blueprint Modal
    this.aboutModal = document.getElementById('about-modal');

    // Audio & Telemetry HUD
    this.audioToggleBtn = document.getElementById('audio-toggle-btn');
    this.audioVolumeInput = document.getElementById('audio-volume');
    this.audioVolumeOutput = document.getElementById('audio-volume-value');
    this.fpsEl = document.getElementById('telemetry-fps');
    this.particlesEl = document.getElementById('telemetry-particles');
    this.modeEl = document.getElementById('telemetry-mode');
    this.resonanceEl = document.getElementById('telemetry-resonance');
    this.anomalyEl = document.getElementById('telemetry-anomaly');
    this.toastEl = document.getElementById('anomaly-toast');
    this.hoverBannerEl = document.getElementById('hover-stop-banner');
  }

  _initEngine() {
    this.engine = new OrganumEngine({
      container: this.canvasContainer,
      audio: this.audio,
      anomaly: this.anomaly,
      onSelectStop: (project) => this._openInspector(project),
      onHoverStop: (stopId) => this._handleHoverStop(stopId),
      onCameraTelemetry: (stats) => this._handleTelemetry(stats),
      onRuneProgress: (runeId, progress) => this._handleRuneProgress(runeId, progress)
    });
  }

  _renderStopRibbon() {
    if (!this.stopRibbonEl) return;
    this.stopRibbonEl.innerHTML = '';

    this.projects.forEach((proj, idx) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'stop-pill-btn';
      btn.dataset.stopId = proj.id;
      btn.title = `Stop ${proj.stopRoman}: ${proj.name} — ${proj.stopName} (Key ${idx < 9 ? idx + 1 : idx === 9 ? '0' : '-'})`;
      btn.innerHTML = `
        <span class="stop-roman" style="color:${proj.accentColor}">${proj.stopRoman}</span>
        <span class="stop-short-name">${proj.name}</span>
      `;
      btn.addEventListener('click', () => {
        this.inspectProject(proj.id);
      });
      this.stopRibbonEl.appendChild(btn);
    });
  }

  _bindUIEvents() {
    // Sector Filter Chips
    for (const chip of this.sectorButtons) {
      chip.addEventListener('click', () => {
        const cat = chip.dataset.category || 'all';
        this.setCategoryFilter(cat);
      });
    }

    // View Mode Switcher
    for (const btn of this.viewButtons) {
      btn.addEventListener('click', () => {
        const mode = btn.dataset.view || 'overview';
        this.setViewMode(mode);
      });
    }

    // Inspector actions
    this.inspectorCloseBtn?.addEventListener('click', () => this.closeInspector());
    this.inspectBtnCopy?.addEventListener('click', () => {
      if (!this.selectedProject) return;
      const cmd = `git clone ${this.selectedProject.github}.git`;
      navigator.clipboard?.writeText(cmd).catch(() => {});
      const span = this.inspectBtnCopy.querySelector('span');
      if (span) {
        const prev = span.textContent;
        span.textContent = 'COPIED!';
        setTimeout(() => { span.textContent = prev; }, 1400);
      }
    });

    // Matrix filter
    this.matrixSearchInput?.addEventListener('input', (e) => {
      this._renderMatrixTable(e.target.value || '');
    });

    // Command Palette
    document.getElementById('cmd-palette-btn')?.addEventListener('click', () => this.openCommandPalette());
    this.paletteModal?.addEventListener('click', (e) => {
      if (e.target === this.paletteModal) this.closeCommandPalette();
    });
    this.paletteInput?.addEventListener('input', () => {
      this.paletteIndex = 0;
      this._renderPaletteResults(this.paletteInput.value);
    });
    this.paletteInput?.addEventListener('keydown', (e) => this._handlePaletteKeydown(e));

    // Organum Console Modal
    document.getElementById('console-open-btn')?.addEventListener('click', () => this.openConsoleModal());
    document.getElementById('console-close-btn')?.addEventListener('click', () => this.closeConsoleModal());
    this.consoleModal?.addEventListener('click', (e) => {
      if (e.target === this.consoleModal) this.closeConsoleModal();
    });
    this.consoleForm?.addEventListener('submit', (e) => {
      e.preventDefault();
      const raw = this.consoleInput.value;
      this.consoleInput.value = '';
      this.executeConsoleCommand(raw);
    });

    document.querySelectorAll('[data-console-cmd]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const cmd = btn.getAttribute('data-console-cmd');
        if (cmd) this.executeConsoleCommand(cmd);
      });
    });

    // About / Blueprint Modal
    document.getElementById('about-open-btn')?.addEventListener('click', () => {
      this.aboutModal.hidden = false;
    });
    document.getElementById('about-close-btn')?.addEventListener('click', () => {
      this.aboutModal.hidden = true;
    });
    this.aboutModal?.addEventListener('click', (e) => {
      if (e.target === this.aboutModal) this.aboutModal.hidden = true;
    });

    // Audio Controls
    this.audioToggleBtn?.addEventListener('click', () => {
      this.audio.unlock();
      this.audio.toggleMute();
      this._syncAudioUI();
    });
    this.audioVolumeInput?.addEventListener('input', (e) => {
      this.audio.unlock();
      const val = Number(e.target.value) / 100;
      this.audio.setVolume(val);
      if (this.audio.isMuted && val > 0) {
        this.audio.setMuted(false);
      }
      this._syncAudioUI();
    });

    // Global Keyboard Shortcuts
    window.addEventListener('keydown', (e) => this._handleGlobalKeydown(e));
    window.addEventListener('hashchange', () => this._applyInitialHash());
  }

  _bindAnomalyEvents() {
    this.anomaly.bus.on('anomaly:unlock', (ev) => {
      this.audio.pulse('anomaly');
      this.showToast(`FOUNDATION DETECTOR UNLOCKED // ${ev.label} (${ev.id})`);
      this._renderDetectorGrid();
      this._updateAnomalyStatusBar();
    });

    this.anomaly.bus.on('anomaly:factor', () => this._updateAnomalyStatusBar());
    this.anomaly.bus.on('resonance:tune', ({ hz }) => {
      this.audio.setResonanceHz(hz);
      this._updateAnomalyStatusBar();
    });
    this.anomaly.bus.on('persist:changed', () => {
      this._renderDetectorGrid();
      this._updateAnomalyStatusBar();
    });
  }

  _handleGlobalKeydown(e) {
    if (e.key === 'Escape') {
      if (!this.paletteModal.hidden) {
        this.closeCommandPalette();
        return;
      }
      if (!this.consoleModal.hidden) {
        this.closeConsoleModal();
        return;
      }
      if (!this.aboutModal.hidden) {
        this.aboutModal.hidden = true;
        return;
      }
      if (!this.inspectorDrawer.hidden) {
        this.closeInspector();
        return;
      }
    }

    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      this.openCommandPalette();
      return;
    }

    if (isTypingTarget(e.target)) return;

    if (e.key === '/') {
      e.preventDefault();
      this.openCommandPalette();
      return;
    }

    if (e.key === '`' || e.key === '~') {
      e.preventDefault();
      if (this.consoleModal.hidden) {
        this.openConsoleModal();
      } else {
        this.closeConsoleModal();
      }
      return;
    }

    if (e.key.toLowerCase() === 'v') {
      const order = ['overview', 'rail', 'lineage', 'matrix'];
      const next = order[(order.indexOf(this.activeView) + 1) % order.length];
      this.setViewMode(next);
      return;
    }

    if (e.key.toLowerCase() === 'm') {
      this.audio.unlock();
      this.audio.toggleMute();
      this._syncAudioUI();
      return;
    }

    // Windrail traversal keys W/S
    if (e.key.toLowerCase() === 'w') {
      this.engine?.stepSpline(0.045);
      this._syncViewButtons('rail');
      return;
    }
    if (e.key.toLowerCase() === 's') {
      this.engine?.stepSpline(-0.045);
      this._syncViewButtons('rail');
      return;
    }

    // Direct Stop jump keys: 1-9 -> Stops 0-8, 0 -> Stop 9, - -> Stop 10
    const stopKeyMap = {
      '1': 0, '2': 1, '3': 2, '4': 3, '5': 4,
      '6': 5, '7': 6, '8': 7, '9': 8, '0': 9, '-': 10
    };
    if (Object.prototype.hasOwnProperty.call(stopKeyMap, e.key)) {
      const targetProj = this.projects[stopKeyMap[e.key]];
      if (targetProj) {
        this.inspectProject(targetProj.id);
      }
    }
  }

  setCategoryFilter(category) {
    this.activeCategory = category || 'all';
    for (const chip of this.sectorButtons) {
      const active = chip.dataset.category === this.activeCategory;
      chip.classList.toggle('active', active);
      chip.setAttribute('aria-pressed', String(active));
    }
    this.engine?.setFilter(this.activeCategory);
    this._renderMatrixTable(this.matrixSearchInput?.value || '');
  }

  setViewMode(mode) {
    const valid = ['overview', 'rail', 'lineage', 'matrix'];
    if (!valid.includes(mode)) return false;
    this.activeView = mode;
    this._syncViewButtons(mode);

    if (mode === 'matrix') {
      this.matrixContainer.hidden = false;
      this.canvasContainer.classList.add('canvas-blurred');
    } else {
      this.matrixContainer.hidden = true;
      this.canvasContainer.classList.remove('canvas-blurred');
      this.engine?.setViewMode(mode);
    }

    if (this.modeEl) {
      this.modeEl.textContent = `MODE: ${mode.toUpperCase()}`;
    }
    return true;
  }

  _syncViewButtons(mode) {
    this.activeView = mode;
    for (const btn of this.viewButtons) {
      const active = btn.dataset.view === mode;
      btn.classList.toggle('active', active);
      btn.setAttribute('aria-pressed', String(active));
    }
  }

  inspectProject(projectId) {
    const project = this.projects.find((p) => p.id === projectId.toLowerCase());
    if (!project) return false;

    if (this.activeView === 'matrix') {
      this.setViewMode('overview');
    }
    this.engine?.focusStop(project.id, false);
    this._openInspector(project);
    return true;
  }

  _openInspector(project) {
    this.selectedProject = project;
    const catInfo = this.categories[project.category] || { title: project.category, color: project.accentColor };

    // Highlight active Stop pill in top ribbon
    document.querySelectorAll('.stop-pill-btn').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.stopId === project.id);
    });

    this.inspectStopBadge.textContent = `STOP ${project.stopRoman}`;
    this.inspectStopBadge.style.borderColor = project.accentColor;
    this.inspectStopBadge.style.color = project.accentColor;

    this.inspectCategory.textContent = catInfo.title;
    this.inspectCategory.style.color = catInfo.color;

    this.inspectChord.textContent = `${project.chord.name} · ${project.chord.rootHz} Hz`;
    this.inspectStatus.textContent = project.status.toUpperCase();
    this.inspectStatus.className = `status-pill ${project.status.toLowerCase()}`;

    this.inspectTitle.textContent = project.name;
    this.inspectSubtitle.textContent = `${project.stopName} — ${project.tagline}`;
    this.inspectDesc.textContent = project.description;

    // Specs Grid
    this.inspectSpecs.innerHTML = '';
    for (const [label, value] of Object.entries(project.specs || {})) {
      const card = document.createElement('div');
      card.className = 'spec-card';
      card.innerHTML = `
        <div class="spec-label">${label}</div>
        <div class="spec-value">${value}</div>
      `;
      this.inspectSpecs.appendChild(card);
    }

    // Features List
    this.inspectFeatures.innerHTML = '';
    for (const feat of project.features || []) {
      const li = document.createElement('li');
      li.textContent = feat;
      this.inspectFeatures.appendChild(li);
    }

    // Connected Stops
    this.inspectConnections.innerHTML = '';
    for (const connId of project.connections || []) {
      const target = this.projects.find((p) => p.id === connId);
      if (!target) continue;
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'connection-chip';
      chip.innerHTML = `<span style="color:${target.accentColor}">${target.stopRoman}</span> ${target.name}`;
      chip.addEventListener('click', () => this.inspectProject(target.id));
      this.inspectConnections.appendChild(chip);
    }

    // Links
    this.inspectBtnGithub.href = project.github;
    if (project.demo) {
      this.inspectBtnDemo.href = project.demo;
      this.inspectBtnDemo.hidden = false;
    } else {
      this.inspectBtnDemo.hidden = true;
    }

    // Stream Telemetry Terminal
    if (this._telemetryTimer) clearInterval(this._telemetryTimer);
    this.inspectTelemetry.innerHTML = '';
    const lines = String(project.telemetry || '').split('\n');
    let lineIdx = 0;
    const appendLine = () => {
      if (lineIdx >= lines.length) {
        clearInterval(this._telemetryTimer);
        this._telemetryTimer = null;
        return;
      }
      const div = document.createElement('div');
      div.className = 'telemetry-line';
      div.textContent = lines[lineIdx++];
      this.inspectTelemetry.appendChild(div);
      this.audio.tick();
    };
    appendLine();
    this._telemetryTimer = setInterval(appendLine, 190);

    this.inspectorDrawer.hidden = false;
    if (window.history && window.location.hash !== `#${project.id}`) {
      window.history.replaceState(null, '', `#${project.id}`);
    }
  }

  closeInspector() {
    this.inspectorDrawer.hidden = true;
    this.selectedProject = null;
    if (this._telemetryTimer) {
      clearInterval(this._telemetryTimer);
      this._telemetryTimer = null;
    }
    document.querySelectorAll('.stop-pill-btn').forEach((btn) => btn.classList.remove('active'));
    this.engine?.clearFocus();
    if (window.history && window.location.hash) {
      window.history.replaceState(null, '', window.location.pathname);
    }
  }

  _handleHoverStop(stopId) {
    if (!this.hoverBannerEl) return;
    if (!stopId) {
      this.hoverBannerEl.hidden = true;
      return;
    }
    const proj = this.projects.find((p) => p.id === stopId);
    if (!proj) return;
    this.hoverBannerEl.hidden = false;
    this.hoverBannerEl.innerHTML = `
      <span class="hover-roman" style="color:${proj.accentColor}">STOP ${proj.stopRoman}</span>
      <strong>${proj.name}</strong>
      <span class="hover-archetype">${proj.stopName}</span>
      <span class="hover-chord">${proj.chord.name}</span>
    `;
  }

  _handleRuneProgress(runeId, progress) {
    if (!this.hoverBannerEl) return;
    if (!runeId || progress <= 0) return;
    const pct = Math.round(progress * 100);
    this.hoverBannerEl.hidden = false;
    this.hoverBannerEl.innerHTML = `
      <span class="hover-roman" style="color:#f59e0b">RUNE SIGIL</span>
      <strong>${runeId.toUpperCase()}</strong>
      <span class="hover-archetype">ATUNING RESONANCE... ${pct}%</span>
    `;
  }

  _renderMatrixTable(query = '') {
    if (!this.matrixTableBody) return;
    const q = query.trim().toLowerCase();
    this.matrixTableBody.innerHTML = '';

    const filtered = this.projects.filter((p) => {
      const catMatch = this.activeCategory === 'all' || p.category === this.activeCategory;
      if (!catMatch) return false;
      if (!q) return true;
      const hay = `${p.name} ${p.stopName} ${p.description} ${p.tags.join(' ')} ${Object.values(p.specs).join(' ')}`.toLowerCase();
      return hay.includes(q);
    });

    for (const proj of filtered) {
      const cat = this.categories[proj.category];
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>
          <div class="matrix-stop-cell">
            <span class="matrix-roman" style="color:${proj.accentColor}">${proj.stopRoman}</span>
            <div>
              <div class="matrix-proj-name">${proj.name}</div>
              <div class="matrix-stop-name">${proj.stopName}</div>
            </div>
          </div>
        </td>
        <td><span class="matrix-cat-pill" style="border-color:${cat?.color || proj.accentColor};color:${cat?.color || proj.accentColor}">${cat?.shortTitle || proj.category}</span></td>
        <td class="matrix-desc-cell">${proj.tagline}</td>
        <td>
          <div class="matrix-tags-wrap">
            ${proj.tags.slice(0, 4).map((t) => `<span class="matrix-tag">${t}</span>`).join('')}
          </div>
        </td>
        <td><span class="matrix-chord-pill">${proj.chord.name}</span></td>
        <td>
          <div class="matrix-actions">
            <button type="button" class="matrix-inspect-btn" data-inspect="${proj.id}">Inspect 3D</button>
            <a href="${proj.github}" target="_blank" rel="noopener noreferrer" class="matrix-gh-link">GitHub</a>
          </div>
        </td>
      `;
      tr.querySelector('[data-inspect]')?.addEventListener('click', () => {
        this.inspectProject(proj.id);
      });
      this.matrixTableBody.appendChild(tr);
    }
  }

  openCommandPalette() {
    this.paletteModal.hidden = false;
    this.paletteInput.value = '';
    this.paletteIndex = 0;
    this._renderPaletteResults('');
    setTimeout(() => this.paletteInput.focus(), 20);
  }

  closeCommandPalette() {
    this.paletteModal.hidden = true;
  }

  _renderPaletteResults(rawQuery = '') {
    const q = rawQuery.trim().toLowerCase();
    this.filteredPaletteProjects = this.projects.filter((p) => {
      if (!q) return true;
      const hay = `${p.id} ${p.name} ${p.stopRoman} ${p.stopName} ${p.tagline} ${p.tags.join(' ')}`.toLowerCase();
      return hay.includes(q);
    });

    this.paletteResults.innerHTML = '';
    this.filteredPaletteProjects.forEach((proj, idx) => {
      const item = document.createElement('div');
      item.className = `palette-item ${idx === this.paletteIndex ? 'selected' : ''}`;
      item.innerHTML = `
        <div class="palette-item-left">
          <span class="palette-roman" style="color:${proj.accentColor}">STOP ${proj.stopRoman}</span>
          <div>
            <div class="palette-title">${proj.name} <span class="palette-archetype">// ${proj.stopName}</span></div>
            <div class="palette-sub">${proj.tagline}</div>
          </div>
        </div>
        <span class="palette-chord">${proj.chord.name}</span>
      `;
      item.addEventListener('click', () => {
        this.closeCommandPalette();
        this.inspectProject(proj.id);
      });
      this.paletteResults.appendChild(item);
    });
  }

  _handlePaletteKeydown(e) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (this.filteredPaletteProjects.length > 0) {
        this.paletteIndex = (this.paletteIndex + 1) % this.filteredPaletteProjects.length;
        this._renderPaletteResults(this.paletteInput.value);
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (this.filteredPaletteProjects.length > 0) {
        this.paletteIndex = (this.paletteIndex - 1 + this.filteredPaletteProjects.length) % this.filteredPaletteProjects.length;
        this._renderPaletteResults(this.paletteInput.value);
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const raw = this.paletteInput.value.trim();
      const target = this.filteredPaletteProjects[this.paletteIndex];
      if (target) {
        this.closeCommandPalette();
        this.inspectProject(target.id);
      } else if (raw) {
        this.closeCommandPalette();
        this.openConsoleModal();
        this.executeConsoleCommand(raw);
      }
    }
  }

  openConsoleModal() {
    this.consoleModal.hidden = false;
    this._renderDetectorGrid();
    this._updateAnomalyStatusBar();
    setTimeout(() => this.consoleInput?.focus(), 20);
  }

  closeConsoleModal() {
    this.consoleModal.hidden = true;
  }

  executeConsoleCommand(rawLine) {
    if (!rawLine || !rawLine.trim()) return;
    const promptLine = document.createElement('div');
    promptLine.className = 'console-line prompt';
    promptLine.textContent = `organum> ${rawLine}`;
    this.consoleOutput.appendChild(promptLine);

    const res = this.anomaly.handleCommand(rawLine, {
      onGo: (id) => {
        const ok = this.inspectProject(id);
        if (ok) this.closeConsoleModal();
        return ok;
      },
      onMode: (m) => {
        const ok = this.setViewMode(m);
        if (ok) this.closeConsoleModal();
        return ok;
      },
      onTune: (hz) => {
        this.audio.setResonanceHz(hz);
      }
    });

    const outLine = document.createElement('pre');
    outLine.className = `console-line ${res.ok ? 'response' : 'error'}`;
    outLine.textContent = res.output;
    this.consoleOutput.appendChild(outLine);
    this.consoleOutput.scrollTop = this.consoleOutput.scrollHeight;

    this._renderDetectorGrid();
    this._updateAnomalyStatusBar();
  }

  _renderDetectorGrid() {
    if (!this.detectorGrid) return;
    const list = this.anomaly.listDetectors();
    this.detectorGrid.innerHTML = '';

    for (const det of list) {
      const card = document.createElement('div');
      card.className = `detector-card ${det.unlocked ? 'unlocked' : ''}`;
      card.innerHTML = `
        <div class="detector-header">
          <span class="detector-type">${det.type.toUpperCase()}</span>
          <span class="detector-state">${det.unlocked ? `UNLOCKED (x${det.count})` : 'ARMED'}</span>
        </div>
        <div class="detector-title">${det.label}</div>
        <div class="detector-id">${det.id}</div>
        <div class="detector-desc">${det.description}</div>
      `;
      card.addEventListener('click', () => {
        this.executeConsoleCommand(`fire ${det.id}`);
      });
      this.detectorGrid.appendChild(card);
    }
  }

  _updateAnomalyStatusBar() {
    const u = this.anomaly.getUniforms();
    const state = this.anomaly.getStateSnapshot();
    if (this.resonanceEl) {
      this.resonanceEl.textContent = `PITCH: ${state.resonanceHz} HZ`;
    }
    if (this.anomalyEl) {
      this.anomalyEl.textContent = `ANOMALY: ${u.uAnomalyFactor.toFixed(2)} // UNLOCKED: ${state.unlocked.length}/12`;
    }
  }

  _syncAudioUI() {
    if (this.audioToggleBtn) {
      const span = this.audioToggleBtn.querySelector('span');
      if (span) {
        span.textContent = this.audio.isMuted ? 'ORGANUM: MUTED' : 'ORGANUM: ON';
      }
      this.audioToggleBtn.setAttribute('aria-pressed', String(this.audio.isMuted));
    }
    const pct = Math.round(this.audio.volume * 100);
    if (this.audioVolumeInput) this.audioVolumeInput.value = String(pct);
    if (this.audioVolumeOutput) this.audioVolumeOutput.textContent = String(pct);
  }

  _handleTelemetry(stats) {
    if (this.fpsEl) {
      this.fpsEl.textContent = `FPS: ${stats.fps}`;
    }
    if (this.particlesEl) {
      this.particlesEl.textContent = `PNEUMA: ${(stats.particles / 1000).toFixed(0)}K GPU CURL`;
    }
    this._updateAnomalyStatusBar();
  }

  showToast(message) {
    if (!this.toastEl) return;
    this.toastEl.textContent = message;
    this.toastEl.hidden = false;
    if (this._toastTimer) clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => {
      this.toastEl.hidden = true;
    }, 4200);
  }

  _applyInitialHash() {
    const raw = (window.location.hash || '').replace(/^#/, '').trim().toLowerCase();
    if (!raw) return;
    if (['overview', 'rail', 'lineage', 'matrix'].includes(raw)) {
      this.setViewMode(raw);
      return;
    }
    const match = this.projects.find((p) => p.id === raw);
    if (match) {
      this.inspectProject(match.id);
    }
  }
}

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  window.addEventListener('DOMContentLoaded', () => {
    new OrganumApp();
  });
}
