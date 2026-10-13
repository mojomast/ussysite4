/**
 * USSYSITE4 // THE HELIX ORGANUM — CUSTOM GLSL SHADER SUITE
 *
 * Includes:
 * 1. 3D Simplex + Central-Difference Curl Noise (`GLSL_CURL_NOISE_CHUNK`)
 * 2. GPU Curl-Noise Pneuma Flow-Field Shaders (60,000+ particles on GPU)
 * 3. Real-Time SDF Raymarched / Metaball Ferrofluid Nave Basin Floor Shader
 * 4. Thin-Film Optical Interference Iridescence Shader (Helix Windrails & Windchest)
 * 5. Refractive Salt-Glass Vault Caustics & Volumetric Light Shaft Shaders
 * 6. Holographic Scanline & Hashline Data-Stream Ribbon Shaders
 * 7. OrganumCinematicShader Post-Processing Pass (Crepuscular God-Rays, Chromatic Dispersion, Vignette, Grain)
 */

export const GLSL_CURL_NOISE_CHUNK = /* glsl */ `
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v) {
  const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
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
  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}

vec3 snoiseVec3(vec3 x) {
  return vec3(
    snoise(x),
    snoise(x + vec3(31.2, 17.7, 9.4)),
    snoise(x + vec3(7.1, 27.9, 14.2))
  );
}

vec3 curlNoise(vec3 p) {
  const float e = 0.12;
  vec3 dx = vec3(e, 0.0, 0.0);
  vec3 dy = vec3(0.0, e, 0.0);
  vec3 dz = vec3(0.0, 0.0, e);
  vec3 x0 = snoiseVec3(p - dx), x1 = snoiseVec3(p + dx);
  vec3 y0 = snoiseVec3(p - dy), y1 = snoiseVec3(p + dy);
  vec3 z0 = snoiseVec3(p - dz), z1 = snoiseVec3(p + dz);
  float x = y1.z - y0.z - z1.y + z0.y;
  float y = z1.x - z0.x - x1.z + x0.z;
  float z = x1.y - x0.y - y1.x + y0.x;
  return normalize(vec3(x, y, z) + vec3(1e-5));
}
`;

export const PNEUMA_VERTEX_SHADER = /* glsl */ `
uniform float uTime;
uniform float uAnomalyFactor;
uniform float uWorldPhase;
uniform float uGlitchIntensity;
uniform float uVolumetricPulse;
uniform vec3 uActiveStopPos;
uniform float uHasActiveStop;
uniform vec3 uCursorWorld;
uniform float uCursorForce;
uniform float uPixelRatio;

attribute vec3 aColor;
attribute vec4 aSeed; // x: phase, y: speed, z: size, w: streamBand

varying vec3 vColor;
varying float vAlpha;
varying float vEnergy;

${GLSL_CURL_NOISE_CHUNK}

void main() {
  vec3 basePos = position;
  float phase = aSeed.x;
  float speed = aSeed.y;
  float baseSize = aSeed.z;
  float band = aSeed.w;

  // Flowing time coordinate inside the Helix Organum nave
  float flowTime = uTime * (0.14 + speed * 0.22) * (1.0 + uAnomalyFactor * 1.35) + phase;

  // Helical ascending draft along the nave axis
  float angle = flowTime * 0.55 + band * 6.283185;
  vec3 helicalDrift = vec3(
    cos(angle) * (2.2 + band * 2.8),
    mod(basePos.y + flowTime * 5.2, 46.0) - 10.0 - basePos.y,
    sin(angle) * (2.2 + band * 2.8)
  );

  vec3 samplePos = (basePos + helicalDrift * 0.45) * 0.045 + vec3(0.0, uTime * 0.035 + uWorldPhase * 0.08, 0.0);
  vec3 curl = curlNoise(samplePos);

  vec3 pos = basePos + helicalDrift + curl * (4.6 + uAnomalyFactor * 7.5);

  // Active Stop inhalation pull (the Organum inhales pneuma toward the focused sculpture)
  vec3 toStop = uActiveStopPos - pos;
  float distStop = length(toStop);
  float stopPull = uHasActiveStop * smoothstep(42.0, 2.5, distStop);
  pos += normalize(toStop + vec3(0.0001)) * stopPull * (4.2 + 1.8 * sin(uTime * 3.2 + phase * 6.0));

  // 3D pointer repulsion / vortex swirl
  vec3 fromCursor = pos - uCursorWorld;
  float distCursor = max(1.2, length(fromCursor));
  float cursorInfluence = clamp(abs(uCursorForce) * 18.0 / (distCursor * distCursor), 0.0, 6.5);
  vec3 swirlTangent = normalize(cross(fromCursor, vec3(0.0, 1.0, 0.0)) + vec3(0.001));
  pos += normalize(fromCursor) * sign(uCursorForce) * cursorInfluence + swirlTangent * (cursorInfluence * 0.55);

  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mvPosition;

  float depthAtten = clamp(240.0 / max(8.0, -mvPosition.z), 1.0, 18.0);
  float pulseScale = 1.0 + 0.35 * sin(uTime * 2.8 + phase * 12.0) + stopPull * 0.65;
  gl_PointSize = baseSize * pulseScale * depthAtten * uPixelRatio;

  // Color shifts toward gold/ivory on inhalation and prism-magenta under glitch
  vec3 inhaleTint = vec3(1.0, 0.86, 0.55);
  vec3 glitchTint = vec3(1.0, 0.18, 0.62);
  vColor = mix(aColor, inhaleTint, stopPull * 0.55);
  vColor = mix(vColor, glitchTint, uGlitchIntensity * step(0.75, fract(phase * 37.0 + uTime * 4.0)));

  // Smooth fade near chamber floor/vault boundaries
  float heightFade = smoothstep(-11.5, -5.0, pos.y) * (1.0 - smoothstep(26.0, 35.5, pos.y));
  vAlpha = (0.36 + 0.44 * stopPull + 0.2 * uVolumetricPulse) * heightFade;
  vEnergy = stopPull + uAnomalyFactor * 0.6;
}
`;

