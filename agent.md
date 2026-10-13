# Agent Continuation Guide (`ussysite4` — The Helix Organum)

This document is the primary operational guide for any AI coding agent or developer continuing work on **`ussysite4`**. Read this file first before making edits.

---

## 1. Project Identity & Core Concept

- **Project Name**: `ussysite4` ("The Helix Organum")
- **Owner**: Kyle Durepos (`mojomast`)
- **Predecessor**: `ussysite3` (which used a solar-system / planet / space layout with `EasterEggFlight`).
- **World Metaphor**: **The Helix Organum** — a subterranean, cathedral-scale living pipe organ and kinetic glass conservatory. **Do not introduce planets, orbits, asteroids, or space starfields.**
- **Tech Stack**:
  - **Runtime**: Vanilla ES Modules in the browser + zero-dependency Node.js (`>= 20`) HTTP server (`server.mjs`). No bundler (Vite/Webpack) is required.
  - **3D Engine**: Vendored **Three.js `r186` (`0.186.1`)** under `js/vendor/three/`. Mapped via `<script type="importmap">` in `index.html` for browsers and `scripts/register-three.mjs` for Node.js tests.
  - **Audio**: Procedural WebAudio synthesizer (`js/audio.js`) generating windchest drones, 5-voice Stop chords, and UI/anomaly telemetry cues.

---

## 2. The 11 Featured Repositories (`Stops I–XI`)

The site features the exact 11 repositories requested from `github.com/mojomast`, defined in `js/projects.js` (and mirrored identically in `/projects.js`):

1. **Stop `I` — `orbitdesktop`** (`orrery-shell`): Spatial 3D desktop environment & window compositor.
2. **Stop `II` — `velvetrp`** (`velvet-loom`): AI-assisted collaborative roleplay & narrative state engine.
3. **Stop `III` — `jammate`** (`acoustic-resonator`): Real-time low-latency collaborative music jamming platform.
4. **Stop `IV` — `cocs`** (`claw-trinity`): Clawd-on-Clawd-on-Clawd-Service hierarchical multi-agent orchestrator (`https://arena.ussyco.de`).
5. **Stop `V` — `cocs-godot`** (`voxel-arena`): Godot 4 interactive 3D visualizer and simulation arena for CoCS agent swarms.
6. **Stop `VI` — `routetok`** (`prism-splitter`): High-speed semantic LLM token router, cost optimizer, and fallback proxy.
7. **Stop `VII` — `rgbagentflightindicator`** (`rgb-totem`): Hardware/software RGB status beacon & flight-deck telemetry indicator for AI agent swarms.
8. **Stop `VIII` — `mothbake`** (`photometric-kiln`): Automated GPU lightmap, ambient occlusion, and procedural texture baking pipeline.
9. **Stop `IX` — `warpi`** (`tactical-array`): Raspberry Pi portable wardriving, RF spectrum, and Wi-Fi/BLE reconnaissance deck.
10. **Stop `X` — `hermesdashboard`** (`caduceus-command`): Real-time fleet telemetry, message-bus observability, and service command dashboard.
11. **Stop `XI` — `becomussy`** (`identity-chrysalis`): Self-evolving agentic persona, long-term memory continuity, and identity synthesis framework.

---

## 3. Critical Codebase Invariants

1. **Dual Catalog Mirror (`/projects.js` === `/js/projects.js`)**:
   - Both `/projects.js` (imported by `server.mjs`) and `/js/projects.js` (imported by browser ESM modules) must remain **byte-for-byte identical**.
   - Whenever you edit `js/projects.js`, copy it to `projects.js` (`cp js/projects.js projects.js`) and run `npm run check:mirrors`.
2. **Zero Build Step**:
   - Browser files in `js/` are served directly as native ES modules. Do not introduce TypeScript or JSX into `js/` without explicit instruction.
3. **Hardened Static Server (`server.mjs`)**:
   - `server.mjs` blocks dotfiles (`.env`, `.git`), internal directories (`/test/`, `/scripts/`, `/deploy/`, `/docs/`), and sensitive metadata files (`package.json`, `server.mjs`, `agent.md`, `SNAPSHOT.md`) with `404 Not Found`.
   - Keep `test/server-security.test.mjs` passing whenever modifying routes in `server.mjs`.
