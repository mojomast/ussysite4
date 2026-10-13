# Architecture Reference — `ussysite4` (The Helix Organum)

This document details the internal architecture of `ussysite4`, including its module boundaries, 3D scene graph, custom GLSL shaders, post-processing pipeline, procedural WebAudio engine, and HTTP server.

---

## 1. Module Dependency Graph

```text
index.html
  └── js/app.js (Main Application & HUD Controller)
        ├── js/projects.js (11 Stop definitions, chords, lineage graph, helpers)
        ├── js/anomaly/anomaly-system.js (AnomalySystem, EventBus, Detectors, __USSY4_SDK__)
        ├── js/audio.js (OrganumAudioDirector — WebAudio pipe-organ synthesizer)
        └── js/engine/organum-engine.js (OrganumEngine — Three.js r186 WebGLRenderer + EffectComposer)
              ├── js/shaders/organum-shaders.js (Custom GLSL shaders & OrganumCinematicShader)
              ├── js/stations/station-builder.js (11 bespoke procedural 3D Stop sculptures)
              └── js/vendor/three/... (Vendored Three.js r186 core, postprocessing, RoomEnvironment)
```

---

## 2. 3D Scene Graph & Coordinate System

All 3D coordinates are in world units centered on the **Central Windchest Core** at `(0, 0, 0)`:

- **Salt-Glass Caustic Vault (`y = +23.5`)**:
  - Inverted spherical dome (`SphereGeometry`) rendered with `VAULT_CAUSTICS_FRAGMENT_SHADER`, projecting animated Voronoi interference caustics overhead.
  - **Vault Key Light (`0, 22, 0`)**: Projected into Normalized Device Coordinates (NDC) every frame (`uLightScreenPos`) to drive the radial crepuscular God-Ray shader pass.
- **5 Volumetric Crepuscular Light Shafts (`y = +9.5`)**:
  - Open-ended `ConeGeometry` meshes angled through the nave, shaded with `LIGHT_SHAFT_FRAGMENT_SHADER` using Fresnel edge attenuation and vertical noise striations.
- **Central Windchest Core (`0, 0, 0`)**:
  - Inner transmissive glass lung (`IcosahedronGeometry` + `MeshPhysicalMaterial` with `transmission: 0.92`, `ior: 1.48`, `thickness: 2.2`).
  - 3 counter-rotating gimbal rings shaded with `IRIDESCENCE_FRAGMENT_SHADER`.
  - 16 brass cathedral organ pipes arranged in a circular crown.
- **Triple-Helix Iridescent Windrail (`y = -5.5` to `y = +8.5`)**:
  - Three phase-offset `CatmullRomCurve3` splines winding around the nave at radius `~13.5`–`15.2`, connecting Stop `I` (`orbitdesktop`) at the lower nave to Stop `XI` (`becomussy`) near the upper choir.
- **11 Stop Sculptures (`this.stationEntries`)**:
  - Each Stop is built by `createStationSculpture(project, sharedUniforms)` in `js/stations/station-builder.js`.
  - Each Stop smoothly interpolates (`lerp`) between its **Helix Coordinate** (`project.helixPosition`, used in Choir Overview and Windrail Dolly modes) and its **Lineage Coordinate** (`project.lineagePosition`, used in Lineage Loom mode).
- **16 Dependency Lineage Ribbons (`this.lineageMeshes`)**:
  - Arched `TubeGeometry` curves connecting upstream and downstream repositories (`LINEAGE_CONNECTIONS` in `js/projects.js`), shaded with `RIBBON_FRAGMENT_SHADER` for dual-direction harmonic packet pulses.
- **60,000 GPU Curl-Noise Pneuma Particles (`this.pneumaPoints`)**:
  - `BufferGeometry` with attributes `position`, `aSeed`, `aStopIndex`, and `aScale`.
  - Advected in `PNEUMA_VERTEX_SHADER` via 3D Simplex curl noise (`curlNoise(vec3)`), focused Stop attraction (`uFocusTarget`), and cursor wake turbulence (`uPointerWorld`).
- **Reactive SDF Smooth-Min (`smin`) Ferrofluid Basin (`y = -10.2`)**:
  - `160 × 160` subdivided `PlaneGeometry(68, 68, 160, 160)` displaced in `FERROFLUID_VERTEX_SHADER` using polynomial smooth-minimum (`smin`) over all 11 Stop XY coordinates (`uStopPositions[11]`), the central core, and `uPointerWorld`.
  - The center radius (`r < 5.5`) has translucent alpha so the camera can peer through the glass floor tesserae into the **Sub-Floor Crypt Reliquary** below.
- **Sub-Floor Crypt Reliquary (`y = -14.2`)**:
  - Contains the dormant `OctahedronGeometry` reliquary core, counter-rotating rune rings, and a dedicated violet/cyan point light controlled by `uCryptReveal`.

---

## 3. Post-Processing Pipeline (`EffectComposer`)

1. **`RenderPass`**: Renders the full 3D scene with MSAA / half-float render target support.
2. **`UnrealBloomPass`**: Extracts high-luminance emissive regions (threshold `0.72`, strength `0.62`, radius `0.55`) and dynamically boosts bloom strength as `uAnomalyFactor` or `uVolumetricPulse` increases.
3. **`ShaderPass(OrganumCinematicShader)`**:
   - **24-Sample Radial Crepuscular God-Rays**: Marches in screen space from `vUv` toward `uLightScreenPos` (the projected NDC coordinate of the overhead Vault Key Light).
   - **Radial Chromatic Aberration**: Offsets R/G/B channels radially from screen center, scaling with `uGlitchIntensity` and `uAnomalyFactor`.
   - **Cathedral Vignette & Film Grain**: Subtle peripheral darkening and high-frequency luma grain.
4. **`OutputPass`**: Applies ACES Filmic tone mapping and linear-to-sRGB output encoding.

---

## 4. Adaptive Quality Scaler

`OrganumEngine` monitors a rolling 45-frame delta buffer (`this.fpsHistory`). If sustained frame time exceeds `26 ms` (`< 38 FPS`) while in `auto` quality mode, it automatically steps pixel ratio down cleanly to preserve smooth 60 FPS interaction. Users can also manually toggle `AUTO` / `ULTRA` / `HIGH` / `BALANCED` in the top HUD bar.
