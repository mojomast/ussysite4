# USSYSITE4 — Technical Blueprint

**Working title:** *The Helix Organum*  
**Owner:** mojomast / Kyle Durepos  
**Date:** 13 October 2026  
**Status:** Design-locked for implementation. No planets, no orbits, no cosmos.

This document is the implementation contract for a later agent. It is written so that world, renderer, audio, and the easter-egg foundation can be built without a redesign.

---

## 0. What `ussysite3` actually is (do not copy)

Inspected locally:

| Item | Finding |
|---|---|
| Three.js | **r128**, global `THREE` via vendored `js/vendor/three.min.js` (CDN originally `three.js/r128/three.min.js`). Non-module. |
| Renderer | `WebGLRenderer`, `antialias: false`, ACES filmic, sRGB, FogExp2, adaptive DPR (desktop cap ~1.25–1.5, coarse pointer = 1). |
| Scene metaphor | Solar system / constellation / 6DOF starfighter. Projects are **planets**. |
| Node count | **23** repositories in `js/projects.js` (not 11). Categories: `core`, `infra`, `ai`, `creative`. |
| Shaders | `onBeforeCompile` patches on `MeshStandardMaterial`; CPU displacement; Fresnel atmosphere shells; analytic ring annulus. **No TSL, no WebGPU.** |
| Particles | CPU `BufferGeometry` + `PointsMaterial`, hundreds not hundreds of thousands. |
| Post | Legacy `EffectComposer` + `UnrealBloomPass` exists in unused `js/flight/state.js`. Active path **does not** run a post stack (explicit HANDOFF constraint). |
| Audio | Procedural Web Audio director, no binary media, 16-voice cap, buses `ui` / `effects` / `ambience`. |
| Easter egg | `EasterEggFlight` — key buffer `u-s-s-y` (1.5s timeout) launches a **full game**: 6DOF flight, biomes, combat, multiplayer. Coupled to the solar-system world. |
| Debug globals | `__USSY_APP__`, `__USSY_SFX__`, `__USSY_TTS_ENGINE__`, `__USSY_BUILD__`. Ad hoc, not a SDK. |
| Navigation | Locked orbit camera + command palette (`/`) + flight autopilot along live node positions. |

**Carry forward (patterns, not visuals):**

- Project catalog as data (`projects.js` equivalent).
- Adaptive quality scaler, reduced-motion freeze of decoration, hidden-tab suspend, context-loss restore, owned GPU disposal.
- Command palette and procedural audio ownership.
- Constructor injection, idempotent `destroy()`.

**Do not carry forward:** planets, orbits, starfields, FogExp2 cosmos, r128 globals, `onBeforeCompile` as the primary material path, the USSY-launches-a-videogame coupling.

---

## 1. Original 3D world — The Helix Organum

### 1.1 One-sentence pitch

You are inside a buried **living pipe organ the size of a cathedral**, whose pipes, bellows, glass lungs, and ferrofluid reservoirs *are* the software. Eleven repositories are eleven **Stops** — kinetic sculptures you ride a windrail to, dive into, and hear.

This is architecture, not astronomy. The volume is finite, wet, brass, glass, and botanical. There is a floor, a vault, a nave. No skybox of stars.

### 1.2 Spatial anatomy (one unified chamber)

```
                    CAUSTIC VAULT  (inverted aquarium / salt-glass ceiling)
                           |  caustic projector lights
                           v
        STOP  STOP  STOP  STOP  STOP  STOP  STOP  STOP  STOP  STOP  STOP
         \      \     |     |     |  HELIX WINDRAIL (CatmullRom)  |     /
          \______\____|_____|_____|______________________________|____/
                           |
                    WINDCHEST CORE   (operator heart / palette origin)
                           |
                    FERROFLUID NAVE FLOOR  (shallow basin + glass tesserae)
                           |
                    CRYPT / RELIQUARY  (reserved for future easter-egg payload)
```

**Vault.** A concave glass-and-water ceiling. Directional + rect-area lights from above are refracted onto the floor as **reactive caustics**. This replaces a starfield as the “wow” volume-filler. The vault is a large inverted `SphereGeometry` / custom lathe shell with `MeshPhysicalMaterial` (`transmission`, `thickness`, `ior`, `dispersion`) plus a TSL caustic projector.

**Nave floor.** Shallow ferrofluid basin over a tessellated glass mosaic. The fluid is an SDF / metaball displacement plane, not a planet ocean. Mouse / active-stop attraction pulls the fluid into peaks under the hovered sculpture.

**Helix windrail.** A triple-helix of brass-glass tubes (CatmullRomCurve3 × 3, 120° phase) that is both the **navigation spline** and the visible architecture. Particles (pneuma) flow *inside* the tubes.

**Windchest core.** Center of the nave. A slowly breathing glass lung + holographic scanline cylinder. This is the home camera pose and the command-palette spatial origin. It is **not** a sun.

