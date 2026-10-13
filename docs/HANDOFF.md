# USSYSITE4 — Executive Handoff Summary

Read [`agent.md`](../agent.md) and [`docs/EASTER_EGG_GUIDE.md`](EASTER_EGG_GUIDE.md) first when resuming work.

---

## 1. Completed Architecture (v4.0.0)

- **World**: **The Helix Organum** — subterranean living pipe-organ & kinetic glass conservatory (zero planets, zero orbits, zero space starfields).
- **Three.js**: Vendored **`three@0.186.1`** (`js/vendor/three/`) with custom GLSL shaders (`js/shaders/organum-shaders.js`) and `EffectComposer` post-processing (`RenderPass` → `UnrealBloomPass` → `OrganumCinematicShader` with 24-sample radial God-Rays, chromatic aberration, vignette, film grain → `OutputPass`).
- **The 11 Nave Stops (`js/projects.js` & `/projects.js`)**:
  1. `orbitdesktop` (Stop `I` — `orrery-shell`)
  2. `velvetrp` (Stop `II` — `velvet-loom`)
  3. `jammate` (Stop `III` — `acoustic-resonator`)
  4. `cocs` (Stop `IV` — `claw-trinity`, live at `https://cocs.ussyco.de`)
  5. `cocs-godot` (Stop `V` — `voxel-arena`)
  6. `routetok` (Stop `VI` — `prism-splitter`)
  7. `rgbagentflightindicator` (Stop `VII` — `rgb-totem`)
  8. `mothbake` (Stop `VIII` — `photometric-kiln`)
  9. `warpi` (Stop `IX` — `tactical-array`)
  10. `hermesdashboard` (Stop `X` — `caduceus-command`)
  11. `becomussy` (Stop `XI` — `identity-chrysalis`)
- **Easter-Egg Foundation (`js/anomaly/anomaly-system.js`)**:
  - Shared uniforms wired across all scene shaders: `uAnomalyFactor`, `uWorldPhase`, `uGlitchIntensity`, `uVolumetricPulse`, `uCryptReveal`, `uResonanceHz`.
  - 7 detectors (`konami`, `ussy-chord`, `hermes-triad`, `helix-ascension`, `rune-trinity`, `cmd-awaken`, `resonance-432`).
  - 3 raycastable 3D Rune Anchors in the nave (`rune:windchest`, `rune:crypt-gate`, `rune:vault-keystone`).
  - Pre-built **Sub-Floor Crypt Reliquary** (`y = -14.2`) beneath the translucent center of the ferrofluid floor.
  - Global `window.__USSY4_SDK__` and `~` Organum Console.

---

## 2. Commands for Verification

```bash
npm run check:syntax
npm run check:mirrors
npm test
npm start
```