4. **Shared Shader Uniform Contract**:
   - Every custom `ShaderMaterial` in `js/shaders/organum-shaders.js` shares the same reactive uniform object (`this.sharedUniforms`) managed by `AnomalySystem`:
     - `uTime`, `uDelta`, `uAnomalyFactor`, `uWorldPhase`, `uGlitchIntensity`, `uVolumetricPulse`, `uCryptReveal`, `uResonanceHz`, `uAudioEnergy`, `uFocusTarget`, `uFocusActive`, `uPointerWorld`, `uCameraPos`.
   - Mutating `anomalySystem.setUniform('uAnomalyFactor', 0.8)` or tweening via `anomalySystem.tween('uCryptReveal', 1.0, 2000)` updates all shaders and post-processing passes simultaneously in the same frame.

---

## 4. How to Build the Easter Egg (Next Agent Task)

`ussysite4` was intentionally built with a **first-class Easter-Egg Foundation** so the next agent can focus 100% on designing and implementing the easter-egg experience itself.

### What is ALREADY built and wired for you:

1. **`js/anomaly/anomaly-system.js` (`AnomalySystem`)**:
   - Tracks 7 secret triggers (`konami`, `ussy-chord`, `hermes-triad`, `helix-ascension`, `rune-trinity`, `cmd-awaken`, `resonance-432`).
   - Persists progress in `localStorage` (`ussy4.anomaly.v1`) and syncs to `POST /api/anomaly/state`.
   - Exposes `anomalySystem.registerEasterEgg(callback)` and `window.__USSY4_SDK__`.
2. **3 Hidden 3D Rune Anchors in the Nave (`RUNE_ANCHOR_SPECS`)**:
   - Placed at `(0, 4.4, 0)` (`rune:windchest`), `(0, -9.3, 0)` (`rune:crypt-gate`), and `(0, 21.5, 0)` (`rune:vault-keystone`).
   - `OrganumEngine` raycasts the user's cursor against these 3 runes every frame and calls `anomalySystem.feedRuneDwell(runeId, dt)`. Dwelling on a rune for 1.6 seconds charges and activates it!
3. **The Sub-Floor Crypt Reliquary (`this.cryptGroup` in `js/engine/organum-engine.js`)**:
   - Positioned at `y = -14.2` directly beneath the translucent glass center of the ferrofluid floor.
   - Driven by `uCryptReveal` (`0.0` → `1.0`). When `uCryptReveal` rises toward `1.0`, the subterranean violet/cyan point light blazes on and the crypt octahedron + rune rings spin up beneath the floor.
4. **The Organum Console (`~` key)**:
   - Supports `/awaken`, `/anomaly <0..1>`, `/glitch <0..1>`, `/crypt <0..1>`, `/unlock <id>`, `/tune <hz>`, `/sdk`, and `/reset`.

### Recommended workflow to add the Easter Egg:

1. Create a new module `js/anomaly/crypt-awakening.js` (or similar).
2. Import it in `js/app.js` and register it with:
   ```js
   anomalySystem.registerEasterEgg((ctx) => {
     // ctx = { triggerId, state, uniforms, system }
     // Launch your easter egg experience here!
   });
   ```
3. You can access the live `OrganumEngine` instance at `window.__USSY4_SDK__.engine` (or pass `engine` and `audio` directly in `js/app.js`) to:
   - Descend the camera through the central floor glass into the Sub-Floor Crypt (`y = -14.2`), OR
   - Turn the 11 Pipe-Organ Stops into a playable harmonic rhythm/synthesizer puzzle, OR
   - Spawn interactive anomaly entities along the triple-helix windrail.
4. Read [`docs/EASTER_EGG_GUIDE.md`](docs/EASTER_EGG_GUIDE.md) for full code examples and API hooks.

---

## 5. Verification Checklist Before Committing

> **Note on `js/vendor/` (`.gitignore`):**
> `js/vendor/` is listed in `.gitignore` so the >2 MB Three.js `r186` bundle files didn't block GitHub MCP API pushes. On a fresh clone, run `npm run setup:vendor` (which runs `scripts/setup-vendor.mjs` to install `three@0.186.1` and copy the ESM build + postprocessing addons into `js/vendor/three/`), or un-ignore `js/vendor/` when pushing over standard git CLI.

Always run these three commands and verify zero errors before committing:

```bash
npm run setup:vendor
npm run check:syntax
npm run check:mirrors
npm test
```