**Crypt.** A physically present but locked volume *below* the floor, visible through the glass tesserae as a dim amber cavity. The AnomalySystem can later open it. Ship it empty, wired, documented.

### 1.3 The eleven Stops (kinetic sculptures)

`ussysite4` features the **11 requested `mojomast` repositories** as first-class kinetic 3D Stops along the triple-helix windrail:

| Stop | Project ID | Title | Archetype | Kinetic Identity | Palette | Chord (audio) |
|---|---|---|---|---|---|---|
| **I** | `orbitdesktop` | **OrbitDesktop** | `orrery-shell` | Triple gimbal brass/iridescent rings + 5 floating glass viewport panes | `#38e8ff` | Cmaj9 |
| **II** | `velvetrp` | **VelvetRP** | `velvet-loom` | Crimson-violet theatrical proscenium arch + 5 braided narrative threads | `#e05297` | Am9 |
| **III** | `jammate` | **JamMate** | `acoustic-resonator` | 12-pipe circular acoustic organ array + 3 expanding harmonic wave rings | `#f5b851` | G6/9 |
| **IV** | `cocs` | **CoCS** | `claw-trinity` | 3 interlocking articulated mechanical claws around a pulsing orchestration orb | `#ff5e36` | Dm9 |
| **V** | `cocs-godot` | **CoCS-Godot** | `voxel-arena` | Translucent wireframe Godot arena cube + 8 orbiting voxel agent entities | `#47b8ff` | Fmaj9 |
| **VI** | `routetok` | **RouteTok** | `prism-splitter` | Transmissive octahedral crystal prism splitting a white beam into 5 spectral rays | `#a864ff` | Em11 |
| **VII** | `rgbagentflightindicator` | **RGBAgentFlightIndicator** | `rgb-totem` | Vertical smoked-glass cylinder housing 24 individually addressable WS2812B LED rings | `#29f29c` | Bbmaj7#11 |
| **VIII** | `mothbake` | **MothBake** | `photometric-kiln` | Geodesic copper filament cage + moths orbiting a warm amber-white baking core | `#ffbd59` | D6/9 |
| **IX** | `warpi` | **WarPi** | `tactical-array` | Anodized PCB deck + spinning phased-array radar dish + waterfall spectrum bars | `#00f090` | Fm9 |
| **X** | `hermesdashboard` | **HermesDashboard** | `caduceus-command` | Twin-helix caduceus staff + winged crown + 6 orbiting KPI holo-monoliths | `#ffcc33` | Eb6/9 |
| **XI** | `becomussy` | **Becomussy** | `identity-chrysalis` | Morphing iridescent icosahedron inside a DNA double-helix of memory shards | `#f472ff` | Bmaj9 |

Each Stop is a `ProjectStation` object:

```ts
type ProjectStation = {
  id: string;                 // catalog id
  mesh: THREE.Group;          // authored sculpture root
  anchor: THREE.Vector3;      // world position on the helix
  lookTarget: THREE.Vector3;  // camera look-at when docked
  splineT: number;            // 0..1 on the primary windrail
  lod: THREE.LOD;             // near sculpture / mid impostor / far glyph
  hitTarget: THREE.Object3D;  // raycast volume (simple collider)
  uniforms: StationUniforms;  // per-stop material hooks
  chord: ChordSpec;           // audio
  connections: string[];      // catalog.connections → ribbon cables
};
```

**Relationship cables.** Catalog `connections` become **holographic data-stream ribbons** (TubeGeometry along quadratic curves, scanline shader). They are physical, not orbital lines.

### 1.4 Navigation model (four layers, one input owner)

Input is owned by `NavDirector`. Modes are exclusive. No ussysite3-style “flight game” as the default.

#### Mode A — Choir Overview (default land)

- Camera: high, slightly pitched, framing the whole helix.
- Scroll / trackpad: orbit *yaw around the nave axis only* (the building does not spin like a solar system; you walk the gallery).
- Click a Stop: enter **Dive**.
- Keys `1`–`0` and `-` jump to Stops 1–11.
- `Tab` cycles Stops.
- `/` or `Cmd/Ctrl+K` opens the command palette (spatial camera still eases to the match).

#### Mode B — Windrail Traverse (the signature move)

- A `CatmullRomCurve3` through all 11 anchors, with an extra loop through the Windchest.
- Scroll, `W/S`, or two-finger swipe moves `t` along the spline (`t` is damped, not 1:1).
- `A/D` banks to a parallel helix (three rails: inner / middle / outer).
- Camera is a railroad dolly with a look-ahead quaternion slerp; never a raw `lookAt` snap.
- Passing a Stop triggers a soft dock prompt; click or `Enter` dives.

Implementation: `THREE.CatmullRomCurve3.getPointAt(t)` + `getTangentAt(t)`; Frenet frame rebuilt each frame; roll limited to ±12°.

#### Mode C — Node dive (inspect)

