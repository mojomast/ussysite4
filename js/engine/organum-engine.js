/**
 * USSYSITE4 // THE HELIX ORGANUM — 3D ENGINE & NAVIGATION DIRECTOR
 *
 * Built on Three.js r186 (0.186.1) ES Modules.
 * Architecture:
 * - Caustic Salt-Glass Vault + Volumetric Light Shafts
 * - SDF Raymarched / Metaball Ferrofluid Nave Basin Floor
 * - Sub-Floor Crypt Reliquary (Easter Egg Foundation Chamber)
 * - Central Breathing Windchest Core + 24-Pipe Cathedral Crown
 * - Triple-Helix Iridescent Windrail (CatmullRomCurve3 x 3)
 * - 11 Bespoke Kinetic Project Sculptures ("Stops" I - XI)
 * - Holographic Scanline & Hashline Lineage Data Ribbons
 * - 60,000 GPU Curl-Noise Pneuma Flow-Field Particles
 * - 4 Raycastable 3D Rune Anchors (1.2s dwell detector hook)
 * - EffectComposer Post-Processing: RenderPass -> UnrealBloomPass -> OrganumCinematicPass -> OutputPass
 */

import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

import { USSY_PROJECTS, USSY_CATEGORIES } from '../projects.js';
import { RUNE_ANCHOR_SPECS } from '../anomaly/anomaly-system.js';
import { createProjectStation, updateStationSculpture } from '../stations/station-builder.js';
import {
  PNEUMA_VERTEX_SHADER,
  PNEUMA_FRAGMENT_SHADER,
  FERROFLUID_VERTEX_SHADER,
  FERROFLUID_FRAGMENT_SHADER,
  IRIDESCENCE_VERTEX_SHADER,
  IRIDESCENCE_FRAGMENT_SHADER,
  VAULT_CAUSTICS_VERTEX_SHADER,
  VAULT_CAUSTICS_FRAGMENT_SHADER,
  LIGHT_SHAFT_VERTEX_SHADER,
  LIGHT_SHAFT_FRAGMENT_SHADER,
  RIBBON_VERTEX_SHADER,
  RIBBON_FRAGMENT_SHADER,
  OrganumCinematicShader
} from '../shaders/organum-shaders.js';

export const QUALITY_TIERS = {
  high: {
    id: 'high',
    dprCap: 1.5,
    particles: 60000,
    bloom: true,
    cinematicPass: true,
    msaa: 4,
    bloomScale: 0.5
  },
  medium: {
    id: 'medium',
    dprCap: 1.25,
    particles: 32000,
    bloom: true,
    cinematicPass: true,
    msaa: 2,
    bloomScale: 0.5
  },
  low: {
    id: 'low',
    dprCap: 1.0,
    particles: 14000,
    bloom: false,
    cinematicPass: false,
    msaa: 2,
    bloomScale: 0.5
  },
  reduced: {
    id: 'reduced',
    dprCap: 1.0,
    particles: 6000,
    bloom: false,
    cinematicPass: false,
    msaa: 0,
    bloomScale: 0.5
  }
};

/**
 * Pure helper: computes the 3D position of Stop `index` along the ascending double-turn Helix Organum nave.
 */
export function computeHelixStopAnchor(index, totalStops = 11) {
  const t = totalStops <= 1 ? 0 : index / (totalStops - 1);
  // 1.85 turns ascending around the Windchest nave
  const angle = t * Math.PI * 2 * 1.65 - Math.PI * 0.75;
  const radius = 25.5 + Math.sin(t * Math.PI) * 4.5 + (index % 2 === 0 ? 1.4 : -1.4);
  const y = -5.2 + t * 20.4;
  return new THREE.Vector3(
    Math.cos(angle) * radius,
    y,
    Math.sin(angle) * radius
  );
}

/**
 * Pure helper: computes the 3D position of Stop `index` in the 4-Quadrant Lineage Loom layout.
 */
export function computeLineageStopAnchor(project, index, allProjects = USSY_PROJECTS) {
  const categoryOrder = ['workspace', 'ai', 'creative', 'infra'];
  const catIdx = Math.max(0, categoryOrder.indexOf(project.category));
  const sameCategory = allProjects.filter((p) => p.category === project.category);
  const localIdx = Math.max(0, sameCategory.findIndex((p) => p.id === project.id));
  const count = Math.max(1, sameCategory.length);

  const sectorCenterAngle = (catIdx / 4) * Math.PI * 2 + Math.PI * 0.25;
  const spread = 0.52;
  const offsetAngle = count === 1 ? 0 : ((localIdx / (count - 1)) - 0.5) * spread;
  const angle = sectorCenterAngle + offsetAngle;
  const radius = 29.0 + (localIdx % 2) * 3.5;
  const y = -1.5 + localIdx * 4.8;

  return new THREE.Vector3(
    Math.cos(angle) * radius,
    y,
    Math.sin(angle) * radius
  );
}

export class OrganumEngine {
  constructor({
    container,
    audio,
    anomaly,
    onSelectStop,
    onHoverStop,
    onCameraTelemetry,
    onRuneProgress
  } = {}) {
    this.container = container;
    this.audio = audio;
    this.anomaly = anomaly;
    this.onSelectStop = onSelectStop || (() => {});
    this.onHoverStop = onHoverStop || (() => {});
    this.onCameraTelemetry = onCameraTelemetry || (() => {});
    this.onRuneProgress = onRuneProgress || (() => {});

    this.prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    this.qualityTier = this.prefersReducedMotion ? 'reduced' : 'medium';
    this.viewMode = 'overview'; // 'overview' | 'rail' | 'lineage'
    this.activeFilter = 'all';

    this.stations = new Map();
    this.stationList = [];
    this.ribbons = [];
    this.runeMeshes = [];
    this.windchestRings = [];

    this.hoveredStopId = null;
    this.focusedStopId = null;
    this.hoveredRuneId = null;
    this.runeDwellMs = 0;

    // Navigation & Camera Choreography state
    this.splineCurve = null;
    this.splineT = 0.08;
    this.targetSplineT = 0.08;
    this.railOffset = 0; // -1 inner, 0 middle, +1 outer

    this.cameraRig = {
      yaw: 0.35,
      pitch: 0.24,
      distance: 62,
      targetYaw: 0.35,
      targetPitch: 0.24,
      targetDistance: 62,
      lookAt: new THREE.Vector3(0, 3.0, 0),
      targetLookAt: new THREE.Vector3(0, 3.0, 0),
      prevPosition: new THREE.Vector3(0, 18, 62),
      speedMps: 0
    };

    this.pointer = new THREE.Vector2(99, 99);
    this.cursorWorld = new THREE.Vector3(0, -10, 0);
    this.cursorForce = 0;
    this.isDragging = false;
    this.dragMoved = false;
    this.dragStart = { x: 0, y: 0 };

    // Adaptive FPS & quality window
    this._frameCount = 0;
    this._fpsAccumSec = 0;
    this._currentFps = 60;
    this._slowWindows = 0;
    this._fastWindows = 0;
    this._lastFrameTime = performance.now();
    this._destroyed = false;

    if (this.container) {
      this._init();
    }
  }