export const PNEUMA_FRAGMENT_SHADER = /* glsl */ `
varying vec3 vColor;
varying float vAlpha;
varying float vEnergy;

void main() {
  vec2 uv = gl_PointCoord - vec2(0.5);
  float r = length(uv) * 2.0;
  if (r > 1.0) discard;

  // Soft glowing core + refractive halo ring
  float core = exp(-r * r * 5.2);
  float halo = smoothstep(1.0, 0.35, r) * 0.45;
  float ring = exp(-pow((r - 0.62) * 5.5, 2.0)) * 0.28 * clamp(vEnergy, 0.0, 1.0);

  float intensity = core + halo + ring;
  vec3 finalColor = vColor * (0.85 + core * 0.95);
  gl_FragColor = vec4(finalColor, intensity * vAlpha);
}
`;

export const FERROFLUID_VERTEX_SHADER = /* glsl */ `
uniform float uTime;
uniform float uAnomalyFactor;
uniform float uWorldPhase;
uniform vec3 uActiveStopPos;
uniform float uHasActiveStop;
uniform vec3 uCursorWorld;
uniform float uCursorForce;
uniform vec3 uStopPositions[11];

varying vec3 vWorldPos;
varying vec3 vNormal;
varying vec2 vUv;
varying float vFluidHeight;
varying float vStopProximity;

float smin(float a, float b, float k) {
  float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
  return mix(b, a, h) - k * h * (1.0 - h);
}

void main() {
  vUv = uv;
  vec4 worldInitial = modelMatrix * vec4(position, 1.0);
  vec2 xz = worldInitial.xz;

  // Smooth-min union distance to all 11 Stop projections on the floor
  float dMin = 100.0;
  for (int i = 0; i < 11; i++) {
    float d = length(xz - uStopPositions[i].xz);
    dMin = smin(dMin, d, 4.5);
  }

  float stopWell = exp(-dMin * 0.18);

  // Active stop creates a spiky magnetic ferrofluid crown
  float dActive = length(xz - uActiveStopPos.xz);
  float activeCrown = uHasActiveStop * exp(-dActive * 0.22) * (1.4 + 0.6 * sin(dActive * 2.6 - uTime * 4.5));

  // Cursor ripple magnet
  float dCursor = length(xz - uCursorWorld.xz);
  float cursorPeak = abs(uCursorForce) * exp(-dCursor * 0.25) * (0.95 + 0.45 * cos(dCursor * 3.2 - uTime * 6.0));

  // Standing capillary ferrofluid Rosensweig spikes
  float spikes = sin(xz.x * 1.45 + uTime * 1.3 + uWorldPhase) * cos(xz.y * 1.45 - uTime * 1.1);
  float harmonic = sin(length(xz) * 0.65 - uTime * 2.1 + uWorldPhase) * (0.18 + uAnomalyFactor * 0.55);

  float height = (stopWell * 0.65 + activeCrown * 1.15 + cursorPeak * 0.85) * (0.65 + 0.45 * spikes) + harmonic * 0.35;

  vec3 displaced = position + vec3(0.0, 0.0, height);
  // Note: PlaneGeometry is rotated -PI/2 on X, so local Z is world +Y
  vec4 worldPos = modelMatrix * vec4(position.x, position.y, position.z + height, 1.0);
  vWorldPos = worldPos.xyz;
  vFluidHeight = height;
  vStopProximity = clamp(stopWell + activeCrown, 0.0, 1.5);

  // Analytical normal estimation from ripple derivatives
  float gx = cos(xz.x * 1.45 + uTime * 1.3) * 0.25 * (stopWell + activeCrown + 0.2);
  float gz = -sin(xz.y * 1.45 - uTime * 1.1) * 0.25 * (stopWell + activeCrown + 0.2);
  vNormal = normalize(vec3(-gx, 1.0, -gz));

  gl_Position = projectionMatrix * viewMatrix * worldPos;
}
`;