- Cinematic 1.1s ease (`cubicBezier(0.22, 1, 0.36, 1)`) from current pose to the Stop’s `dockCamera`.
- Near the Stop, a HTML overlay (inspector) docks on the right; 3D does not fight the UI.
- `Esc` or click-empty returns to windrail at the Stop’s `splineT`.
- Double-click the GitHub/demo affordance; single-click selects.

#### Mode D — Bounded free-roam (optional, not a game)

- `F` toggles. Pointer-lock optional.
- WASD + mouse look inside an invisible nav-mesh (the nave floor + two galleries).
- Collision: simple capsule vs. authored collider meshes, not planet radial math.
- `Esc` returns to windrail.

#### Command palette + terminal

- Palette searches catalog (name, tags, specs) and **nav verbs**: `go nexussy`, `rail`, `overview`, `mute`, `quality high`.
- A thin **console** (`~`) sends strings into `AnomalySystem.handleCommand(line)` *and* the palette. The console is the documented hook for future easter-egg commands. v1 understands `help`, `go <id>`, `overview`, `anomaly status`. Unknown commands are forwarded to the anomaly bus as `terminal:command` and otherwise no-op with a dry ack.

#### Accessibility

- `prefers-reduced-motion`: freeze kinetic loops, cut particle count to 8k, disable bloom/godrays, camera eases become cuts.
- Keyboard-only path must reach every Stop and every inspector action.
- Contrast-safe HTML overlays; 3D is decorative to the information, not the only carrier.

---

## 2. Stack (October 2026, implementable)

Pin **`three@0.186.1`** (r186, published 24 Sep 2026). r187 is a milestone dated 21 Oct 2026 — do not float the major.

```json
{
  "dependencies": {
    "three": "0.186.1"
  },
  "devDependencies": {
    "vite": "^7.1.0",
    "typescript": "^5.9.0"
  }
}
```

**Renderer policy (must be explicit in code comments):**

| Path | When | Materials | Post |
|---|---|---|---|
| **Primary** | `WebGPURenderer` after `await renderer.init()` | TSL node materials (`MeshPhysicalNodeMaterial`, `SpriteNodeMaterial`, `Fn()`) | `THREE.RenderPipeline` (`PostProcessing` was renamed in r183) |
| **Fallback** | No WebGPU / failed init | GLSL `ShaderMaterial` + `MeshPhysicalMaterial` | `EffectComposer` + `UnrealBloomPass` + custom `ShaderPass`es |

`ShaderMaterial`, `onBeforeCompile`, and `EffectComposer` **do not work** on `WebGPURenderer`. That is why the fallback exists. Do not try to share one material class across both.

Import maps (Vite):

```js
import * as THREE from 'three/webgpu';          // primary
import { Fn, pass, uniform, instanceIndex, instancedArray, time, uv, vec3, float } from 'three/tsl';
import { bloom } from 'three/addons/tsl/display/BloomNode.js';
import { chromaticAberration } from 'three/addons/tsl/display/ChromaticAberrationNode.js';
import { film } from 'three/addons/tsl/display/FilmNode.js';
import { godrays } from 'three/addons/tsl/display/GodraysNode.js';
```

Fallback:

```js
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
```

Color pipeline: `ACESFilmicToneMapping`, `SRGBColorSpace`, exposure ~1.0–1.15. Reverse-Z if the WebGPU path exposes it; otherwise keep a tight camera near/far (`near=0.05`, `far=220`) because the world is a room, not a solar system.

---

## 3. Bleeding-edge effects (concrete recipes)

### 3.1 GPU curl-noise / vector-field pneuma (100k–200k)

**What they are:** not stars. Condensate, pollen, ferrofluid microdroplets, and organ-dust that breathe with the building.

**WebGPU (canonical):** follow `examples/webgpu_compute_particles.html` (official r186 example uses 200k).

```js
const COUNT = quality.particles; // 180_000 high / 90_000 med / 24_000 low / 8_000 reduced

const positions = instancedArray(COUNT, 'vec4'); // xyz + life
const velocities = instancedArray(COUNT, 'vec4'); // xyz + trailAge

const uTime = uniform(0);
const uCursor = uniform(new THREE.Vector3());      // raycast hit
const uCursorForce = uniform(0);                   // signed: +attract / -repel
const uActiveStop = uniform(new THREE.Vector3());  // current Stop world pos
const uAnomalyFactor = anomaly.uniforms.uAnomalyFactor;
const uWorldPhase = anomaly.uniforms.uWorldPhase;
const uGlitchIntensity = anomaly.uniforms.uGlitchIntensity;

const computeUpdate = Fn(() => {
  const p = positions.element(instanceIndex);
  const v = velocities.element(instanceIndex);
  const pos = p.xyz.toVar();
  const vel = v.xyz.toVar();

  // curl(simplex(p)) via central differences of a hash-noise field
  const curl = curlNoiseTSL(pos.mul(0.07).add(vec3(0, uTime.mul(0.04), 0)));
  vel.addAssign(curl.mul(0.012));

  // attract to active Stop, repel from cursor
  const toStop = uActiveStop.sub(pos);
  vel.addAssign(toStop.normalize().mul(0.004));
  const toCursor = pos.sub(uCursor);
  const d = toCursor.length().max(0.15);
  vel.addAssign(toCursor.normalize().mul(uCursorForce).div(d.mul(d)));

  // anomaly: increase turbulence + lift
  vel.addAssign(curl.mul(uAnomalyFactor.mul(0.04)));
  vel.y.addAssign(uWorldPhase.mul(0.002));

  vel.mulAssign(0.978); // damping
  pos.addAssign(vel);

  // recycle if outside nave AABB
  // ...
}).compute(COUNT);
```

