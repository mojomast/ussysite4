# Project Snapshot — `ussysite4` (v4.0.0)

**Date:** October 13, 2026  
**Codename:** *The Helix Organum*  
**Author / Target Portfolio:** Kyle Durepos ([`github.com/mojomast`](https://github.com/mojomast))

---

## 1. Executive Summary

`ussysite4` is a ground-up reimagining of `ussysite3`. It preserves the core mission—an unforgettable interactive 3D software engineering portfolio with procedural audio, glassmorphic inspection drawers, dependency lineage visualization, and an extensible easter-egg architecture—while replacing the `ussysite3` planetary/space metaphor with **The Helix Organum**: a subterranean kinetic pipe-organ conservatory powered by **Three.js `r186` (`0.186.1`)**.

---

## 2. Implemented Capabilities

### 2.1 3D Scene & Custom GLSL Shaders (`js/engine/organum-engine.js`, `js/shaders/organum-shaders.js`)
- **60,000 GPU Curl-Noise Pneuma Flow-Field Particles**: Vertex-shader advection using central-difference 3D Simplex curl noise (`curlNoise(vec3)`), harmonic helix flow, magnetic Stop attraction (`uFocusTarget`), and cursor wake repulsion/swirl (`uPointerWorld`).
- **Real-Time SDF Smooth-Minimum (`smin`) Ferrofluid Basin (`y = -10.2`)**: Custom vertex + fragment shader computing polynomial smooth-minimum across all 11 Stop pedestals, the central windchest, and the 3D cursor, with Rosensweig magnetic ripple ridges, finite-difference normals, and thin-film iridescence.
- **Central Breathing Windchest Core**: Physical transmission glass lung (`MeshPhysicalMaterial` with `transmission`, `ior`, `thickness`), 3 counter-rotating thin-film interference gimbal rings, and a 16-pipe brass cathedral crown.
- **Sub-Floor Crypt Reliquary (`y = -14.2`)**: Pre-built subterranean chamber beneath the translucent center of the ferrofluid floor, wired to `uCryptReveal` and `uAnomalyFactor` for future easter-egg expansion.
- **Overhead Salt-Glass Caustic Vault & 5 Volumetric Light Shafts**: Animated Voronoi caustics (`y = 23.5`) and Fresnel-attenuated crepuscular light cones.
- **Triple-Helix Iridescent Windrail & 16 Lineage Ribbons**: Three intertwined `CatmullRomCurve3` tubes plus animated dual-direction packet ribbons connecting dependent Stops.
- **Post-Processing Stack (`EffectComposer`)**: `RenderPass` → `UnrealBloomPass` → custom `OrganumCinematicShader` (24-sample radial crepuscular God-Rays from projected Vault Key Light NDC, chromatic aberration, vignette, film grain) → `OutputPass` (ACES Filmic + sRGB).

### 2.2 11 Bespoke Stop Sculptures (`js/stations/station-builder.js`)
Each of the 11 requested `mojomast` repositories has a unique procedural 3D sculpture and per-frame kinetic animation:
1. `orbitdesktop` (`orrery-shell`)
2. `velvetrp` (`velvet-loom`)
3. `jammate` (`acoustic-resonator`)
4. `cocs` (`claw-trinity`)
5. `cocs-godot` (`voxel-arena`)
6. `routetok` (`prism-splitter`)
7. `rgbagentflightindicator` (`rgb-totem`)
8. `mothbake` (`photometric-kiln`)
9. `warpi` (`tactical-array`)
10. `hermesdashboard` (`caduceus-command`)
11. `becomussy` (`identity-chrysalis`)

### 2.3 Camera Modes & HUD (`js/app.js`, `index.html`, `index.css`)
- **4 Camera / View Modes**:
  - `Choir Overview` (`1`) — Orbital view of the entire nave
  - `Windrail Dolly` (`2`) — Spline traversal along the helix (`[` / `]` or scroll)
  - `Lineage Loom` (`3`) — Concentric dependency graph layout with highlighted data ribbons
  - `Matrix Index` (`4`) — Searchable bento-grid overlay of all 11 repositories
- **Stop Inspector Drawer**: 4 tabs (*Overview*, *Architecture & Specs*, *Dependency Lineage*, *Organum Telemetry*) with live streaming metrics, GitHub links, live deployment links (`https://arena.ussyco.de`), and clickable upstream/downstream Stop jumps.
- **Organum Console (`~`)**: Interactive command terminal wired to `AnomalySystem` and camera/audio controls.

### 2.4 Procedural WebAudio Synthesizer (`js/audio.js`)
- Synthesizes continuous sub-bass organ drone (`55 Hz` / `82.41 Hz`), bandpass windchest air hiss modulated by pointer/camera speed, 5-voice pipe-organ Stop chords on selection, hover chimes, and `432 Hz` / `440 Hz` tuning.

### 2.5 Easter-Egg Foundation (`js/anomaly/anomaly-system.js`)
- `AnomalySystem` with `EventBus`, 7 multi-modal detectors (`konami`, `ussy-chord`, `hermes-triad`, `helix-ascension`, `rune-trinity`, `cmd-awaken`, `resonance-432`), 3 raycastable 3D Rune Anchors, `localStorage` + `/api/anomaly/state` persistence, and `window.__USSY4_SDK__`.

---

## 3. Automated Test & Verification Status

- `npm run check:syntax`: **PASS**
- `npm run check:mirrors`: **PASS** (`/projects.js` and `/js/projects.js` byte-identical)
- `npm test`: **12 / 12 tests PASS** (`test/catalog.test.mjs`, `test/anomaly-system.test.mjs`, `test/server-security.test.mjs`, `test/shaders-and-math.test.mjs`)