export const FERROFLUID_FRAGMENT_SHADER = /* glsl */ `
uniform float uTime;
uniform float uAnomalyFactor;
uniform float uWorldPhase;
uniform float uGlitchIntensity;
uniform float uCryptReveal;
uniform vec3 uActiveStopColor;
uniform vec3 uCameraPos;

varying vec3 vWorldPos;
varying vec3 vNormal;
varying vec2 vUv;
varying float vFluidHeight;
varying float vStopProximity;

void main() {
  vec2 xz = vWorldPos.xz;
  float radial = length(xz);

  // Discard outer edge smoothly into subterranean darkness
  float edgeMask = 1.0 - smoothstep(46.0, 56.0, radial);
  if (edgeMask <= 0.005) discard;

  // Tessellated brass-and-obsidian mosaic grid under the ferrofluid oil film
  vec2 gridUv = abs(fract(xz * 0.25 - 0.5) - 0.5) / fwidth(xz * 0.25);
  float brassLine = 1.0 - min(min(gridUv.x, gridUv.y), 1.0);

  // Polar concentric organ rings on the floor
  float ringWave = abs(fract(radial * 0.125 - 0.5) - 0.5);
  float ringBrass = smoothstep(0.035, 0.0, ringWave);

  // Dual-frequency refractive vault caustics projected onto the floor
  float c1 = sin(xz.x * 0.42 + uTime * 0.9 + sin(xz.y * 0.31 + uWorldPhase));
  float c2 = cos(xz.y * 0.46 - uTime * 0.75 + cos(xz.x * 0.29 - uWorldPhase));
  float caustic = pow(max(0.0, c1 * c2), 2.0) * (1.0 - smoothstep(8.0, 44.0, radial));

  // View vector & Fresnel for dark magnetic ferrofluid sheen
  vec3 V = normalize(uCameraPos - vWorldPos);
  vec3 N = normalize(vNormal);
  float ndotv = clamp(dot(N, V), 0.0, 1.0);
  float fresnel = pow(1.0 - ndotv, 3.5);

  // Base dark ferrofluid oil + brass tesserae + iridescent sheen
  vec3 oilBase = vec3(0.025, 0.032, 0.048);
  vec3 brassColor = vec3(0.76, 0.58, 0.24);
  vec3 causticColor = mix(vec3(0.18, 0.75, 0.78), uActiveStopColor, 0.48);

  // Thin-film oil rainbow on ferrofluid peaks
  float filmPhase = ndotv * 4.0 + vFluidHeight * 2.2 + uWorldPhase;
  vec3 thinFilm = 0.5 + 0.5 * cos(6.28318 * (vec3(0.0, 0.33, 0.67) + filmPhase));

  vec3 col = oilBase;
  col += brassColor * (brassLine * 0.22 + ringBrass * 0.32) * (0.5 + 0.5 * vStopProximity);
  col += causticColor * caustic * (0.45 + 0.55 * vStopProximity);
  col += mix(uActiveStopColor, thinFilm, 0.55) * fresnel * (0.45 + vFluidHeight * 0.6);

  // Central Crypt Reliquary aperture window (radius < 9.5): semi-transparent glass tesserae
  float cryptWindow = 1.0 - smoothstep(6.5, 10.2, radial);
  vec3 cryptGlow = vec3(0.95, 0.62, 0.18) * (0.28 + 0.72 * uCryptReveal + 0.35 * uAnomalyFactor);
  col = mix(col, col + cryptGlow * (0.6 + 0.4 * brassLine), cryptWindow);

  // Glitch scanline hash
  if (uGlitchIntensity > 0.01) {
    float glitchBand = step(0.94, fract(sin(floor(xz.y * 2.0 + uTime * 18.0) * 91.7) * 43758.5));
    col = mix(col, vec3(0.95, 0.2, 0.55), glitchBand * uGlitchIntensity * 0.55);
  }

  float alpha = edgeMask * mix(0.94, 0.52 - 0.22 * uCryptReveal, cryptWindow);
  gl_FragColor = vec4(col, alpha);
}
`;