Render with `SpriteNodeMaterial`:

- `positionNode = positions.toAttribute()`
- `colorNode` mixes Stop accent → pneuma ivory, multiplied by `1 + uGlitchIntensity * hash`
- `opacityNode = shapeCircle() * life`
- `AdditiveBlending`, `depthWrite: false`, `frustumCulled: false`

**Velocity trails:** a second `InstancedMesh` of 2-vertex line segments, or the official linked-particles pattern (`webgpu_tsl_vfx_linkedparticles.html`): store previous position in `.w` channel / a second buffer and draw a quad stretched along `curr - prev`. Cap trail instances at `COUNT * 0.35`.

**WebGL fallback:** one `InstancedBufferGeometry` of a 2-triangle billboard, GLSL vertex shader does a cheaper curl (4-tap), 40k instances max. CPU must **not** write 100k positions per frame.

**Repulsion / attraction input:** `Raycaster` against an invisible nave collider mesh (the floor + a low-poly vault). On miss, force = 0. On hover of a Stop, `uActiveStop` lerps to that anchor and `uCursorForce` goes negative (pneuma parts around the sculpture, then inhales).

### 3.2 Custom materials (per Stop + shared kit)

All of these must read the three anomaly uniforms. Inject once via `AnomalySystem.attachMaterial(mat)`.

#### A. Iridescent thin-film (brass-glass pipes, iris petals)

TSL (or GLSL fallback) approximating a 2-bounce thin-film:

```
float ndotv = saturate(dot(N, V));
float film = sin((iorThickness * ndotv + time * 0.15 + uWorldPhase) * 6.2831);
vec3 irid = 0.5 + 0.5 * cos(6.2831 * (vec3(0.0, 0.33, 0.67) + film));
color = mix(base, irid, fresnel * 0.65);
```

Use `MeshPhysicalNodeMaterial` with `iridescence`, `iridescenceIOR`, `iridescenceThicknessRange` where the r186 physical node material exposes them; otherwise the film term above on `colorNode`.

#### B. Subsurface / transmission glass (lungs, bells, well)

`MeshPhysicalMaterial` / `MeshPhysicalNodeMaterial`:

```
transmission: 1.0
thickness: 0.6..2.4     // mesh units; 0 = thin-wall
ior: 1.45               // glass; 1.33 for vault water
roughness: 0.04
dispersion: 0.3         // physical chromatic split through volume (r186)
attenuationColor + attenuationDistance for stained-glass Stops
envMap: PMREM of the nave (generate once from a CubeCamera every 8 frames, not every frame)
```

SSS approximation for the bellows / lungs: wrap lighting `max(0, dot(N,L)+wrap)/(1+wrap)` plus a cheap invert-normal backlight. Do **not** enable every physical flag on every mesh.

#### C. SDF raymarched / metaball ferrofluid cores

Two uses:

1. **Floor basin** — a plane whose fragment raymarches 8–12 metaballs whose centers are Stop projections + cursor. Gyroid or smooth-min union.

```glsl
float blob(vec3 p, vec3 c, float r) { return length(p - c) - r; }
float scene(vec3 p) {
  float d = 1e9;
  for (int i = 0; i < 11; i++) d = smin(d, blob(p, uStop[i], uRadius[i]), 0.4);
  d = smin(d, blob(p, uCursor, 0.35 * uCursorForceAbs), 0.35);
  // ferrofluid ripples
  d += 0.04 * sin(p.x * 14.0 + uTime) * sin(p.z * 14.0);
  d -= uAnomalyFactor * 0.12 * sin(length(p.xz) * 6.0 - uTime * 4.0);
  return d;
}
```

Cap ray steps: 24 high / 12 low. Shade with a dark oil color + anisotropic highlight.

2. **Per-Stop “heart”** — a 32³ SDF box around the sculpture core (one at a time, the *active* Stop only). Inactive Stops use a cheap icosahedron impostor.

#### D. Holographic scanline & data-stream ribbons

Ribbon fragment:

