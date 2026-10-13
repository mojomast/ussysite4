# Easter-Egg Construction Guide (`ussysite4`)

`ussysite4` was designed specifically so that you (or a follow-up AI coding agent) can build a rich easter egg—such as a playable pipe-organ harmonic lock, a subterranean descent into the Crypt Reliquary, or an anomaly boss encounter—**without having to refactor the core 3D engine, shaders, or UI**.

Everything needed to trigger, animate, persist, and hook into an easter egg is already wired and tested.

---

## 1. What Is Already Built & Waiting for You

### 1.1 The `AnomalySystem` Singleton (`js/anomaly/anomaly-system.js`)
Accessible in code via `anomalySystem` (in `js/app.js`) and globally in the browser via `window.__USSY4_SDK__.anomaly`:

- **Reactive Shader Uniforms (`anomalySystem.uniforms`)**:
  Every custom shader in the 3D scene (`Pneuma` particles, `Ferrofluid` floor, `Iridescence` gimbals/rails, `Vault` caustics, `Lineage` ribbons, and `OrganumCinematicShader` post-processing) reads from the same shared uniform object:
  - `uAnomalyFactor.value` (`0.0` → `1.0`): Shifts the entire organum from brass/cyan into anomalous magenta/cyan, increases particle curl velocity, and agitates the ferrofluid floor.
  - `uCryptReveal.value` (`0.0` → `1.0`): Illuminates and accelerates the **Sub-Floor Crypt Reliquary** (`y = -14.2`) visible through the translucent center of the ferrofluid floor.
  - `uGlitchIntensity.value` (`0.0` → `1.0`): Controls radial chromatic aberration and holographic scanline distortion.
  - `uVolumetricPulse.value` (`0.0` → `1.0`): Controls crepuscular God-Ray intensity and bloom weight.
  - `uResonanceHz.value` (`440.0` default, or `432.0`): Controls the harmonic tuning of the WebAudio pipe-organ synthesizer.

- **Built-in Smooth Tweening**:
  ```js
  // Smoothly animate any shared uniform over durationMs:
  window.__USSY4_SDK__.anomaly.tween('uCryptReveal', 1.0, 2200);
  window.__USSY4_SDK__.anomaly.tween('uAnomalyFactor', 0.85, 1800);
  ```

### 1.2 Seven Pre-Wired Secret Detectors (`DEFAULT_DETECTORS`)
`AnomalySystem` automatically monitors user interactions across keyboard, 3D Stop navigation, 3D Rune raycast dwelling, audio resonance, and terminal commands:

| Detector ID | Type | How the User Triggers It | Default Uniform Delta |
| :--- | :--- | :--- | :--- |
| `konami` | `key-sequence` | Press `↑ ↑ ↓ ↓ ← → ← → B A` | `uAnomalyFactor += 0.25`, `uVolumetricPulse += 0.3` |
| `ussy-chord` | `key-sequence` | Type `u` `s` `s` `y` anywhere outside an input | `uAnomalyFactor += 0.2`, `uCryptReveal += 0.25` |
| `hermes-triad` | `stop-sequence` | Inspect Stops `cocs` → `hermesdashboard` → `becomussy` in sequence | `uAnomalyFactor += 0.25`, `uCryptReveal += 0.35` |
| `helix-ascension` | `stop-sequence` | Inspect Stops `orbitdesktop` → `velvetrp` → `jammate` → `cocs` in sequence | `uVolumetricPulse += 0.35` |
| `rune-trinity` | `rune-all` | Hover/dwell the 3D cursor for 1.6s on each of the 3 glowing Rune Anchors (`rune:windchest`, `rune:crypt-gate`, `rune:vault-keystone`) | `uAnomalyFactor += 0.35`, `uCryptReveal += 0.5` |
| `cmd-awaken` | `command` | Open the `~` Organum Console and run `/awaken` | `uAnomalyFactor = 1.0`, `uCryptReveal = 1.0` |
| `resonance-432` | `resonance` | Tune the Organum synthesizer to `432 Hz` (`/tune 432` or click the `440 Hz` badge) | `uAnomalyFactor += 0.15`, `uCryptReveal += 0.2` |

### 1.3 The Sub-Floor Crypt Reliquary (`this.cryptGroup` in `js/engine/organum-engine.js`)
Look down through the center of the nave floor (`(0, -14.2, 0)`):
- Beneath the translucent center of the ferrofluid basin sits a dormant **Crypt Reliquary** (`this.cryptGroup`, `this.cryptCore`, `this.cryptRingOuter`, `this.cryptRingInner`, `this.cryptLight`).
- As `uCryptReveal` increases from `0` to `1`, the subterranean chamber lights up in ultraviolet/cyan and its octahedral reliquary core spins up.

---

## 2. How to Plug In Your Easter Egg Payload

### Step 1: Create your easter-egg module (e.g. `js/anomaly/crypt-easter-egg.js`)

```js
// Example: js/anomaly/crypt-easter-egg.js
export function initCryptEasterEgg({ engine, audio, anomaly }) {
  // Called whenever ANY secret detector unlocks or /awaken is executed:
  anomaly.registerEasterEgg(({ triggerId, state, uniforms, system }) => {
    console.log('[CryptEasterEgg] Triggered by:', triggerId, 'Total unlocked:', state.unlockedTriggers.length);

    // Example: Once 3+ triggers are unlocked (or cmd-awaken is run), open the Crypt!
    if (triggerId === 'cmd-awaken' || state.unlockedTriggers.length >= 3) {
      system.tween('uCryptReveal', 1.0, 2000);
      system.tween('uAnomalyFactor', 1.0, 2000);
      audio.playAnomalyUnlockSound();

      // You can manipulate engine.camera, engine.cryptGroup, or mount a custom 3D mini-game here!
    }
  });

  // You can also listen to granular EventBus events:
  anomaly.bus.on('rune:activated', ({ runeId, activatedRunes }) => {
    console.log('Rune activated:', runeId, activatedRunes);
  });
}
```

### Step 2: Register it in `js/app.js`

At the bottom of `js/app.js` (or dynamically from the browser console via `window.__USSY4_SDK__`), call `initCryptEasterEgg({ engine, audio, anomaly: anomalySystem })`.

---

## 3. Interactive Testing via Browser Console or `~` Organum Console

You can test all foundation hooks right now without writing a single line of code:

1. Press **`~`** (backquote) in the browser to open the **Organum Console**, then type:
   - `/awaken` — Awakens the full anomaly state (`uAnomalyFactor = 1`, `uCryptReveal = 1`)
   - `/crypt 1` — Reveals the Sub-Floor Crypt Reliquary beneath the center floor
   - `/glitch 0.8` — Tests the chromatic aberration & glitch post-processing pass
   - `/tune 432` — Retunes the procedural WebAudio pipe organ to 432 Hz and unlocks `resonance-432`
   - `/sdk` — Prints all `window.__USSY4_SDK__` capabilities
   - `/reset` — Resets all detectors and uniforms back to baseline (`0.0`)
2. Or open Chrome DevTools Console and inspect `window.__USSY4_SDK__`:
   ```js
   __USSY4_SDK__.anomaly.getState();
   __USSY4_SDK__.engine.cryptGroup;
   __USSY4_SDK__.selectStop('cocs');
   ```