export const IRIDESCENCE_VERTEX_SHADER = /* glsl */ `
varying vec3 vNormal;
varying vec3 vViewDir;
varying vec2 vUv;
varying vec3 vWorldPos;

void main() {
  vUv = uv;
  vec4 worldPos = modelMatrix * vec4(position, 1.0);
  vWorldPos = worldPos.xyz;
  vNormal = normalize(normalMatrix * normal);
  vec4 mvPos = viewMatrix * worldPos;
  vViewDir = normalize(-mvPos.xyz);
  gl_Position = projectionMatrix * mvPos;
}
`;

export const IRIDESCENCE_FRAGMENT_SHADER = /* glsl */ `
uniform float uTime;
uniform float uWorldPhase;
uniform float uAnomalyFactor;
uniform float uGlitchIntensity;
uniform vec3 uBaseColor;
uniform vec3 uAccentColor;
uniform float uOpacity;

varying vec3 vNormal;
varying vec3 vViewDir;
varying vec2 vUv;
varying vec3 vWorldPos;

void main() {
  float ndotv = clamp(dot(normalize(vNormal), normalize(vViewDir)), 0.0, 1.0);
  float fresnel = pow(1.0 - ndotv, 2.6);

  // 2-bounce thin-film interference cosine spectrum
  float film = (1.65 * ndotv + vUv.x * 2.5 - uTime * 0.35 + uWorldPhase * 0.5);
  vec3 irid = 0.5 + 0.5 * cos(6.28318 * (vec3(0.0, 0.33, 0.67) + film));

  // Travelling pneumatic pulse along the windrail tube
  float pneumaWave = pow(0.5 + 0.5 * sin(vUv.x * 28.0 - uTime * 3.8), 4.0);
  vec3 col = mix(uBaseColor, irid, fresnel * 0.72);
  col += uAccentColor * pneumaWave * (0.55 + uAnomalyFactor * 0.65);

  if (uGlitchIntensity > 0.01) {
    float h = step(0.92, fract(sin(floor(vUv.x * 90.0 + uTime * 20.0) * 12.9898) * 43758.5453));
    col = mix(col, vec3(1.0, 0.25, 0.65), h * uGlitchIntensity);
  }

  float alpha = clamp(uOpacity + fresnel * 0.35 + pneumaWave * 0.25, 0.1, 1.0);
  gl_FragColor = vec4(col, alpha);
}
`;

export const VAULT_CAUSTICS_VERTEX_SHADER = /* glsl */ `
varying vec3 vWorldPos;
varying vec3 vNormal;
varying vec2 vUv;

void main() {
  vUv = uv;
  vec4 worldPos = modelMatrix * vec4(position, 1.0);
  vWorldPos = worldPos.xyz;
  vNormal = normalize(normalMatrix * normal);
  gl_Position = projectionMatrix * viewMatrix * worldPos;
}
`;