  _init() {
    const width = this.container.clientWidth || window.innerWidth || 1280;
    const height = this.container.clientHeight || window.innerHeight || 720;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color('#070a10');
    this.scene.fog = new THREE.FogExp2('#070a10', 0.0068);

    this.camera = new THREE.PerspectiveCamera(46, width / height, 0.15, 240);
    this.camera.position.set(22, 18, 58);
    this.camera.lookAt(0, 3, 0);

    this.renderer = new THREE.WebGLRenderer({
      // MSAA is handled by the post-processing render target (see _buildPostProcessing);
      // canvas-level MSAA is wasted when every frame ends in a fullscreen OutputPass.
      antialias: false,
      powerPreference: 'high-performance'
    });
    const tierCfg = QUALITY_TIERS[this.qualityTier];
    const dpr = Math.min(window.devicePixelRatio || 1, tierCfg.dprCap);
    this.renderer.setPixelRatio(dpr);
    this.renderer.setSize(width, height);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.12;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;

    this.container.innerHTML = '';
    this.container.appendChild(this.renderer.domElement);

    // PMREM Environment for physical glass transmission & metallic brass reflections
    const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
    const roomEnv = new RoomEnvironment();
    this.envTexture = pmremGenerator.fromScene(roomEnv, 0.04).texture;
    this.scene.environment = this.envTexture;
    roomEnv.dispose?.();
    pmremGenerator.dispose();

    this.raycaster = new THREE.Raycaster();
    this.floorPlaneMath = new THREE.Plane(new THREE.Vector3(0, 1, 0), 10.2);

    this._buildLighting();
    this._buildArchitectureAndVault();
    this._buildWindchestAndCrypt();
    this._buildStopsAndHelixRails();
    this._buildFerrofluidFloor();
    this._buildLineageRibbons();
    this._buildRuneAnchors();
    this._buildPneumaParticles();
    this._buildPostProcessing(width, height);
    this._bindEvents();

    this.renderer.setAnimationLoop((now) => this._tick(now));
  }

  _buildLighting() {
    const ambient = new THREE.AmbientLight('#1e293b', 0.85);
    this.scene.add(ambient);

    // Vault Ocular Key Light from above
    this.vaultKeyLight = new THREE.DirectionalLight('#67e8f9', 2.4);
    this.vaultKeyLight.position.set(0, 38, 6);
    this.scene.add(this.vaultKeyLight);

    // Warm Brass Windchest Point Light
    this.windchestLight = new THREE.PointLight('#f59e0b', 3.6, 55, 1.4);
    this.windchestLight.position.set(0, 3.5, 0);
    this.scene.add(this.windchestLight);

    // Crypt Under-Floor Amber Light
    this.cryptLight = new THREE.PointLight('#ea580c', 2.2, 28, 1.5);
    this.cryptLight.position.set(0, -13.5, 0);
    this.scene.add(this.cryptLight);
  }

  _buildArchitectureAndVault() {
    this.architectureGroup = new THREE.Group();
    this.architectureGroup.name = 'organum-architecture';
    this.scene.add(this.architectureGroup);

    // 1. Caustic Salt-Glass Vault Ceiling (Inverted Dome)
    const vaultGeo = new THREE.SphereGeometry(54, 48, 28, 0, Math.PI * 2, 0, Math.PI * 0.52);
    this.vaultMaterial = new THREE.ShaderMaterial({
      vertexShader: VAULT_CAUSTICS_VERTEX_SHADER,
      fragmentShader: VAULT_CAUSTICS_FRAGMENT_SHADER,
      uniforms: {
        uTime: this.anomaly.uniforms.uTime,
        uWorldPhase: this.anomaly.uniforms.uWorldPhase,
        uAnomalyFactor: this.anomaly.uniforms.uAnomalyFactor,
        uPrimaryColor: { value: new THREE.Color('#22d3ee') },
        uSecondaryColor: { value: new THREE.Color('#f59e0b') }
      },
      side: THREE.BackSide,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });
    this.anomaly.attachMaterial(this.vaultMaterial);

    const vaultMesh = new THREE.Mesh(vaultGeo, this.vaultMaterial);
    vaultMesh.position.y = -4.0;
    this.architectureGroup.add(vaultMesh);

    // 2. 12 Subterranean Brass-and-Basalt Organ Buttress Columns around the Nave Perimeter
    const pillarMat = new THREE.MeshStandardMaterial({
      color: '#121722',
      metalness: 0.82,
      roughness: 0.32
    });
    const brassRibMat = new THREE.MeshStandardMaterial({
      color: '#b48a32',
      metalness: 0.9,
      roughness: 0.22
    });

    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      const r = 44.5;
      const colGroup = new THREE.Group();
      colGroup.position.set(Math.cos(a) * r, 11.0, Math.sin(a) * r);
      colGroup.lookAt(0, 11.0, 0);

      const shaft = new THREE.Mesh(new THREE.BoxGeometry(1.4, 44.0, 2.2), pillarMat);
      const brassStrip = new THREE.Mesh(new THREE.BoxGeometry(0.28, 44.0, 2.35), brassRibMat);
      colGroup.add(shaft, brassStrip);
      this.architectureGroup.add(colGroup);
    }