```
float scan = 0.55 + 0.45 * sin(vUv.y * 180.0 + uTime * 8.0);
float hashline = step(0.92, hash(vec2(vUv.y * 400.0, floor(uTime * 12.0))));
vec3 col = accent * scan;
col += vec3(1.0) * hashline * 0.35;
col = mix(col, vec3(1, 0, 0.4), uGlitchIntensity * hashline);
alpha = 0.22 + 0.2 * scan;
```

Vertex: scroll `uv.x += uTime * 0.15`; add a sine lateral displace scaled by `uAnomalyFactor`.

Hermes pulpit and the Windchest inner cylinder reuse this material.

#### E. Reactive caustic floor / vault

Do **not** path-trace. Use a **caustic projector**:

- A `DepthTexture` + `WebGLRenderTarget` (or TSL `pass`) of the vault from the key light’s view, blurred.
- Additive-blend onto the floor as a light cookie / `emissiveNode`.
- Second layer: screen-space fake caustics `sin(dot(xz, vec2(12,7))+t) * sin(dot(xz, vec2(7,12))-t)` masked by floor metalness.
- `uWorldPhase` shifts the two frequencies so an anomaly “retunes the vault.”

Godrays (see post) catch the dust in the nave and make the vault shafts read as organ light, not sunlight-in-space.

### 3.3 Post-processing pipeline

#### Primary (WebGPU `RenderPipeline`)

```js
const renderPipeline = new THREE.RenderPipeline(renderer);
const scenePass = pass(scene, camera);
const color = scenePass.getTextureNode('output');
const depth = scenePass.getTextureNode('depth');

const bloomPass = bloom(color);          // threshold 0.7, strength 0.55, radius 0.4
bloomPass.threshold.value = 0.7;

const rays = godrays(depth, camera, naveKeyLight);
// bilateralBlur(rays) then depthAwareBlend with beauty — see GodraysNode docs
// Godrays require renderer.shadowMap + casters/receivers + the light casting shadow.

const withBloom = color.add(bloomPass).add(rays.mul(uVolumetricPulse));

const ca = chromaticAberration(withBloom, /* strength */ uGlitchIntensity.mul(0.6).add(0.15));
const grain = film(ca /*, intensity 0.08 */);

// vignette as a Fn on screenUV, then:
renderPipeline.outputNode = vignetteFn(grain, uVignette + uAnomalyFactor.mul(0.2));
```

`uVolumetricPulse` is a 0.15–1.0 sine driven by camera speed and by `uWorldPhase`.

**Quality scaler** (port the ussysite3 2s window / 2-down 4-up streak idea):

| Tier | DPR cap | Particles | Bloom | Godrays steps | Transmission | Caustic RT |
|---|---|---|---|---|---|---|
| high | 1.5 | 180k | on | 60 | on | 512 |
| med | 1.25 | 90k | on | 32 | on | 256 |
| low | 1 | 24k | off | 0 | thin-wall only | off |
| reduced-motion | 1 | 8k | off | 0 | off | off |

Measure `renderer.info.render.frame` timings via `performance.now()` around `renderPipeline.render()`, never by FPS HUD guesses.

#### Fallback (WebGL `EffectComposer`) — the stack the brief asked for

```
RenderPass
UnrealBloomPass          (0.55, 0.4, 0.7)
ShaderPass ChromaticAberration
ShaderPass Vignette
ShaderPass FilmGrain
ShaderPass GodRays       (crepuscular: radial blur from projected key-light NDC)
OutputPass
```

Expose the same uniform names (`uAnomalyFactor`, `uWorldPhase`, `uGlitchIntensity`) on every custom `ShaderPass` so the AnomalySystem does not care which path is live.

God-ray fallback: classic Nvidia GPU Gems radial-blur from the projected light position. Cheap, convincing in a dark nave.

### 3.4 Procedural WebAudio synthesizer

Reuse ussysite3’s ownership rules (one `AudioContext`, unlock on gesture, suspend on hide, no binary media, voice cap) but replace the one-shot bleep director with a **harmonic instrument**.

```
AudioContext
  masterGain → compressor/limiter → destination
    buses: drone, chord, motional, ui, anomaly
```

**Drone.** Two detuned saws + one sine, through a resonant LP, mixed very low. Cutoff tracks camera speed (`smoothed |velocity|` → 180–1800 Hz). This is the organ’s wind.

**Per-Stop chord.** When a Stop is focused, a 4-voice hold of that Stop’s chord (table in §1.3) fades in over 400 ms via `setTargetAtTime`. Previous chord fades out. Voicing: root + 5th in left/right, 3rd and 9th quieter, slight chorus.

**Hover tick.** A short filtered impulse at the chord’s 5th. Cooldown 40 ms, max 2 overlapping (keep the ussysite3 steal/cooldown discipline).

**Camera velocity.** Map speed to:
- drone cutoff
- a pink-noise “air” layer gain
- `uVolumetricPulse` (visual coupling)

**Anomaly bus.** `uGlitchIntensity` opens a bitcrusher / ring-mod on the drone. `uWorldPhase` slews the global tonic (C → C♯ → D …) so a future payload can retune the building.