export const VAULT_CAUSTICS_FRAGMENT_SHADER = /* glsl */ `
uniform float uTime;
uniform float uWorldPhase;
uniform float uAnomalyFactor;
uniform vec3 uPrimaryColor;
uniform vec3 uSecondaryColor;

varying vec3 vWorldPos;
varying vec3 vNormal;
varying vec2 vUv;

void main() {
  vec2 p = vWorldPos.xz * 0.085;
  float t = uTime * 0.55 + uWorldPhase * 0.4;

  // Dual-layer salt-glass aquarium water caustics
  float w1 = sin(p.x * 3.4 + t + cos(p.y * 2.9 - t * 0.8));
  float w2 = cos(p.y * 3.8 - t * 1.1 + sin(p.x * 3.1 + t * 0.7));
  float w3 = sin((p.x + p.y) * 2.7 - t * 0.9);
  float caustic = pow(clamp((w1 * w2 + w3 * 0.5) * 0.6 + 0.4, 0.0, 1.0), 3.2);

  // Architectural ribs of the vaulted dome
  float angle = atan(vWorldPos.z, vWorldPos.x);
  float radial = length(vWorldPos.xz);
  float rib = smoothstep(0.06, 0.0, abs(sin(angle * 11.0))) * 0.45;
  float ring = smoothstep(0.35, 0.0, abs(fract(radial * 0.11) - 0.5)) * 0.35;

  vec3 col = mix(uPrimaryColor, uSecondaryColor, caustic);
  col = col * (caustic * 0.85 + rib + ring) * (0.65 + uAnomalyFactor * 0.6);

  float domeFade = smoothstep(10.0, 34.0, vWorldPos.y);
  float alpha = clamp((caustic * 0.34 + rib * 0.28 + ring * 0.22) * domeFade, 0.0, 0.72);
  gl_FragColor = vec4(col, alpha);
}
`;

export const LIGHT_SHAFT_VERTEX_SHADER = /* glsl */ `
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vViewDir;

void main() {
  vUv = uv;
  vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
  vNormal = normalize(normalMatrix * normal);
  vViewDir = normalize(-mvPos.xyz);
  gl_Position = projectionMatrix * mvPos;
}
`;

export const LIGHT_SHAFT_FRAGMENT_SHADER = /* glsl */ `
uniform float uTime;
uniform float uVolumetricPulse;
uniform float uAnomalyFactor;
uniform vec3 uShaftColor;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vViewDir;

void main() {
  // Soft edge falloff so cylinder/cone edges never clip harshly
  float edge = pow(abs(dot(normalize(vNormal), normalize(vViewDir))), 1.8);
  float verticalFade = smoothstep(0.0, 0.25, vUv.y) * (1.0 - smoothstep(0.75, 1.0, vUv.y));
  float shimmer = 0.75 + 0.25 * sin(vUv.x * 18.0 + uTime * 1.4 - vUv.y * 6.0);

  float alpha = edge * verticalFade * shimmer * (0.045 + 0.075 * uVolumetricPulse + 0.05 * uAnomalyFactor);
  gl_FragColor = vec4(uShaftColor, alpha);
}
`;

export const RIBBON_VERTEX_SHADER = /* glsl */ `
uniform float uTime;
uniform float uAnomalyFactor;

varying vec2 vUv;

void main() {
  vUv = uv;
  vec3 pos = position;
  // Subtle harmonic vibration along data ribbons when anomaly rises
  pos.y += sin(uv.x * 18.84 + uTime * 3.2) * (0.04 + 0.22 * uAnomalyFactor);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
`;

export const RIBBON_FRAGMENT_SHADER = /* glsl */ `
uniform float uTime;
uniform float uGlitchIntensity;
uniform float uAnomalyFactor;
uniform vec3 uAccentColor;
uniform float uHighlight;

varying vec2 vUv;

float hash21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

void main() {
  // Travelling data packets along the ribbon
  float packet1 = pow(0.5 + 0.5 * sin(vUv.x * 32.0 - uTime * 5.2), 6.0);
  float packet2 = pow(0.5 + 0.5 * sin(vUv.x * 20.0 + uTime * 3.4), 8.0);
  float scan = 0.55 + 0.45 * sin(vUv.x * 140.0 + uTime * 8.0);

  float hashline = step(0.92, hash21(vec2(floor(vUv.x * 90.0), floor(uTime * 12.0))));

  vec3 col = uAccentColor * (0.45 + 0.55 * scan);
  col += vec3(1.0, 0.95, 0.85) * (packet1 * 0.75 + packet2 * 0.45 + hashline * 0.35);
  col = mix(col, vec3(1.0, 0.15, 0.55), uGlitchIntensity * hashline);

  float baseAlpha = 0.16 + 0.26 * uHighlight + 0.22 * (packet1 + packet2) + 0.15 * uAnomalyFactor;
  gl_FragColor = vec4(col, clamp(baseAlpha, 0.08, 0.92));
}
`;