    // 3. Five Volumetric Crepuscular Light Shaft Cones from the Vault Apex
    this.lightShaftMaterial = new THREE.ShaderMaterial({
      vertexShader: LIGHT_SHAFT_VERTEX_SHADER,
      fragmentShader: LIGHT_SHAFT_FRAGMENT_SHADER,
      uniforms: {
        uTime: this.anomaly.uniforms.uTime,
        uVolumetricPulse: this.anomaly.uniforms.uVolumetricPulse,
        uAnomalyFactor: this.anomaly.uniforms.uAnomalyFactor,
        uShaftColor: { value: new THREE.Color('#5eead4') }
      },
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending
    });
    this.anomaly.attachMaterial(this.lightShaftMaterial);

    const shaftOffsets = [
      [0, 0],
      [12, 8],
      [-12, 8],
      [10, -11],
      [-10, -11]
    ];
    for (const [ox, oz] of shaftOffsets) {
      const cone = new THREE.Mesh(
        new THREE.CylinderGeometry(1.8, 7.5, 44.0, 24, 1, true),
        this.lightShaftMaterial
      );
      cone.position.set(ox, 12.0, oz);
      this.architectureGroup.add(cone);
    }
  }

  _buildWindchestAndCrypt() {
    this.windchestGroup = new THREE.Group();
    this.windchestGroup.name = 'windchest-core';
    this.windchestGroup.position.set(0, 2.5, 0);
    this.scene.add(this.windchestGroup);

    // Iridescent shader material shared by Windchest rings & primary Windrail
    this.iridescenceMaterial = new THREE.ShaderMaterial({
      vertexShader: IRIDESCENCE_VERTEX_SHADER,
      fragmentShader: IRIDESCENCE_FRAGMENT_SHADER,
      uniforms: {
        uTime: this.anomaly.uniforms.uTime,
        uWorldPhase: this.anomaly.uniforms.uWorldPhase,
        uAnomalyFactor: this.anomaly.uniforms.uAnomalyFactor,
        uGlitchIntensity: this.anomaly.uniforms.uGlitchIntensity,
        uBaseColor: { value: new THREE.Color('#d4af37') },
        uAccentColor: { value: new THREE.Color('#3ee0d0') },
        uOpacity: { value: 0.78 }
      },
      transparent: true
    });
    this.anomaly.attachMaterial(this.iridescenceMaterial);

    // Breathing Transmissive Glass Lung Core
    const lungGlassMat = new THREE.MeshPhysicalMaterial({
      color: '#5eead4',
      transmission: 0.9,
      thickness: 1.8,
      ior: 1.46,
      dispersion: 0.32,
      roughness: 0.06,
      metalness: 0.05,
      iridescence: 0.8,
      transparent: true
    });
    this.windchestLung = new THREE.Mesh(new THREE.OctahedronGeometry(2.8, 2), lungGlassMat);
    this.windchestGroup.add(this.windchestLung);

    const innerHeartMat = new THREE.MeshStandardMaterial({
      color: '#f59e0b',
      emissive: '#f59e0b',
      emissiveIntensity: 2.4,
      roughness: 0.2
    });
    this.windchestHeart = new THREE.Mesh(new THREE.IcosahedronGeometry(1.25, 1), innerHeartMat);
    this.windchestGroup.add(this.windchestHeart);

    // Three counter-rotating iridescent harmonic gimbal rings
    for (let i = 0; i < 3; i++) {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(4.1 + i * 1.15, 0.12, 16, 72),
        this.iridescenceMaterial
      );
      ring.rotation.set(i * 0.6, i * 0.4, i * 0.3);
      this.windchestGroup.add(ring);
      this.windchestRings.push(ring);
    }

    // 16 Vertical Cathedral Organ Pipes encircling the Windchest base
    const pipeBrass = new THREE.MeshStandardMaterial({
      color: '#c99e3b',
      metalness: 0.9,
      roughness: 0.2
    });
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2;
      const h = 5.5 + Math.sin(i * 1.5) * 2.2;
      const pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, h, 12), pipeBrass);
      pipe.position.set(Math.cos(a) * 6.2, -7.5 + h * 0.5, Math.sin(a) * 6.2);
      this.windchestGroup.add(pipe);
    }

    // Sub-Floor Crypt Reliquary (visible through the translucent central floor basin)
    this.cryptGroup = new THREE.Group();
    this.cryptGroup.name = 'subfloor-crypt-reliquary';
    this.cryptGroup.position.set(0, -14.2, 0);
    this.scene.add(this.cryptGroup);

    const cryptAmberMat = new THREE.MeshStandardMaterial({
      color: '#f59e0b',
      emissive: '#d97706',
      emissiveIntensity: 1.4,
      wireframe: true
    });
    this.cryptReliquaryMesh = new THREE.Mesh(new THREE.DodecahedronGeometry(2.6, 1), cryptAmberMat);
    const cryptSealRing = new THREE.Mesh(new THREE.TorusGeometry(5.2, 0.14, 12, 48), pipeBrass);
    cryptSealRing.rotation.x = Math.PI / 2;
    this.cryptGroup.add(this.cryptReliquaryMesh, cryptSealRing);
  }

  _buildStopsAndHelixRails() {
    this.stopsGroup = new THREE.Group();
    this.stopsGroup.name = 'organum-stops';
    this.scene.add(this.stopsGroup);

    const total = USSY_PROJECTS.length;
    const splinePoints = [];

    for (let i = 0; i < total; i++) {
      const project = USSY_PROJECTS[i];
      const helixAnchor = computeHelixStopAnchor(i, total);
      const lineageAnchor = computeLineageStopAnchor(project, i, USSY_PROJECTS);
      const splineT = total <= 1 ? 0 : i / (total - 1);

      splinePoints.push(helixAnchor.clone());

      const station = createProjectStation(
        project,
        i,
        total,
        helixAnchor,
        splineT,
        this.qualityTier
      );
      station.layouts.overview.copy(helixAnchor);
      station.layouts.rail.copy(helixAnchor);
      station.layouts.lineage.copy(lineageAnchor);

      this.stations.set(project.id, station);
      this.stationList.push(station);
      this.stopsGroup.add(station.group);
    }

    // Build Triple-Helix Windrail (3 intertwined CatmullRom splines through the Nave)
    this.splineCurve = new THREE.CatmullRomCurve3(splinePoints, false, 'catmullrom', 0.5);

    this.railsGroup = new THREE.Group();
    this.railsGroup.name = 'triple-helix-windrail';
    this.scene.add(this.railsGroup);

    const railOffsets = [
      new THREE.Vector3(0, -1.6, 0),
      new THREE.Vector3(1.1, -2.0, 1.1),
      new THREE.Vector3(-1.1, -2.0, -1.1)
    ];

    for (let r = 0; r < 3; r++) {
      const offsetPts = splinePoints.map((pt) => pt.clone().add(railOffsets[r]));
      const curve = new THREE.CatmullRomCurve3(offsetPts, false, 'catmullrom', 0.5);
      const tubeGeo = new THREE.TubeGeometry(curve, 160, r === 0 ? 0.22 : 0.11, 12, false);
      const tubeMesh = new THREE.Mesh(tubeGeo, this.iridescenceMaterial);
      this.railsGroup.add(tubeMesh);
    }
  }

  _buildFerrofluidFloor() {
    const stopVecs = this.stationList.map((s) => s.anchor.clone());
    while (stopVecs.length < 11) {
      stopVecs.push(new THREE.Vector3(0, -10, 0));
    }

    this.ferrofluidMaterial = new THREE.ShaderMaterial({
      vertexShader: FERROFLUID_VERTEX_SHADER,
      fragmentShader: FERROFLUID_FRAGMENT_SHADER,
      uniforms: {
        uTime: this.anomaly.uniforms.uTime,
        uAnomalyFactor: this.anomaly.uniforms.uAnomalyFactor,
        uWorldPhase: this.anomaly.uniforms.uWorldPhase,
        uGlitchIntensity: this.anomaly.uniforms.uGlitchIntensity,
        uCryptReveal: this.anomaly.uniforms.uCryptReveal,
        uActiveStopPos: { value: new THREE.Vector3(0, -10, 0) },
        uHasActiveStop: { value: 0 },
        uActiveStopColor: { value: new THREE.Color('#3ee0d0') },
        uCursorWorld: { value: new THREE.Vector3(0, -10, 0) },
        uCursorForce: { value: 0 },
        uCameraPos: { value: this.camera.position.clone() },
        uStopPositions: { value: stopVecs }
      },
      transparent: true
    });
    this.anomaly.attachMaterial(this.ferrofluidMaterial);

    const floorGeo = new THREE.PlaneGeometry(116, 116, 128, 128);
    floorGeo.rotateX(-Math.PI / 2);
    this.ferrofluidFloor = new THREE.Mesh(floorGeo, this.ferrofluidMaterial);
    this.ferrofluidFloor.position.y = -10.2;
    this.scene.add(this.ferrofluidFloor);
  }

  _buildLineageRibbons() {
    this.ribbonsGroup = new THREE.Group();
    this.ribbonsGroup.name = 'holographic-lineage-ribbons';
    this.scene.add(this.ribbonsGroup);

    const createdPairs = new Set();

    for (const station of this.stationList) {
      const fromId = station.id;
      const connections = station.project.connections || [];

      for (const toId of connections) {
        const targetStation = this.stations.get(toId);
        if (!targetStation) continue;

        const pairKey = [fromId, toId].sort().join('::');
        if (createdPairs.has(pairKey)) continue;
        createdPairs.add(pairKey);

        const mat = new THREE.ShaderMaterial({
          vertexShader: RIBBON_VERTEX_SHADER,
          fragmentShader: RIBBON_FRAGMENT_SHADER,
          uniforms: {
            uTime: this.anomaly.uniforms.uTime,
            uGlitchIntensity: this.anomaly.uniforms.uGlitchIntensity,
            uAnomalyFactor: this.anomaly.uniforms.uAnomalyFactor,
            uAccentColor: { value: new THREE.Color(station.project.accentColor || '#3ee0d0') },
            uHighlight: { value: 0.0 }
          },
          transparent: true,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
          side: THREE.DoubleSide
        });
        this.anomaly.attachMaterial(mat);

        const curve = this._createRibbonCurve(station.group.position, targetStation.group.position);
        const geo = new THREE.TubeGeometry(curve, 36, 0.065, 6, false);
        const mesh = new THREE.Mesh(geo, mat);
        this.ribbonsGroup.add(mesh);

        this.ribbons.push({
          fromId,
          toId,
          mesh,
          mat
        });
      }
    }
  }

  _createRibbonCurve(posA, posB) {
    const mid = posA.clone().add(posB).multiplyScalar(0.5);
    // Arch slightly inward toward the central Windchest and upward
    mid.multiplyScalar(0.68);
    mid.y += 3.2;
    return new THREE.QuadraticBezierCurve3(posA.clone(), mid, posB.clone());
  }

  _rebuildRibbonGeometries() {
    for (const r of this.ribbons) {
      const stA = this.stations.get(r.fromId);
      const stB = this.stations.get(r.toId);
      if (!stA || !stB) continue;
      const curve = this._createRibbonCurve(stA.currentTargetPos, stB.currentTargetPos);
      r.mesh.geometry.dispose();
      r.mesh.geometry = new THREE.TubeGeometry(curve, 36, 0.065, 6, false);
    }
  }

  _buildRuneAnchors() {
    this.runesGroup = new THREE.Group();
    this.runesGroup.name = 'anomaly-rune-anchors';
    this.scene.add(this.runesGroup);

    for (const spec of RUNE_ANCHOR_SPECS) {
      const runeMat = new THREE.MeshStandardMaterial({
        color: '#f59e0b',
        emissive: '#3ee0d0',
        emissiveIntensity: 1.8,
        transparent: true,
        opacity: 0.28,
        wireframe: true
      });
      const mesh = new THREE.Mesh(new THREE.OctahedronGeometry(1.15, 0), runeMat);
      mesh.position.set(spec.position[0], spec.position[1], spec.position[2]);
      mesh.userData = {
        isRuneAnchor: true,
        runeId: spec.id,
        dwellMs: spec.dwellMs || 1200,
        label: spec.label
      };
      this.runesGroup.add(mesh);
      this.runeMeshes.push(mesh);
    }
  }

  _buildPneumaParticles() {
    const maxCount = QUALITY_TIERS.high.particles;
    const positions = new Float32Array(maxCount * 3);
    const colors = new Float32Array(maxCount * 3);
    const seeds = new Float32Array(maxCount * 4);

    const palette = USSY_PROJECTS.map((p) => new THREE.Color(p.accentColor));
    palette.push(new THREE.Color('#f8f5ee'), new THREE.Color('#d4af37'));

    for (let i = 0; i < maxCount; i++) {
      const i3 = i * 3;
      const i4 = i * 4;

      // Distribute inside the cylindrical cathedral nave volume
      const r = 4.0 + Math.pow(Math.random(), 0.72) * 39.0;
      const theta = Math.random() * Math.PI * 2;
      const y = -9.5 + Math.random() * 42.0;

      positions[i3] = Math.cos(theta) * r;
      positions[i3 + 1] = y;
      positions[i3 + 2] = Math.sin(theta) * r;

      const c = palette[i % palette.length];
      colors[i3] = c.r;
      colors[i3 + 1] = c.g;
      colors[i3 + 2] = c.b;

      seeds[i4] = Math.random() * Math.PI * 2; // phase
      seeds[i4 + 1] = 0.35 + Math.random() * 0.95; // speed
      seeds[i4 + 2] = 0.85 + Math.random() * 1.95; // size
      seeds[i4 + 3] = Math.random(); // helical band
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('aColor', new THREE.BufferAttribute(colors, 3));
    geo.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 4));
    geo.setDrawRange(0, QUALITY_TIERS[this.qualityTier].particles);

    this.pneumaMaterial = new THREE.ShaderMaterial({
      vertexShader: PNEUMA_VERTEX_SHADER,
      fragmentShader: PNEUMA_FRAGMENT_SHADER,
      uniforms: {
        uTime: this.anomaly.uniforms.uTime,
        uAnomalyFactor: this.anomaly.uniforms.uAnomalyFactor,
        uWorldPhase: this.anomaly.uniforms.uWorldPhase,
        uGlitchIntensity: this.anomaly.uniforms.uGlitchIntensity,
        uVolumetricPulse: this.anomaly.uniforms.uVolumetricPulse,
        uActiveStopPos: { value: new THREE.Vector3(0, 2, 0) },
        uHasActiveStop: { value: 0.0 },
        uCursorWorld: { value: new THREE.Vector3(0, -10, 0) },
        uCursorForce: { value: 0.0 },
        uPixelRatio: { value: this.renderer.getPixelRatio() }
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });
    this.anomaly.attachMaterial(this.pneumaMaterial);

    this.pneumaPoints = new THREE.Points(geo, this.pneumaMaterial);
    this.pneumaPoints.frustumCulled = false;
    this.pneumaPoints.name = 'pneuma-curl-particles';
    this.scene.add(this.pneumaPoints);
  }

  _buildPostProcessing(width, height) {
    const tierCfg = QUALITY_TIERS[this.qualityTier];
    const drawingSize = this.renderer.getDrawingBufferSize(new THREE.Vector2());
    // HDR (HalfFloat) render target with tier-appropriate MSAA so the 3D scene
    // (thin iridescent rails, glass, sculpture edges) is antialiased where it matters.
    const renderTarget = new THREE.WebGLRenderTarget(
      Math.max(1, Math.floor(drawingSize.x)),
      Math.max(1, Math.floor(drawingSize.y)),
      {
        type: THREE.HalfFloatType,
        samples: tierCfg.msaa
      }
    );
    this.composer = new EffectComposer(this.renderer, renderTarget);

    this.renderPass = new RenderPass(this.scene, this.camera);
    this.composer.addPass(this.renderPass);

    // Bloom runs at a fraction of the drawing-buffer resolution (it is a blur, so
    // the visual difference is negligible while the fill cost drops ~4x at 0.5).
    const bloomScale = tierCfg.bloomScale ?? 0.5;
    this.bloomPass = new UnrealBloomPass(
      new THREE.Vector2(drawingSize.x * bloomScale, drawingSize.y * bloomScale),
      0.52, // strength
      0.42, // radius
      0.68  // threshold
    );
    const baseBloomSetSize = this.bloomPass.setSize.bind(this.bloomPass);
    this.bloomPass.setSize = (w, h) => baseBloomSetSize(
      Math.max(1, Math.round(w * bloomScale)),
      Math.max(1, Math.round(h * bloomScale))
    );
    this.bloomPass.enabled = tierCfg.bloom;
    this.composer.addPass(this.bloomPass);

    this.cinematicPass = new ShaderPass(OrganumCinematicShader);
    this.cinematicPass.uniforms.uTime = this.anomaly.uniforms.uTime;
    this.cinematicPass.uniforms.uAnomalyFactor = this.anomaly.uniforms.uAnomalyFactor;
    this.cinematicPass.uniforms.uWorldPhase = this.anomaly.uniforms.uWorldPhase;
    this.cinematicPass.uniforms.uGlitchIntensity = this.anomaly.uniforms.uGlitchIntensity;
    this.cinematicPass.uniforms.uVolumetricPulse = this.anomaly.uniforms.uVolumetricPulse;
    this.cinematicPass.enabled = tierCfg.cinematicPass;
    this.composer.addPass(this.cinematicPass);

    this.outputPass = new OutputPass();
    this.composer.addPass(this.outputPass);
  }

  _bindEvents() {
    const dom = this.renderer.domElement;

    this._onPointerDown = (e) => {
      if (e.button !== 0) return;
      this.isDragging = true;
      this.dragMoved = false;
      this.dragStart.x = e.clientX;
      this.dragStart.y = e.clientY;
      this.cursorForce = -1.35; // Strong pneuma/ferrofluid swirl on press
    };

    this._onPointerMove = (e) => {
      const rect = dom.getBoundingClientRect();
      this.pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      this.pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      if (this.isDragging) {
        const dx = e.clientX - this.dragStart.x;
        const dy = e.clientY - this.dragStart.y;
        if (Math.hypot(dx, dy) > 4) {
          this.dragMoved = true;
        }
        this.cameraRig.targetYaw -= dx * 0.0055;
        this.cameraRig.targetPitch = Math.max(
          -0.28,
          Math.min(0.85, this.cameraRig.targetPitch + dy * 0.0045)
        );
        this.dragStart.x = e.clientX;
        this.dragStart.y = e.clientY;
      }

      this._updatePointerRaycast();
    };

    this._onPointerUp = () => {
      if (this.isDragging && !this.dragMoved) {
        if (this.hoveredStopId) {
          this.focusStop(this.hoveredStopId);
        }
      }
      this.isDragging = false;
      this.cursorForce = 0.55;
    };

    this._onWheel = (e) => {
      e.preventDefault();
      if (this.viewMode === 'rail') {
        // Advance or retreat along the Triple-Helix Windrail spline
        this.targetSplineT = Math.max(0, Math.min(1, this.targetSplineT + e.deltaY * 0.00045));
        this.focusedStopId = null;
      } else {
        this.cameraRig.targetDistance = Math.max(
          18,
          Math.min(92, this.cameraRig.targetDistance + e.deltaY * 0.04)
        );
      }
    };

    this._onResize = () => {
      if (!this.container || this._destroyed) return;
      const w = this.container.clientWidth || window.innerWidth;
      const h = this.container.clientHeight || window.innerHeight;
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(w, h);
      this.composer?.setSize(w, h);
      if (this.pneumaMaterial) {
        this.pneumaMaterial.uniforms.uPixelRatio.value = this.renderer.getPixelRatio();
      }
    };

    dom.addEventListener('pointerdown', this._onPointerDown);
    window.addEventListener('pointermove', this._onPointerMove, { passive: true });
    window.addEventListener('pointerup', this._onPointerUp, { passive: true });
    dom.addEventListener('wheel', this._onWheel, { passive: false });
    window.addEventListener('resize', this._onResize);
  }

  _updatePointerRaycast() {
    if (!this.raycaster || !this.camera) return;
    this.raycaster.setFromCamera(this.pointer, this.camera);

    // Intersect floor mathematical plane for ferrofluid & pneuma cursor force
    const hitPoint = new THREE.Vector3();
    if (this.raycaster.ray.intersectPlane(this.floorPlaneMath, hitPoint)) {
      this.cursorWorld.copy(hitPoint);
      if (!this.isDragging) {
        this.cursorForce = 0.75;
      }
    }

    // Intersect Stop colliders
    const stopColliders = this.stationList
      .filter((s) => s.group.visible)
      .map((s) => s.hitTarget);
    const hits = this.raycaster.intersectObjects(stopColliders, false);

    const nextStopId = hits.length > 0 ? hits[0].object.userData.stopId : null;
    if (nextStopId !== this.hoveredStopId) {
      this.hoveredStopId = nextStopId;
      this.renderer.domElement.style.cursor = nextStopId ? 'pointer' : 'grab';
      if (nextStopId) {
        this.audio?.pulse('hover', nextStopId);
      }
      this.onHoverStop(nextStopId);
    }

    // Intersect 3D Rune Anchors for Easter Egg dwell detection
    const runeHits = this.raycaster.intersectObjects(this.runeMeshes, false);
    const nextRuneId = runeHits.length > 0 ? runeHits[0].object.userData.runeId : null;
    if (nextRuneId !== this.hoveredRuneId) {
      this.hoveredRuneId = nextRuneId;
      this.runeDwellMs = 0;
      if (!nextRuneId) {
        this.onRuneProgress(null, 0);
      }
    }
  }

  setViewMode(mode) {
    const valid = ['overview', 'rail', 'lineage'];
    const targetMode = valid.includes(mode) ? mode : 'overview';
    this.viewMode = targetMode;

    for (const station of this.stationList) {
      const target = station.layouts[targetMode] || station.layouts.overview;
      station.currentTargetPos.copy(target);
    }

    if (targetMode === 'overview') {
      this.focusedStopId = null;
      this.cameraRig.targetDistance = 62;
      this.cameraRig.targetPitch = 0.24;
      this.cameraRig.targetLookAt.set(0, 3.0, 0);
    } else if (targetMode === 'lineage') {
      this.focusedStopId = null;
      this.cameraRig.targetDistance = 68;
      this.cameraRig.targetPitch = 0.52;
      this.cameraRig.targetLookAt.set(0, 4.0, 0);
    } else if (targetMode === 'rail') {
      if (this.focusedStopId) {
        const st = this.stations.get(this.focusedStopId);
        if (st) this.targetSplineT = st.splineT;
      }
      this.focusedStopId = null;
    }

    setTimeout(() => this._rebuildRibbonGeometries(), 320);
    this.audio?.pulse('mode');
    return this.viewMode;
  }

  setFilter(category) {
    this.activeFilter = category || 'all';
    for (const station of this.stationList) {
      const match = this.activeFilter === 'all' || station.project.category === this.activeFilter;
      station.group.visible = match;
    }
    for (const r of this.ribbons) {
      const stA = this.stations.get(r.fromId);
      const stB = this.stations.get(r.toId);
      r.mesh.visible = Boolean(stA?.group.visible && stB?.group.visible);
    }
  }

  focusStop(stopId, notifyCallback = true) {
    const station = this.stations.get(stopId);
    if (!station) return false;

    this.focusedStopId = stopId;
    this.targetSplineT = station.splineT;

    const pos = station.currentTargetPos;
    const radialAngle = Math.atan2(pos.x, pos.z);
    this.cameraRig.targetYaw = radialAngle;
    this.cameraRig.targetPitch = 0.14;
    this.cameraRig.targetDistance = 14.5;
    this.cameraRig.targetLookAt.copy(pos).add(new THREE.Vector3(0, 0.8, 0));

    // Update Pneuma & Ferrofluid active Stop attractors
    if (this.pneumaMaterial) {
      this.pneumaMaterial.uniforms.uActiveStopPos.value.copy(pos);
      this.pneumaMaterial.uniforms.uHasActiveStop.value = 1.0;
    }
    if (this.ferrofluidMaterial) {
      this.ferrofluidMaterial.uniforms.uActiveStopPos.value.copy(pos);
      this.ferrofluidMaterial.uniforms.uHasActiveStop.value = 1.0;
      this.ferrofluidMaterial.uniforms.uActiveStopColor.value.set(station.project.accentColor);
    }

    // Highlight connected lineage ribbons
    for (const r of this.ribbons) {
      const connected = r.fromId === stopId || r.toId === stopId;
      r.mat.uniforms.uHighlight.value = connected ? 1.0 : 0.0;
    }

    this.audio?.pulse('select', stopId);
    this.audio?.setFocusedStop(stopId);
    this.anomaly?.recordStopActivation(stopId);

    if (notifyCallback) {
      this.onSelectStop(station.project);
    }
    return true;
  }

  clearFocus() {
    this.focusedStopId = null;
    if (this.pneumaMaterial) {
      this.pneumaMaterial.uniforms.uHasActiveStop.value = 0.0;
    }
    if (this.ferrofluidMaterial) {
      this.ferrofluidMaterial.uniforms.uHasActiveStop.value = 0.0;
    }
    for (const r of this.ribbons) {
      r.mat.uniforms.uHighlight.value = 0.0;
    }
    this.audio?.setFocusedStop(null);
    this.cameraRig.targetDistance = this.viewMode === 'lineage' ? 68 : 62;
    this.cameraRig.targetLookAt.set(0, 3.0, 0);
  }

  stepSpline(deltaT) {
    if (this.viewMode !== 'rail') {
      this.setViewMode('rail');
    }
    this.focusedStopId = null;
    this.targetSplineT = Math.max(0, Math.min(1, this.targetSplineT + deltaT));
  }

  setQuality(tierName) {
    const cfg = QUALITY_TIERS[tierName];
    if (!cfg) return this.qualityTier;
    this.qualityTier = cfg.id;

    const dpr = Math.min(window.devicePixelRatio || 1, cfg.dprCap);
    const w = this.container?.clientWidth || window.innerWidth || 1280;
    const h = this.container?.clientHeight || window.innerHeight || 720;
    this.renderer.setPixelRatio(dpr);
    this.renderer.setSize(w, h);
    this.composer?.setSize(w, h);
    if (this.pneumaPoints) {
      this.pneumaPoints.geometry.setDrawRange(0, cfg.particles);
      this.pneumaMaterial.uniforms.uPixelRatio.value = dpr;
    }
    if (this.bloomPass) this.bloomPass.enabled = cfg.bloom;
    if (this.cinematicPass) this.cinematicPass.enabled = cfg.cinematicPass;
    if (this.composer) {
      if (this.composer.renderTarget1) this.composer.renderTarget1.samples = cfg.msaa;
      if (this.composer.renderTarget2) this.composer.renderTarget2.samples = cfg.msaa;
    }
    return this.qualityTier;
  }

  _updateCamera(dt) {
    const damp = Math.min(1, dt * 5.2);

    if (this.viewMode === 'rail' && !this.focusedStopId && this.splineCurve) {
      this.splineT += (this.targetSplineT - this.splineT) * damp;
      const point = this.splineCurve.getPointAt(this.splineT);
      const lookAheadT = Math.min(1, this.splineT + 0.065);
      const ahead = this.splineCurve.getPointAt(lookAheadT);

      // Offset camera slightly outside the helix looking inward/ahead along the windrail
      const radialOut = new THREE.Vector3(point.x, 0, point.z).normalize();
      const desiredCamPos = point
        .clone()
        .addScaledVector(radialOut, 9.5)
        .add(new THREE.Vector3(0, 2.8, 0));

      this.camera.position.lerp(desiredCamPos, damp);
      this.cameraRig.lookAt.lerp(ahead, damp);
      this.camera.lookAt(this.cameraRig.lookAt);
    } else {
      // Choir Overview, Lineage Loom, or Focused Stop Dive
      if (!this.isDragging && !this.focusedStopId && !this.prefersReducedMotion) {
        this.cameraRig.targetYaw += dt * 0.045;
      }

      this.cameraRig.yaw += (this.cameraRig.targetYaw - this.cameraRig.yaw) * damp;
      this.cameraRig.pitch += (this.cameraRig.targetPitch - this.cameraRig.pitch) * damp;
      this.cameraRig.distance += (this.cameraRig.targetDistance - this.cameraRig.distance) * damp;
      this.cameraRig.lookAt.lerp(this.cameraRig.targetLookAt, damp);

      const cosP = Math.cos(this.cameraRig.pitch);
      const sinP = Math.sin(this.cameraRig.pitch);
      const desiredPos = new THREE.Vector3(
        this.cameraRig.lookAt.x + Math.sin(this.cameraRig.yaw) * cosP * this.cameraRig.distance,
        this.cameraRig.lookAt.y + sinP * this.cameraRig.distance,
        this.cameraRig.lookAt.z + Math.cos(this.cameraRig.yaw) * cosP * this.cameraRig.distance
      );

      this.camera.position.lerp(desiredPos, damp);
      this.camera.lookAt(this.cameraRig.lookAt);
    }

    // Compute camera velocity in m/s for audio & godray coupling
    const distMoved = this.camera.position.distanceTo(this.cameraRig.prevPosition);
    this.cameraRig.prevPosition.copy(this.camera.position);
    this.cameraRig.speedMps = dt > 0.0001 ? distMoved / dt : 0;
  }

  _updateRuneDwell(dt) {
    for (let i = 0; i < this.runeMeshes.length; i++) {
      const mesh = this.runeMeshes[i];
      mesh.rotation.y += dt * 0.9;
      mesh.rotation.x += dt * 0.45;
      const isHovered = mesh.userData.runeId === this.hoveredRuneId;
      const baseOpacity = 0.24 + (this.anomaly?.uniforms?.uAnomalyFactor?.value || 0) * 0.55;
      mesh.material.opacity = isHovered ? 0.92 : baseOpacity;
    }

    if (this.hoveredRuneId) {
      const mesh = this.runeMeshes.find((m) => m.userData.runeId === this.hoveredRuneId);
      const targetMs = mesh?.userData?.dwellMs || 1200;
      this.runeDwellMs += dt * 1000;
      const progress = Math.min(1, this.runeDwellMs / targetMs);
      this.onRuneProgress(this.hoveredRuneId, progress);

      if (this.runeDwellMs >= targetMs) {
        const triggeredId = this.hoveredRuneId;
        this.runeDwellMs = 0;
        this.hoveredRuneId = null;
        this.anomaly?.recordRuneRaycast(triggeredId);
        this.audio?.pulse('anomaly');
      }
    }
  }

  _tick(nowMs) {
    if (this._destroyed) return;
    const dt = Math.min(0.1, Math.max(0.001, (nowMs - this._lastFrameTime) / 1000));
    this._lastFrameTime = nowMs;
    const elapsed = this.anomaly.uniforms.uTime.value;

    this._updateCamera(dt);
    this.anomaly.tick(dt, this.cameraRig.speedMps);
    this.audio?.setCameraSpeed(this.cameraRig.speedMps);
    this.audio?.setAnomaly({
      factor: this.anomaly.uniforms.uAnomalyFactor.value,
      phase: this.anomaly.uniforms.uWorldPhase.value,
      glitch: this.anomaly.uniforms.uGlitchIntensity.value
    });

    // Animate central Windchest Lung & Crypt Reliquary
    if (!this.prefersReducedMotion) {
      const breath = 1 + 0.08 * Math.sin(elapsed * 1.8);
      this.windchestLung.scale.set(breath, 1 + 0.14 * Math.sin(elapsed * 1.8), breath);
      this.windchestHeart.rotation.y += dt * 0.85;
      for (let i = 0; i < this.windchestRings.length; i++) {
        const r = this.windchestRings[i];
        r.rotation.y += dt * (0.28 + i * 0.14) * (i % 2 === 0 ? 1 : -1);
        r.rotation.z += dt * 0.18;
      }
      this.cryptReliquaryMesh.rotation.y -= dt * 0.55;
      this.cryptReliquaryMesh.rotation.x += dt * 0.32;
    }

    // Update Ferrofluid & Pneuma uniforms
    if (this.ferrofluidMaterial) {
      this.ferrofluidMaterial.uniforms.uCursorWorld.value.copy(this.cursorWorld);
      this.ferrofluidMaterial.uniforms.uCursorForce.value = this.cursorForce;
      this.ferrofluidMaterial.uniforms.uCameraPos.value.copy(this.camera.position);
    }
    if (this.pneumaMaterial) {
      this.pneumaMaterial.uniforms.uCursorWorld.value.copy(this.cursorWorld);
      this.pneumaMaterial.uniforms.uCursorForce.value = this.cursorForce;
    }
    this.cursorForce *= 0.94;

    // Update all 11 kinetic Stop sculptures
    for (const station of this.stationList) {
      updateStationSculpture(
        station,
        elapsed,
        dt,
        this.anomaly.uniforms,
        this.hoveredStopId === station.id,
        this.focusedStopId === station.id,
        this.prefersReducedMotion
      );
    }

    this._updateRuneDwell(dt);

    // Project Vault Key Light to screen-space UV for Crepuscular God-Rays
    if (this.cinematicPass && this.cinematicPass.enabled) {
      const lightPos = this.vaultKeyLight.position.clone().project(this.camera);
      this.cinematicPass.uniforms.uLightScreenPos.value.x = Math.max(0.05, Math.min(0.95, (lightPos.x + 1) * 0.5));
      this.cinematicPass.uniforms.uLightScreenPos.value.y = Math.max(0.05, Math.min(0.95, (lightPos.y + 1) * 0.5));
    }

    if (this.composer) {
      // Always route through the composer: the tier MSAA render target now provides
      // scene antialiasing (canvas MSAA is disabled) and OutputPass tone-maps once.
      this.composer.render(dt);
    } else {
      this.renderer.render(this.scene, this.camera);
    }

    // FPS & Adaptive Quality Window
    this._frameCount += 1;
    this._fpsAccumSec += dt;
    if (this._fpsAccumSec >= 1.0) {
      this._currentFps = Math.round(this._frameCount / this._fpsAccumSec);
      this._frameCount = 0;
      this._fpsAccumSec = 0;

      // Automatic quality adaptation (downgrade-only to avoid oscillation):
      // if we sustain under 45 fps for two consecutive one-second windows, step
      // down high -> medium -> low. Users can still override via f.setQuality().
      if (this.qualityTier !== 'reduced') {
        this._slowWindows = this._currentFps < 45 ? this._slowWindows + 1 : 0;
        if (this._slowWindows >= 2) {
          this._slowWindows = 0;
          if (this.qualityTier === 'high') {
            this.setQuality('medium');
          } else if (this.qualityTier === 'medium') {
            this.setQuality('low');
          }
        }
      }

      this.onCameraTelemetry({
        fps: this._currentFps,
        mode: this.viewMode,
        quality: this.qualityTier,
        splineT: this.splineT,
        particles: QUALITY_TIERS[this.qualityTier].particles
      });
    }
  }

  destroy() {
    this._destroyed = true;
    if (this.renderer) {
      this.renderer.setAnimationLoop(null);
      const dom = this.renderer.domElement;
      dom.removeEventListener('pointerdown', this._onPointerDown);
      dom.removeEventListener('wheel', this._onWheel);
    }
    if (typeof window !== 'undefined') {
      window.removeEventListener('pointermove', this._onPointerMove);
      window.removeEventListener('pointerup', this._onPointerUp);
      window.removeEventListener('resize', this._onResize);
    }
    this.envTexture?.dispose?.();
    this.composer?.dispose?.();
    this.renderer?.dispose?.();
  }
}