**Worklets.** Optional later. v1 stays in main-thread oscillators + `BiquadFilterNode` so it runs without a bundler special-case. Leave `audio/worklets/` as an empty folder with a README.

API the rest of the app uses:

```ts
audio.setFocusedStop(id | null)
audio.setCameraSpeed(mps)
audio.pulse(kind: 'hover' | 'dock' | 'select' | 'deny' | 'anomaly')
audio.setAnomaly({ factor, phase, glitch })  // called by AnomalySystem, not by stations
```

---

## 4. EasterEggFoundation / AnomalySystem

The user asked for a **foundation**, not a payload. Site 3’s egg *is* a game and is welded to planets. Site 4’s egg is a **first-class subsystem with no content**, already plumbed into scene, particles, post, and audio.

### 4.1 Module shape

```
src/anomaly/
  AnomalySystem.ts       // facade, window SDK, persist
  EventBus.ts            // typed pub/sub
  SequenceDetector.ts    // key-chords, node sequences, resonance, runes
  WorldUniforms.ts       // the three uniforms + helpers
  Triggers.ts            // registers default detectors (empty payloads)
  persist.ts             // localStorage + optional server hook
  types.ts
  README.md              // this section, plus “how a future agent adds a payload”
```

`AnomalySystem` is constructed once in `main.ts` and injected into renderer, particles, post, audio, nav, and the command console. It is never imported from a station file.

### 4.2 Event bus

```ts
type AnomalyEvents = {
  'input:key': { key: string; code: string; at: number };
  'input:chord': { id: string; keys: string[] };
  'nav:stop-activate': { id: string; at: number };
  'nav:stop-sequence': { ids: string[] };
  'terminal:command': { line: string };
  'rune:raycast': { runeId: string; uv: { x: number; y: number } };
  'resonance:tune': { hz: number; error: number };
  'world:phase': { phase: number };
  'anomaly:progress': { detectorId: string; progress: 0 | 1 | number };
  'anomaly:unlock': { id: string; payload?: unknown };
  'anomaly:factor': { value: number };
  'persist:changed': { state: AnomalyState };
};
```

`bus.on / bus.off / bus.emit / bus.once`. Listeners are stored in a `Map<string, Set<fn>>`. `destroy()` clears them.

### 4.3 Sequence detector

One class, many named detectors. Each detector is data:

```ts
type Detector = {
  id: string;
  type: 'keys' | 'stops' | 'command' | 'rune' | 'resonance' | 'hybrid';
  sequence: string[];      // keys, stop ids, or command tokens
  windowMs: number;        // default 1500, like ussysite3
  progress: number;
  armed: boolean;          // default true for foundation detectors that only log
  onComplete?: string;     // event name to emit, default 'anomaly:unlock'
};
```

**Ship these armed detectors (they only `console.debug` + bump a persistent counter — no world mutation):**

| id | Type | Sequence | Purpose |
|---|---|---|---|
| `konami` | keys | `ArrowUp ArrowUp ArrowDown ArrowDown ArrowLeft ArrowRight ArrowLeft ArrowRight b a` | Classic; proves the buffer works |
| `ussy-chord` | keys | `u s s y` | Familiar to returning visitors; **does not** launch a game |
| `helix-circuit` | stops | the 11 ids in nave order | “walked the choir” |
| `core-triad` | stops | `nexussy devussy swarmussy` | planner lineage |
| `rune:windchest` | rune | raycast the core glyph for 1.2s | 3D secret |
| `cmd:tune` | command | `tune 432` / `tune 440` | resonance hook |
| `resonance:a440` | resonance | hold hover + audio beat alignment | frequency tuner |

A future agent adds a detector with `onComplete: 'payload:crypt-open'` and a listener that tweens `uAnomalyFactor` → 1. **Zero changes** to renderer/particles/post/audio if they already sample the uniforms.

Key buffer: ignore when `event.target` is input/textarea/contentEditable (copy ussysite3 `isTypingTarget`). Reset on timeout. Store `code` not just `key` so Konami is layout-stable.

**3D runes:** four empty `RuneAnchor` meshes (windchest, under-floor crypt glass, vault keystone, behind the Permission Gate). Each has `userData.runeId`. Raycast on pointer-down; if dwell > 1.2s emit `rune:raycast`. The meshes are almost invisible (`opacity: 0.04`) until `uAnomalyFactor > 0.2`, at which the shared iridescent material reveals them. Document their world positions in `Triggers.ts`.

**Resonance tuner:** a future payload can expose a UI dial. Foundation already emits `resonance:tune` whenever the drone’s tonic is programmatically set, and `AnomalySystem.setResonance(hz)` exists.

### 4.4 Shader uniform injection (the actual “zero refactor” contract)

`WorldUniforms.ts` creates **one** shared object:

```ts
export type WorldUniforms = {
  uAnomalyFactor: { value: number };     // 0..1  “how much the building is waking”
  uWorldPhase: { value: number };        // unbounded radians, slowly incrementing; payloads may slew
  uGlitchIntensity: { value: number };   // 0..1  chromatic / scanline / audio crush
  uVolumetricPulse: { value: number };   // 0..1  godray weight
};
```

On WebGPU these are TSL `uniform(0)`. On WebGL they are `{ value: 0 }` objects. `WorldUniforms.asTSL()` / `.asGL()` return the right shape. **Never duplicate the numbers.**

`AnomalySystem.attachMaterial(material)` :

- Node materials: `material.userData.anomaly = uniforms` and the station’s `Fn` closes over the TSL uniforms.
- GLSL: merge into `material.uniforms`.
- Post: merge into every custom pass.
- Particles compute: already closed over them in §3.1.
- Audio: `audio.setAnomaly` is called from `AnomalySystem.tick`, not from materials.

Presets a future agent can call without touching shaders:

```ts
anomaly.tween({
  uAnomalyFactor: 1,
  uGlitchIntensity: 0.8,
  uWorldPhase: Math.PI * 2,
  duration: 2.5,
  ease: 'expoOut',
});
```

`tick(dt)` always does `uWorldPhase += dt * 0.05 * (1 + 2 * uAnomalyFactor)` so idle scenes already have a living phase, and payloads only *amplify*.

### 4.5 Persistent state

```ts
type AnomalyState = {
  v: 1;
  unlocked: string[];          // detector ids that have fired
  counters: Record<string, number>;
  flags: Record<string, boolean>;
  lastVisit: number;
  resonanceHz: number;         // default 440
};
```

- Key: `ussysite4.anomaly.v1`
- `load()` on boot, `save()` debounced 250 ms on `persist:changed`
- `AnomalySystem.serverEndpoint = null` by default. If set to a URL, `save()` also `POST`s JSON with `{ clientId, state }`. Failures are swallowed and logged. This is the hook, not a backend.

Do not store camera pose here (that can live in `ussysite4.nav.v1` separately).

### 4.6 Debug SDK — `window.__USSY4_SDK__`

Stable, documented, frozen shape:

```ts
window.__USSY4_SDK__ = {
  version: '4.0.0-foundation',
  threeRevision: THREE.REVISION,
  backend: 'webgpu' | 'webgl',
  nav: { mode, go(id), setMode, getSplineT },
  audio: { setFocusedStop, setCameraSpeed, pulse, getTonic },
  anomaly: {
    bus,
    getUniforms(),          // live numbers
    set(partial),           // immediately write uniforms
    tween(partial),
    unlock(id),             // mark detector complete
    reset(),                // clear persist + uniforms
    listDetectors(),
    fire(detectorId),       // debug skip
  },
  quality: { get(), set(tier) },
  scene, camera, renderer,
};
```

`Object.freeze` the top object; do not freeze nested live refs. Log once: `[ussysite4] SDK at window.__USSY4_SDK__`.

---

## 5. Architecture (clean modules)

```
ussysite4/
  index.html
  package.json
  vite.config.ts
  src/
    main.ts                 // bootstrap, renderer pick, destroy
    app/
      App.ts                // HTML shell, palette, inspector, filters
      CommandPalette.ts
      Inspector.ts
      Console.ts            // ~ terminal → anomaly.handleCommand
    catalog/
      projects.ts           // port of ussysite3/js/projects.js (all 23)
      stations.ts           // the 11 Stop authored configs
    engine/
      renderer.ts           // WebGPU | WebGL factory, DPR, resize, context loss
      scene.ts              // nave groups: vault, floor, helix, core, stations, pneuma
      quality.ts            // adaptive scaler
      clock.ts              // r183+ Timer, not deprecated Clock
    world/
      Organum.ts            // vault + floor + helix assembly
      HelixRail.ts          // CatmullRom × 3, ribbon cables
      Windchest.ts
      caustics.ts
      ferrofluidFloor.ts    // SDF plane
    stations/
      ProjectStation.ts     // the type + LOD + hit target
      sculptures/           // one file per Stop, returns a Group
      registry.ts
    nav/
      NavDirector.ts
      spline.ts
      dive.ts
      freeRoam.ts
      overview.ts
    particles/
      PneumaField.ts        // compute + trails
      curl.ts               // TSL + GLSL
    materials/
      iridescence.ts
      transmissionGlass.ts
      hologramRibbon.ts
      anomalyInjection.ts   // attachMaterial
    post/
      pipeline.webgpu.ts    // RenderPipeline
      pipeline.webgl.ts     // EffectComposer stack
      passes/               // GLSL chromatic / vignette / grain / godrays
    audio/
      SynthDirector.ts
      chords.ts             // Stop → chord table
      worklets/README.md
    anomaly/                // §4
    ui/                     // CSS modules / vanilla
  public/
  docs/
    BLUEPRINT.md            // this file
    HANDOFF.md              // short agent-to-agent
```