export const OrganumCinematicShader = {
  name: 'OrganumCinematicShader',
  uniforms: {
    tDiffuse: { value: null },
    uTime: { value: 0 },
    uAnomalyFactor: { value: 0 },
    uWorldPhase: { value: 0 },
    uGlitchIntensity: { value: 0 },
    uVolumetricPulse: { value: 0.25 },
    uLightScreenPos: { value: { x: 0.5, y: 0.82 } }
  },
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse;
    uniform float uTime;
    uniform float uAnomalyFactor;
    uniform float uWorldPhase;
    uniform float uGlitchIntensity;
    uniform float uVolumetricPulse;
    uniform vec2 uLightScreenPos;

    varying vec2 vUv;

    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
    }

    void main() {
      vec2 uv = vUv;
      vec2 centered = uv - 0.5;
      float radialDist = length(centered);

      // 1. Radial Chromatic Dispersion (subtle optical glass edge + glitch amplification)
      float caAmount = (0.0014 + uGlitchIntensity * 0.011 + uAnomalyFactor * 0.0025) * radialDist;
      vec2 caOffset = normalize(centered + vec2(1e-5)) * caAmount;

      // Glitch horizontal tear lines when uGlitchIntensity is active
      if (uGlitchIntensity > 0.02) {
        float slice = floor(uv.y * 48.0 + uTime * 16.0);
        float tear = step(0.92 - uGlitchIntensity * 0.25, hash(vec2(slice, floor(uTime * 24.0))));
        uv.x += (hash(vec2(slice, 1.7)) - 0.5) * 0.028 * uGlitchIntensity * tear;
      }

      float r = texture2D(tDiffuse, uv + caOffset).r;
      float g = texture2D(tDiffuse, uv).g;
      float b = texture2D(tDiffuse, uv - caOffset).b;
      vec3 color = vec3(r, g, b);

      // 2. Crepuscular God-Ray Radial Sampling from Vault Key Light NDC
      vec2 deltaTextCoord = (uv - uLightScreenPos) * (1.0 / 16.0) * 0.52;
      vec2 sampleUv = uv;
      float illuminationDecay = 1.0;
      vec3 godRayAccum = vec3(0.0);

      for (int i = 0; i < 16; i++) {
        sampleUv -= deltaTextCoord;
        vec3 s = texture2D(tDiffuse, clamp(sampleUv, 0.01, 0.99)).rgb;
        float luma = dot(s, vec3(0.299, 0.587, 0.114));
        vec3 highlight = s * smoothstep(0.42, 0.95, luma);
        godRayAccum += highlight * illuminationDecay * 0.045;
        illuminationDecay *= 0.92;
      }

      vec3 shaftTint = mix(vec3(0.35, 0.85, 0.88), vec3(0.96, 0.72, 0.32), 0.45 + 0.35 * sin(uWorldPhase));
      color += godRayAccum * shaftTint * (0.45 + uVolumetricPulse * 0.85);

      // 3. Subterranean Baroque Vignette + Crypt Amber Lift
      float vignette = 1.0 - smoothstep(0.38, 0.92, radialDist * (1.05 + uAnomalyFactor * 0.18));
      color *= mix(0.48, 1.0, vignette);
      color += vec3(0.12, 0.06, 0.01) * (1.0 - vignette) * uAnomalyFactor;

      // 4. Fine Analog Film Grain
      float grain = (hash(uv * 512.0 + fract(uTime * 17.3)) - 0.5) * 0.026;
      color += grain;

      gl_FragColor = vec4(max(vec3(0.0), color), 1.0);
    }
  `
};
