# ussysite4 — The Helix Organum

> **A bleeding-edge (October 2026) Three.js (`r186`) interactive 3D software portfolio for [mojomast (Kyle Durepos)](https://github.com/mojomast).**
> Replaces the `ussysite3` solar-system/planet layout with a completely original subterranean architectural world: **The Helix Organum** — a buried, cathedral-scale living pipe organ and kinetic glass conservatory where 11 software repositories are physicalized as harmonic **Stops (`I`–`XI`)** along a triple-helix iridescent windrail over a reactive magnetic ferrofluid basin.

---

## Table of Contents

1. [Creative Direction: Why Not Space?](#1-creative-direction-why-not-space)
2. [Featured Repositories (The 11 Stops)](#2-featured-repositories-the-11-stops)
3. [Bleeding-Edge 3D & Shader Features](#3-bleeding-edge-3d--shader-features)
4. [Camera Choreography & Controls](#4-camera-choreography--controls)
5. [Easter-Egg Foundation (`AnomalySystem` & `__USSY4_SDK__`)](#5-easter-egg-foundation-anomalysystem--__ussy4_sdk__)
6. [Quickstart & Development Commands](#6-quickstart--development-commands)
7. [Repository Layout](#7-repository-layout)
8. [Documentation Index for Resuming Agents](#8-documentation-index-for-resuming-agents)

---

## 1. Creative Direction: Why Not Space?

Where `ussysite3` used a cosmic solar system with orbiting planets and starfields, `ussysite4` discards space tropes entirely in favor of tactile, kinetic architectural acoustics:

- **The Vault & Crepuscular Light Shafts**: Overhead, a salt-glass vault ceiling refracts animated Voronoi caustics while five volumetric crepuscular light shafts cut diagonally through the subterranean nave.
- **The Reactive Ferrofluid Nave Basin**: Beneath the stops (`y = -10.2`) lies a real-time SDF smooth-minimum (`smin`) ferrofluid pool that rises into Rosensweig magnetic peaks beneath each active Stop and ripples under the 3D cursor.
- **The Central Windchest Core & Sub-Floor Crypt Reliquary**: At the center of the nave, a transmissive glass lung, 3 thin-film iridescent gimbal rings, and a 16-pipe brass cathedral crown breathe continuously. Directly beneath the center glass tesserae (`y = -14.2`) sits a dormant **Sub-Floor Crypt Reliquary** ready to be awakened by a future easter egg.
- **60,000 GPU Curl-Noise Pneuma Particles**: Divergence-free 3D Simplex curl-noise particles flow from the central windchest along the triple-helix windrail, inhaling toward the currently focused Stop and swirling around the 3D cursor.

---

## 2. Featured Repositories (The 11 Stops)

All 11 repositories from [`github.com/mojomast`](https://github.com/mojomast) are represented as bespoke kinetic 3D sculptures with custom harmonic chords, architectural telemetry, and dependency lineage ribbons:

| Stop | ID | Title | Domain | Bespoke 3D Sculpture Archetype |
| :--- | :--- | :--- | :--- | :--- |
| **I** | `orbitdesktop` | **OrbitDesktop** | Spatial Desktop Shell | `orrery-shell` — Triple gimbal brass/iridescent rings + 5 floating glass viewport panes |
| **II** | `velvetrp` | **VelvetRP** | Narrative Roleplay Engine | `velvet-loom` — Crimson-violet theatrical proscenium arch + 5 braided narrative threads |
| **III** | `jammate` | **JamMate** | Collaborative Jam Studio | `acoustic-resonator` — 12-pipe circular acoustic organ array + 3 expanding harmonic wave rings |
| **IV** | `cocs` | **CoCS** | Clawd-on-Clawd-on-Clawd-Service | `claw-trinity` — 3 interlocking articulated mechanical claws around a pulsing orchestration orb ([cocs.ussyco.de](https://cocs.ussyco.de)) |
| **V** | `cocs-godot` | **CoCS-Godot** | Godot 4 3D Agent Visualizer | `voxel-arena` — Translucent wireframe Godot arena cube + 8 orbiting voxel agent entities |
| **VI** | `routetok` | **RouteTok** | LLM Token Router & Proxy | `prism-splitter` — Transmissive octahedral crystal prism splitting a white beam into 5 spectral rays |
| **VII** | `rgbagentflightindicator` | **RGBAgentFlightIndicator** | Hardware RGB Telemetry Beacon | `rgb-totem` — Vertical smoked-glass cylinder housing 24 individually addressable WS2812B LED rings |
| **VIII** | `mothbake` | **MothBake** | Lightmap & Photometric Baker | `photometric-kiln` — Geodesic copper filament cage + moths orbiting a warm amber-white baking core |
| **IX** | `warpi` | **WarPi** | Tactical Raspberry Pi Deck | `tactical-array` — Anodized PCB deck + spinning phased-array radar dish + waterfall spectrum bars |
| **X** | `hermesdashboard` | **HermesDashboard** | Caduceus Fleet Command | `caduceus-command` — Twin-helix caduceus staff + winged crown + 6 orbiting KPI holo-monoliths |
| **XI** | `becomussy` | **Becomussy** | Agent Identity & Continuity Core | `identity-chrysalis` — Morphing iridescent icosahedron inside a DNA double-helix of memory shards |

> **Important Mirror Invariant:** `/projects.js` and `/js/projects.js` are byte-identical mirrors. After editing either file, verify parity with `npm run check:mirrors`.

---

## 3. Bleeding-Edge 3D & Shader Features

- **Vendored Three.js `r186` (`0.186.1`)**: Zero external CDN dependencies required at runtime; works offline and in air-gapped environments.
- **3D Simplex Curl-Noise Pneuma Field (`js/shaders/organum-shaders.js`)**: 60,000 additive particles advected entirely on the GPU via central-difference curl of a 3D Simplex potential vector field (`snoiseVec3`), with magnetic attraction toward the active Stop (`uFocusTarget`) and 3D cursor (`uPointerWorld`).
- **Real-Time SDF Smooth-Minimum (`smin`) Ferrofluid Floor**: Custom vertex + fragment shader computing polynomial smooth-minimum over all 11 Stop pedestals, the central windchest, and the live cursor, complete with analytical finite-difference normals, metallic specular highlights, and thin-film oil-slick iridescence.
- **Thin-Film Optical Interference Shader**: Physically inspired optical path difference (`OPD = 2 * n * d * cos(theta)`) iridescence across the triple-helix windrail, central windchest gimbals, and Stop rings.
- **Post-Processing Pipeline (`EffectComposer`)**:
  1. `RenderPass` (HDR scene render)
  2. `UnrealBloomPass` (selective emissive bloom)
  3. `OrganumCinematicShader` (`ShaderPass` with 24-tap radial crepuscular God-Rays projected from the Vault Key Light's NDC coordinates, radial chromatic aberration scaled by `uGlitchIntensity`, vignette, and analog film grain)
  4. `OutputPass` (ACES Filmic tone mapping + sRGB conversion)
- **Procedural WebAudio Pipe-Organ Synthesizer (`js/audio.js`)**: Zero external audio files. Synthesizes a continuous sub-bass windchest drone (`55 Hz` / `82.41 Hz`), velocity-tracked wind noise, 5-voice harmonic Stop chords on selection, UI hover chimes, and `432 Hz` / `440 Hz` resonance switching.

---

## 4. Camera Choreography & Controls

- **`1` — Choir Overview**: Sweeping orbital perspective around the entire Helix Organum nave. Drag to orbit, scroll to zoom.
- **`2` — Windrail Dolly**: Smooth spline dolly along the triple-helix windrail from Stop I (`OrbitDesktop`) to Stop XI (`Becomussy`). Scroll or press `[` / `]` to glide along the rail.
- **`3` — Lineage Loom**: High-angle architectural view highlighting dependency ribbons and repositions Stops into their 4-ring concentric dependency graph.
- **`4` — Matrix Index**: Opens the full-screen searchable bento grid of all 11 repositories (`/` or `Cmd/Ctrl+K` also focuses search).
- **Click Any 3D Stop Sculpture or Dock Pill**: Flies the camera into **Stop Dive** mode, opens the glassmorphic **Stop Inspector Drawer** (Overview, Architecture & Specs, Dependency Lineage, and Live Organum Telemetry), and plays the Stop's 5-note pipe-organ chord.
- **`` ` `` / `~` — Organum Console**: Opens the developer & anomaly terminal overlay (`/help`, `/stops`, `/goto <id>`, `/mode <mode>`, `/tune <hz>`, `/pulse`, `/anomaly <0..1>`, `/glitch <0..1>`, `/crypt <0..1>`, `/unlock <id>`, `/sdk`, `/reset`).

---

## 5. Easter-Egg Foundation (`AnomalySystem` & `__USSY4_SDK__`)

Per the project specification, `ussysite4` does **not** hardcode a finished easter-egg minigame; instead, it ships a complete, tested **Easter-Egg Foundation (`js/anomaly/anomaly-system.js`)** so you or another agent can build any easter egg on top of it immediately:

- **Shared Reactive Shader Uniforms** (already wired into every shader and post-processing pass in the scene):
  - `uAnomalyFactor` (`0.0` → `1.0`): Shifts particle & ferrofluid palettes toward magenta/cyan anomaly phase, accelerates curl turbulence, and agitates the central windchest.
  - `uWorldPhase` (continuous radians): Drives iridescent phase shifts and caustic flow.
  - `uGlitchIntensity` (`0.0` → `1.0`): Amplifies radial chromatic aberration and holographic interference.
  - `uVolumetricPulse` (`0.0` → `1.0`): Boosts crepuscular God-Ray weight and vault light intensity.
  - `uCryptReveal` (`0.0` → `1.0`): Illuminates and spins the **Sub-Floor Crypt Reliquary** (`y = -14.2`) beneath the central glass floor tesserae.
- **7 Built-in Multi-Modal Trigger Detectors**:
  - `konami` (`↑ ↑ ↓ ↓ ← → ← → B A`)
  - `ussy-chord` (Type `u` `s` `s` `y`)
  - `hermes-triad` (Visit Stops `cocs` → `hermesdashboard` → `becomussy` in order)
  - `helix-ascension` (Visit Stops `orbitdesktop` → `velvetrp` → `jammate` → `cocs` in order)
  - `rune-trinity` (Dwell the 3D cursor on all 3 hidden Rune Anchors in the 3D nave: `rune:windchest`, `rune:crypt-gate`, `rune:vault-keystone`)
  - `cmd-awaken` (Run `/awaken` in the `~` Organum Console)
  - `resonance-432` (Tune the Organum synthesizer to `432 Hz` via `/tune 432` or the audio deck)
- **Global Browser SDK (`window.__USSY4_SDK__`)**:
  ```js
  // Try these in the browser DevTools console right now:
  __USSY4_SDK__.anomaly.tween('uAnomalyFactor', 1.0, 1500);
  __USSY4_SDK__.anomaly.tween('uCryptReveal', 1.0, 2000);
  __USSY4_SDK__.anomaly.unlock('ussy-chord');
  __USSY4_SDK__.anomaly.registerEasterEgg((ctx) => {
    console.log('Easter egg awakened!', ctx.triggerId);
  });
  ```
- See [`docs/EASTER_EGG_GUIDE.md`](docs/EASTER_EGG_GUIDE.md) for a complete tutorial on building your easter egg on top of this foundation.

---

## 6. Quickstart & Development Commands

```bash
# Start the local server (defaults to http://127.0.0.1:3000)
npm start

# Run syntax verification across all server and client ESM modules
npm run check:syntax

# Verify byte-for-byte parity between /projects.js and /js/projects.js
npm run check:mirrors

# Run the full Node.js automated test suite (catalog, anomaly system, server security, shaders & 3D math)
npm test
```

---

## 7. Repository Layout

```text
ussysite4/
├── index.html                        # App shell, HUD chrome, Stop Inspector, Matrix Index, Organum Console
├── index.css                         # Cathedral Obsidian + Bioluminescent Cyan/ Brass Gold design system
├── server.mjs                        # Hardened zero-dependency Node HTTP server + /api/* endpoints
├── projects.js                       # Root ESM catalog mirror of the 11 mojomast Stops
├── package.json                      # Scripts & metadata (Node >= 20, zero runtime npm dependencies)
├── agent.md                          # AI Agent Continuation Guide (read first when resuming!)
├── SNAPSHOT.md                       # Complete v4.0.0 project state snapshot
├── js/
│   ├── app.js                        # Main controller: HUD, Inspector, Matrix Index, Console, shortcuts
│   ├── projects.js                   # Client ESM catalog of the 11 mojomast Stops (must match /projects.js)
│   ├── audio.js                      # Procedural WebAudio pipe-organ & harmonic chord synthesizer
│   ├── anomaly/
│   │   └── anomaly-system.js         # Easter-egg foundation: EventBus, detectors, uniforms, __USSY4_SDK__
│   ├── engine/
│   │   └── organum-engine.js         # Three.js r186 scene, camera choreography, raycasting, Crypt Reliquary
│   ├── shaders/
│   │   └── organum-shaders.js        # Custom GLSL: 3D curl-noise Pneuma, SDF ferrofluid, iridescence, God-Rays
│   ├── stations/
│   │   └── station-builder.js        # 11 bespoke procedural 3D Stop sculptures + per-frame animations
│   └── vendor/
│       └── three/                    # Vendored Three.js r186 (0.186.1) core + postprocessing addons
├── docs/
│   ├── ARCHITECTURE.md               # Deep technical reference for shaders, 3D scene graph, and audio
│   ├── EASTER_EGG_GUIDE.md           # Step-by-step guide to building an easter egg on AnomalySystem
│   ├── HANDOFF.md                    # Executive summary for next engineering agent
│   └── BLUEPRINT.md                  # Original architectural & visual design specification
├── scripts/
│   ├── check-mirrors.mjs             # Verifies /projects.js === /js/projects.js
│   └── register-three.mjs            # Node.js module loader hook mapping 'three' to vendored r186
├── deploy/
│   ├── nginx-ussy.host.conf          # Production Nginx reverse-proxy config
│   └── ussysite4.service             # systemd unit file
└── test/
    ├── catalog.test.mjs              # Validates all 11 mojomast repositories & mirror parity
    ├── anomaly-system.test.mjs       # Validates detectors, rune raycast dwell, commands, and SDK hooks
    ├── server-security.test.mjs      # Validates HTTP security headers, dotfile blocking, and /api/*
    └── shaders-and-math.test.mjs     # Validates GLSL shader uniforms and 3D Helix/Lineage anchor math
```

---

## 8. Documentation Index for Resuming Agents

- **[`agent.md`](agent.md)** — Start here when picking up work with a coding agent.
- **[`SNAPSHOT.md`](SNAPSHOT.md)** — Current implementation status, test coverage, and runtime verification.
- **[`docs/EASTER_EGG_GUIDE.md`](docs/EASTER_EGG_GUIDE.md)** — How to build the easter egg using `AnomalySystem`, the Sub-Floor Crypt Reliquary (`#crypt-reliquary`), and `window.__USSY4_SDK__`.
- **[`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)** — Detailed breakdown of the 3D scene, shaders, post-processing, and audio engine.