Invariants:

- **No global `THREE`.** Everything is ESM.
- **One animation loop:** `renderer.setAnimationLoop`. Inside: `anomaly.tick` → `particles.compute` → `nav.tick` → `audio.tick` → `post.render`.
- **Idempotent `App.destroy()`** disposes geometries, materials, PMREM, composers, compute buffers, audio context.
- **Stations never import post or audio** — they emit `nav:stop-activate` and the directors react.
- **Catalog is source of truth.** Sculptures look up by id; they do not duplicate descriptions.

---

## 6. Implementation sequence for the next agent

1. Vite + `three@0.186.1` + empty nave (vault shell, floor plane, one light, ACES). Prove WebGPU init + WebGL fallback.
2. `AnomalySystem` + `__USSY4_SDK__` + the three uniforms attached to a debug cube material. Prove `anomaly.set({ uGlitchIntensity: 1 })` from the console.
3. Helix spline + 11 placeholder LOD icosahedra from `stations.ts` + NavDirector modes A–C + palette.
4. Pneuma compute particles + cursor force.
5. Replace placeholders one Stop at a time (start with `ussycode` lungs and `hermes-dashboard` pulpit — they exercise transmission + hologram).
6. Physical glass, iridescence on the rails, ferrofluid floor, caustic projector.
7. `RenderPipeline` bloom + chromatic + vignette + grain + godrays; copy the uniform names into the EffectComposer fallback.
8. SynthDirector drones + chords.
9. Ribbons from `connections`.
10. Stop. Do **not** build an easter-egg payload. Write `docs/HANDOFF.md` listing detector ids and uniform ranges.

Target: locked 60 fps at 1080p on a 2022-class integrated GPU at **medium**; 60+ at high on discrete. If godrays blow the budget, they are the first kill switch (`quality.ts`).

---

## 7. Explicit non-goals (v1)

- No planets, orbits, starfields, nebulae, spaceships, 6DOF flight, surface biomes, multiplayer, combat.
- No GLTF zoo. Sculptures are procedural Three.js primitives + shaders (fast to iterate, no binary media, matches site 3’s constraint).
- No unidentified “WebGPU-only” features without a WebGL stand-in.
- No floating `three@latest`. Pin 0.186.1.
- No easter-egg *content*. The crypt is dark on purpose.

---

## 8. Copy-paste: GLSL curl (WebGL fallback)

```glsl
// curl of a cheap 3D value noise; 4 taps, good enough at 40k instances
vec3 mod289(vec3 x){ return x - floor(x * (1.0/289.0)) * 289.0; }
vec4 mod289(vec4 x){ return x - floor(x * (1.0/289.0)) * 289.0; }
vec4 permute(vec4 x){ return mod289(((x*34.0)+1.0)*x); }
vec4 taylorInvSqrt(vec4 r){ return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v){
  const vec2 C = vec2(1.0/6.0, 1.0/3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod289(i);
  vec4 p = permute(permute(permute(
    i.z + vec4(0.0, i1.z, i2.z, 1.0))
    + i.y + vec4(0.0, i1.y, i2.y, 1.0))
    + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}

vec3 snoiseVec3(vec3 x){
  return vec3(snoise(x), snoise(x + vec3(31.2, 17.7, 9.4)), snoise(x + vec3(7.1, 27.9, 14.2)));
}

vec3 curlNoise(vec3 p){
  const float e = 0.1;
  vec3 dx = vec3(e, 0.0, 0.0);
  vec3 dy = vec3(0.0, e, 0.0);
  vec3 dz = vec3(0.0, 0.0, e);
  vec3 x0 = snoiseVec3(p - dx), x1 = snoiseVec3(p + dx);
  vec3 y0 = snoiseVec3(p - dy), y1 = snoiseVec3(p + dy);
  vec3 z0 = snoiseVec3(p - dz), z1 = snoiseVec3(p + dz);
  float x = y1.z - y0.z - z1.y + z0.y;
  float y = z1.x - z0.x - x1.z + x0.z;
  float z = x1.y - x0.y - y1.x + y0.x;
  return normalize(vec3(x, y, z));
}
```

Port this to TSL as `curlNoiseTSL(p)` using `hash` / a simplex `Fn` — same central-difference structure so both backends match visually.

---

## 9. Visual north star (for look-dev, not for copying IP)

Think **pipe organ × greenhouse × glass foundry**, lit like a Baroque nave after rain:

- Dark oil floor, brass wet with condensation, glass that actually transmits.
- Motion is breathing, indexing, conducting — not orbiting.
- Color is stained-glass accents on a graphite/brass field, not cyan-on-black space HUD (site 3 already owns that).
- When a Stop focuses, the building inhales toward it (particles, ferrofluid, chord, godrays). That inhale *is* the interaction model.

If a screenshot could be mistaken for a solar system, it is wrong.
