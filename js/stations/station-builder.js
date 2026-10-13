/**
 * USSYSITE4 // THE HELIX ORGANUM — BESPOKE 3D KINETIC SCULPTURES ("STOPS")
 *
 * Each of the 11 Mojomast repositories is authored as a kinetic architectural organ station
 * combining transmissive glass, brushed brass, emissive filaments, and repo-specific mechanics.
 * ZERO planets, ZERO space spheres.
 */

import * as THREE from 'three';

function createLabelSprite(project) {
  if (typeof document === 'undefined') return null;
  const canvas = document.createElement('canvas');
  canvas.width = 640;
  canvas.height = 176;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Pill background with brass & accent border
  ctx.fillStyle = 'rgba(9, 12, 18, 0.86)';
  ctx.beginPath();
  ctx.roundRect(24, 20, 592, 128, 18);
  ctx.fill();

  ctx.lineWidth = 2.5;
  ctx.strokeStyle = project.accentColor || '#3ee0d0';
  ctx.stroke();

  // Inner brass hairline
  ctx.lineWidth = 1;
  ctx.strokeStyle = 'rgba(212, 175, 55, 0.45)';
  ctx.beginPath();
  ctx.roundRect(30, 26, 580, 116, 14);
  ctx.stroke();

  // Roman Stop badge
  ctx.font = '700 20px "JetBrains Mono", monospace';
  ctx.fillStyle = project.accentColor || '#3ee0d0';
  ctx.textAlign = 'center';
  ctx.fillText(`STOP ${project.stopRoman} // ${project.category.toUpperCase()}`, 320, 58);

  // Project Name
  ctx.font = '700 36px "Space Grotesk", sans-serif';
  ctx.fillStyle = '#f8f5ee';
  ctx.fillText(project.name.toUpperCase(), 320, 102);

  // Subtitle / Stop Name
  ctx.font = '500 18px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = 'rgba(226, 218, 200, 0.82)';
  ctx.fillText(project.stopName, 320, 131);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;

  const mat = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    depthWrite: false,
    opacity: 0.92
  });
  const sprite = new THREE.Sprite(mat);
  sprite.scale.set(9.2, 2.5, 1);
  sprite.position.set(0, 6.2, 0);
  return sprite;
}

function createSharedMaterials(project, qualityTier = 'high') {
  const accent = new THREE.Color(project.accentColor || '#3ee0d0');
  const secondary = new THREE.Color(project.secondaryColor || '#f4b942');
  const useTransmission = qualityTier === 'high' || qualityTier === 'medium';

  const brass = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#c89d42'),
    metalness: 0.88,
    roughness: 0.22
  });

  const darkIron = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#141923'),
    metalness: 0.78,
    roughness: 0.34
  });

  const glass = useTransmission
    ? new THREE.MeshPhysicalMaterial({
        color: accent.clone().lerp(new THREE.Color('#ffffff'), 0.45),
        metalness: 0.05,
        roughness: 0.08,
        transmission: 0.88,
        thickness: 1.2,
        ior: 1.48,
        dispersion: 0.28,
        iridescence: 0.65,
        iridescenceIOR: 1.35,
        attenuationColor: accent,
        attenuationDistance: 3.5,
        transparent: true,
        opacity: 0.95
      })
    : new THREE.MeshStandardMaterial({
        color: accent,
        metalness: 0.35,
        roughness: 0.18,
        transparent: true,
        opacity: 0.72
      });

  const emissivePrimary = new THREE.MeshStandardMaterial({
    color: accent,
    emissive: accent,
    emissiveIntensity: 1.85,
    metalness: 0.2,
    roughness: 0.2
  });

  const emissiveSecondary = new THREE.MeshStandardMaterial({
    color: secondary,
    emissive: secondary,
    emissiveIntensity: 1.55,
    metalness: 0.25,
    roughness: 0.25
  });

  return { accent, secondary, brass, darkIron, glass, emissivePrimary, emissiveSecondary };
}

function buildOrganPedestal(group, mats) {
  // Base hexagonal plinth + 4 vertical organ resonance pipes
  const plinth = new THREE.Mesh(new THREE.CylinderGeometry(2.7, 3.2, 0.55, 6), mats.darkIron);
  plinth.position.y = -2.8;
  group.add(plinth);

  const brassCollar = new THREE.Mesh(new THREE.TorusGeometry(2.75, 0.11, 12, 36), mats.brass);
  brassCollar.rotation.x = Math.PI / 2;
  brassCollar.position.y = -2.52;
  group.add(brassCollar);

  const glowRing = new THREE.Mesh(new THREE.TorusGeometry(2.35, 0.06, 10, 48), mats.emissivePrimary);
  glowRing.rotation.x = Math.PI / 2;
  glowRing.position.y = -2.45;
  group.add(glowRing);

  // 4 organ pipes rising behind the sculpture
  const pipeHeights = [3.6, 4.8, 4.8, 3.6];
  const pipeX = [-1.65, -0.58, 0.58, 1.65];
  for (let i = 0; i < 4; i++) {
    const h = pipeHeights[i];
    const pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.2, h, 14), mats.brass);
    pipe.position.set(pipeX[i], -2.5 + h * 0.5, -1.85);
    group.add(pipe);

    const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.21, 0.21, 0.18, 14), mats.emissiveSecondary);
    cap.position.set(pipeX[i], -2.5 + h + 0.1, -1.85);
    group.add(cap);
  }

  return { glowRing, brassCollar };
}

/**
 * Builds the bespoke kinetic sculpture corresponding to `project.sculptureArchetype`
 */
function buildArchetypeGeometry(project, root, mats, kinetic) {
  const archetype = project.sculptureArchetype;

  switch (archetype) {
    case 'caduceus-rings': {
      // OrbitDesktop: Central Hermes Caduceus staff + 3 concentric tiling window pane rings + tmux torus
      const staff = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 5.4, 16), mats.brass);
      staff.position.y = 0.4;
      root.add(staff);

      const apexOrb = new THREE.Mesh(new THREE.OctahedronGeometry(0.52, 1), mats.emissiveSecondary);
      apexOrb.position.y = 3.25;
      root.add(apexOrb);
      kinetic.spinY.push({ mesh: apexOrb, speed: 1.6 });

      // Twin helical snakes around staff
      for (let s = 0; s < 2; s++) {
        const pts = [];
        for (let i = 0; i <= 28; i++) {
          const t = i / 28;
          const a = t * Math.PI * 3.5 + s * Math.PI;
          pts.push(new THREE.Vector3(Math.cos(a) * 0.55, -1.8 + t * 4.4, Math.sin(a) * 0.55));
        }
        const curve = new THREE.CatmullRomCurve3(pts);
        const tube = new THREE.Mesh(
          new THREE.TubeGeometry(curve, 36, 0.065, 8, false),
          s === 0 ? mats.emissivePrimary : mats.emissiveSecondary
        );
        root.add(tube);
      }

      // Orbiting spatial desktop window panes
      const windowCarousel = new THREE.Group();
      windowCarousel.position.y = 0.5;
      const paneCount = 6;
      for (let i = 0; i < paneCount; i++) {
        const angle = (i / paneCount) * Math.PI * 2;
        const r = 2.15;
        const paneGroup = new THREE.Group();
        paneGroup.position.set(Math.cos(angle) * r, (i % 2 === 0 ? 0.35 : -0.35), Math.sin(angle) * r);
        paneGroup.lookAt(0, paneGroup.position.y, 0);

        const glassPane = new THREE.Mesh(new THREE.BoxGeometry(1.25, 0.82, 0.06), mats.glass);
        const headerBar = new THREE.Mesh(new THREE.BoxGeometry(1.27, 0.14, 0.08), mats.emissivePrimary);
        headerBar.position.y = 0.36;
        paneGroup.add(glassPane, headerBar);
        windowCarousel.add(paneGroup);
      }
      root.add(windowCarousel);
      kinetic.spinY.push({ mesh: windowCarousel, speed: 0.45 });

      const tmuxTorus = new THREE.Mesh(new THREE.TorusGeometry(1.55, 0.09, 14, 48), mats.emissivePrimary);
      tmuxTorus.rotation.x = Math.PI * 0.38;
      tmuxTorus.position.y = 0.5;
      root.add(tmuxTorus);
      kinetic.gyro.push({ mesh: tmuxTorus, speedX: 0.7, speedZ: 0.5 });
      break;
    }

    case 'velvet-reliquary': {
      // VelvetRP: Suspended d20 icosahedron + d12 dodecahedron + 11-stage worldbuilder ring + GM tablet
      const tableSlab = new THREE.Mesh(new THREE.CylinderGeometry(2.1, 2.3, 0.28, 12), mats.darkIron);
      tableSlab.position.y = -1.1;
      root.add(tableSlab);

      const d20 = new THREE.Mesh(new THREE.IcosahedronGeometry(1.12, 0), mats.glass);
      d20.position.y = 0.85;
      const d20Wire = new THREE.LineSegments(
        new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(1.14, 0)),
        new THREE.LineBasicMaterial({ color: mats.accent })
      );
      d20.add(d20Wire);
      root.add(d20);
      kinetic.gyro.push({ mesh: d20, speedX: 0.85, speedZ: 0.62 });

      const d12Core = new THREE.Mesh(new THREE.DodecahedronGeometry(0.55, 0), mats.emissiveSecondary);
      d12Core.position.y = 0.85;
      root.add(d12Core);
      kinetic.gyro.push({ mesh: d12Core, speedX: -1.3, speedZ: 1.1 });

      // 11-Stage Worldbuilder Ring
      const stageRing = new THREE.Group();
      stageRing.position.y = 0.85;
      for (let i = 0; i < 11; i++) {
        const a = (i / 11) * Math.PI * 2;
        constpip = new THREE.Mesh(
          new THREE.OctahedronGeometry(0.18, 0),
          i % 2 === 0 ? mats.emissivePrimary : mats.brass
        );
        constpip.position.set(Math.cos(a) * 2.1, Math.sin(a * 2) * 0.25, Math.sin(a) * 2.1);
        stageRing.add(constpip);
      }
      root.add(stageRing);
      kinetic.spinY.push({ mesh: stageRing, speed: -0.55 });
      break;
    }

    case 'harmonic-clock': {
      // JamMate: 3 Glowing NAM Vacuum Tubes + Musical Clock Pendulum + Waveform Helix
      const ampChassis = new THREE.Mesh(new THREE.BoxGeometry(3.1, 0.7, 1.8), mats.darkIron);
      ampChassis.position.y = -1.25;
      root.add(ampChassis);

      for (let i = -1; i <= 1; i++) {
        const tubeGroup = new THREE.Group();
        tubeGroup.position.set(i * 0.95, 0.15, 0);

        const envelope = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.34, 1.9, 20), mats.glass);
        const dome = new THREE.Mesh(new THREE.SphereGeometry(0.34, 18, 12), mats.glass);
        dome.position.y = 0.95;

        const filament = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.15, 1.35, 10), mats.emissivePrimary);
        const plate = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.3, 12), mats.brass);
        plate.position.y = -0.75;

        tubeGroup.add(envelope, dome, filament, plate);
        root.add(tubeGroup);
        kinetic.pulse.push({ mesh: filament, phase: i * 1.1 });
      }

      // Musical Clock Ring & Metronome Arm
      const clockRing = new THREE.Mesh(new THREE.TorusGeometry(2.15, 0.08, 12, 48), mats.brass);
      clockRing.position.set(0, 0.95, -0.55);
      root.add(clockRing);

      const pendulumPivot = new THREE.Group();
      pendulumPivot.position.set(0, 2.8, -0.45);
      const arm = new THREE.Mesh(new THREE.BoxGeometry(0.09, 2.8, 0.09), mats.emissiveSecondary);
      arm.position.y = -1.4;
      const bob = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.16, 20), mats.emissivePrimary);
      bob.rotation.x = Math.PI / 2;
      bob.position.y = -2.35;
      pendulumPivot.add(arm, bob);
      root.add(pendulumPivot);
      kinetic.pendulum.push({ mesh: pendulumPivot, freq: 2.2, amp: 0.48 });
      break;
    }

    case 'prism-colosseum': {
      // COCS: 60Hz Tiered Neon Colosseum + 9 Orbiting AI Operator Monoliths + Prism Core
      for (let tier = 0; tier < 3; tier++) {
        const ring = new THREE.Mesh(
          new THREE.TorusGeometry(1.55 + tier * 0.42, 0.09, 10, 9),
          tier === 1 ? mats.emissiveSecondary : mats.brass
        );
        ring.rotation.x = Math.PI / 2;
        ring.position.y = -0.9 + tier * 0.85;
        root.add(ring);
        kinetic.spinY.push({ mesh: ring, speed: (tier % 2 === 0 ? 1 : -1) * (0.4 + tier * 0.2) });
      }

      const prismCore = new THREE.Mesh(new THREE.OctahedronGeometry(0.95, 0), mats.glass);
      prismCore.position.y = 0.85;
      const innerPulse = new THREE.Mesh(new THREE.OctahedronGeometry(0.52, 0), mats.emissivePrimary);
      prismCore.add(innerPulse);
      root.add(prismCore);
      kinetic.gyro.push({ mesh: prismCore, speedX: 1.1, speedZ: 0.9 });

      const operatorsGroup = new THREE.Group();
      operatorsGroup.position.y = 0.85;
      for (let i = 0; i < 9; i++) {
        const a = (i / 9) * Math.PI * 2;
        const opMesh = new THREE.Mesh(
          new THREE.BoxGeometry(0.24, 0.72, 0.24),
          i % 2 === 0 ? mats.emissivePrimary : mats.emissiveSecondary
        );
        opMesh.position.set(Math.cos(a) * 2.25, Math.sin(a * 3) * 0.2, Math.sin(a) * 2.25);
        opMesh.lookAt(0, 0, 0);
        operatorsGroup.add(opMesh);
      }
      root.add(operatorsGroup);
      kinetic.spinY.push({ mesh: operatorsGroup, speed: 0.75 });
      break;
    }

    case 'chariot-frame': {
      // COCS-Godot: Native Viewport Frame Cage + Twin-Linked Authoritative Simulation Cores
      const viewportFrame = new THREE.Mesh(
        new THREE.BoxGeometry(2.6, 2.6, 2.6),
        new THREE.MeshStandardMaterial({
          color: mats.accent,
          metalness: 0.85,
          roughness: 0.2,
          wireframe: true
        })
      );
      viewportFrame.position.y = 0.85;
      root.add(viewportFrame);
      kinetic.gyro.push({ mesh: viewportFrame, speedX: 0.35, speedZ: 0.45 });

      // Dual presentation + authority cores inside the frame
      const dualPivot = new THREE.Group();
      dualPivot.position.y = 0.85;
      const godotSphere = new THREE.Mesh(new THREE.IcosahedronGeometry(0.62, 1), mats.emissivePrimary);
      godotSphere.position.x = -0.68;
      const nodeAuthority = new THREE.Mesh(new THREE.OctahedronGeometry(0.62, 0), mats.emissiveSecondary);
      nodeAuthority.position.x = 0.68;
      const bridgeBeam = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 1.36, 12), mats.brass);
      bridgeBeam.rotation.z = Math.PI / 2;
      dualPivot.add(godotSphere, nodeAuthority, bridgeBeam);
      root.add(dualPivot);
      kinetic.spinY.push({ mesh: dualPivot, speed: 1.4 });
      break;
    }

    case 'token-switchboard': {
      // RouteTok: 3 Kinetic Circuit-Breaker Blades (AUTO/BEST/FREE) + 4-Orb Glass Fieldbook
      const busBar = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.24, 1.2), mats.brass);
      busBar.position.y = -0.95;
      root.add(busBar);

      for (let i = -1; i <= 1; i++) {
        const bladePivot = new THREE.Group();
        bladePivot.position.set(i * 0.85, -0.8, 0);
        const blade = new THREE.Mesh(
          new THREE.BoxGeometry(0.22, 2.1, 0.38),
          i === 0 ? mats.emissivePrimary : mats.glass
        );
        blade.position.y = 1.05;
        const tip = new THREE.Mesh(new THREE.SphereGeometry(0.22, 14, 14), mats.emissiveSecondary);
        tip.position.y = 2.15;
        bladePivot.add(blade, tip);
        root.add(bladePivot);
        kinetic.pendulum.push({ mesh: bladePivot, freq: 1.5 + i * 0.35, amp: 0.32, axis: 'x' });
      }

      // 4-Lane Compare Fieldbook Orbs
      const fieldbook = new THREE.Group();
      fieldbook.position.y = 2.1;
      for (let i = 0; i < 4; i++) {
        const a = (i / 4) * Math.PI * 2;
        const orb = new THREE.Mesh(
          new THREE.SphereGeometry(0.32, 18, 18),
          i % 2 === 0 ? mats.emissivePrimary : mats.emissiveSecondary
        );
        orb.position.set(Math.cos(a) * 1.35, 0, Math.sin(a) * 1.35);
        fieldbook.add(orb);
      }
      root.add(fieldbook);
      kinetic.spinY.push({ mesh: fieldbook, speed: 0.95 });
      break;
    }

    case 'annunciator-shield': {
      // RGBAgentFlightIndicator: Curved 12-Keycap Annunciator Panel (Green in flight, White complete, Red blink)
      const panelGroup = new THREE.Group();
      panelGroup.position.y = 0.75;
      panelGroup.rotation.x = -0.28;

      const backplate = new THREE.Mesh(new THREE.BoxGeometry(3.2, 2.2, 0.22), mats.darkIron);
      panelGroup.add(backplate);

      const greenMat = new THREE.MeshStandardMaterial({
        color: '#22c55e',
        emissive: '#22c55e',
        emissiveIntensity: 1.9,
        roughness: 0.2
      });
      const whiteMat = new THREE.MeshStandardMaterial({
        color: '#f8fafc',
        emissive: '#e2e8f0',
        emissiveIntensity: 1.5,
        roughness: 0.2
      });
      const redMat = new THREE.MeshStandardMaterial({
        color: '#ef4444',
        emissive: '#ef4444',
        emissiveIntensity: 2.2,
        roughness: 0.2
      });

      // 4x3 = 12 physical keycap lanes
      for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 4; col++) {
          const idx = row * 4 + col;
          const mat = idx === 2 || idx === 9 ? redMat.clone() : idx % 3 === 0 ? whiteMat : greenMat;
          const cap = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.52, 0.34), mat);
          cap.position.set((col - 1.5) * 0.72, (row - 1) * 0.64, 0.24);
          panelGroup.add(cap);
          kinetic.keycaps.push({ mesh: cap, index: idx, isAlert: idx === 2 || idx === 9 });
        }
      }

      root.add(panelGroup);
      kinetic.floatGroup.push(panelGroup);
      break;
    }

    case 'moth-lighttable': {
      // MothBake: Articulated Iridescent Moth Wings beating over a 3x3 Tiled Light-Table
      const table = new THREE.Group();
      table.position.y = -0.95;
      for (let r = -1; r <= 1; r++) {
        for (let c = -1; c <= 1; c++) {
          const tile = new THREE.Mesh(
            new THREE.BoxGeometry(0.68, 0.14, 0.68),
            (r + c) % 2 === 0 ? mats.emissivePrimary : mats.glass
          );
          tile.position.set(c * 0.76, 0, r * 0.76);
          table.add(tile);
        }
      }
      root.add(table);

      const mothBody = new THREE.Group();
      mothBody.position.y = 1.15;
      const thorax = new THREE.Mesh(new THREE.CapsuleGeometry(0.24, 1.35, 8, 16), mats.brass);
      thorax.rotation.x = Math.PI * 0.35;
      mothBody.add(thorax);

      const leftWingPivot = new THREE.Group();
      const leftWing = new THREE.Mesh(new THREE.BoxGeometry(1.75, 0.08, 1.35), mats.glass);
      leftWing.position.x = -0.95;
      const leftTrim = new THREE.Mesh(new THREE.BoxGeometry(1.78, 0.1, 0.14), mats.emissiveSecondary);
      leftTrim.position.set(-0.95, 0, 0.65);
      leftWingPivot.add(leftWing, leftTrim);

      const rightWingPivot = new THREE.Group();
      const rightWing = new THREE.Mesh(new THREE.BoxGeometry(1.75, 0.08, 1.35), mats.glass);
      rightWing.position.x = 0.95;
      const rightTrim = new THREE.Mesh(new THREE.BoxGeometry(1.78, 0.1, 0.14), mats.emissiveSecondary);
      rightTrim.position.set(0.95, 0, 0.65);
      rightWingPivot.add(rightWing, rightTrim);

      mothBody.add(leftWingPivot, rightWingPivot);
      root.add(mothBody);
      kinetic.wings.push({ left: leftWingPivot, right: rightWingPivot, freq: 2.6, amp: 0.52 });
      break;
    }

    case 'copper-engine': {
      // Warpi: Local Pi Silicon Die inside a Copper/Rust Containment Cage + 7 Brokered Tool Pistons
      const coreDie = new THREE.Mesh(new THREE.BoxGeometry(1.05, 1.05, 1.05), mats.emissivePrimary);
      coreDie.position.y = 0.85;
      root.add(coreDie);
      kinetic.gyro.push({ mesh: coreDie, speedX: 0.6, speedZ: 0.8 });

      const cageRing1 = new THREE.Mesh(new THREE.TorusGeometry(1.85, 0.12, 12, 36), mats.brass);
      cageRing1.position.y = 0.85;
      const cageRing2 = new THREE.Mesh(new THREE.TorusGeometry(1.85, 0.12, 12, 36), mats.emissiveSecondary);
      cageRing2.position.y = 0.85;
      cageRing2.rotation.y = Math.PI / 2;
      root.add(cageRing1, cageRing2);
      kinetic.spinY.push({ mesh: cageRing1, speed: 0.5 });
      kinetic.spinY.push({ mesh: cageRing2, speed: -0.65 });

      // 7 Brokered Tool Pistons (bash, bash_output, read, write, edit, glob, grep)
      const pistonGroup = new THREE.Group();
      pistonGroup.position.y = 0.85;
      for (let i = 0; i < 7; i++) {
        const a = (i / 7) * Math.PI * 2;
        const piston = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.95, 12), mats.glass);
        piston.position.set(Math.cos(a) * 1.85, 0, Math.sin(a) * 1.85);
        piston.rotation.z = Math.PI / 2;
        piston.rotation.y = -a;
        pistonGroup.add(piston);
        kinetic.pistons.push({ mesh: piston, angle: a, baseR: 1.75, phase: i * 0.9 });
      }
      root.add(pistonGroup);
      break;
    }

    case 'winged-lectern': {
      // HermesDashboard: Winged Operations Mast + 3D Session Topology Constellation
      const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.24, 4.6, 16), mats.brass);
      mast.position.y = 0.35;
      root.add(mast);

      // Twin Swept Hermes Wings
      for (const dir of [-1, 1]) {
        const wing = new THREE.Group();
        wing.position.set(0, 1.65, 0);
        for (let f = 0; f < 4; f++) {
          const feather = new THREE.Mesh(
            new THREE.BoxGeometry(1.35 - f * 0.2, 0.16, 0.12),
            f % 2 === 0 ? mats.emissivePrimary : mats.glass
          );
          feather.position.set(dir * (0.85 + f * 0.22), f * 0.26, 0);
          feather.rotation.z = dir * (0.28 + f * 0.12);
          wing.add(feather);
        }
        root.add(wing);
      }

      // Session Topology Graph Ring
      const graphGroup = new THREE.Group();
      graphGroup.position.y = 0.65;
      const nodePositions = [];
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        const pos = new THREE.Vector3(Math.cos(a) * 1.9, Math.sin(a * 2) * 0.55, Math.sin(a) * 1.9);
        nodePositions.push(pos);
        const node = new THREE.Mesh(new THREE.SphereGeometry(0.2, 14, 14), mats.emissiveSecondary);
        node.position.copy(pos);
        graphGroup.add(node);
      }
      const lineGeo = new THREE.BufferGeometry().setFromPoints([...nodePositions, nodePositions[0]]);
      const lineLoop = new THREE.Line(lineGeo, new THREE.LineBasicMaterial({ color: mats.accent }));
      graphGroup.add(lineLoop);
      root.add(graphGroup);
      kinetic.spinY.push({ mesh: graphGroup, speed: 0.62 });
      break;
    }

    case 'kintsugi-seal':
    default: {
      // Becomussy: 4 Stacked Glass Self-Model Facets joined by Kintsugi Gold Seams + 5-Layer Memory Rosary
      const facetStack = new THREE.Group();
      facetStack.position.y = 0.65;

      for (let i = 0; i < 4; i++) {
        const y = -0.9 + i * 0.72;
        const slab = new THREE.Mesh(new THREE.CylinderGeometry(1.45 - i * 0.14, 1.55 - i * 0.14, 0.34, 6), mats.glass);
        slab.position.y = y;

        // Kintsugi gold seam ring between facets
        const kintsugiSeam = new THREE.Mesh(
          new THREE.TorusGeometry(1.48 - i * 0.14, 0.055, 10, 6),
          mats.emissivePrimary
        );
        kintsugiSeam.rotation.x = Math.PI / 2;
        kintsugiSeam.position.y = y + 0.18;

        facetStack.add(slab, kintsugiSeam);
        kinetic.spinY.push({ mesh: slab, speed: (i % 2 === 0 ? 1 : -1) * 0.28 });
      }

      // Steward Wax Seal Crown at top
      const sealCrown = new THREE.Mesh(new THREE.OctahedronGeometry(0.48, 0), mats.emissiveSecondary);
      sealCrown.position.y = 1.95;
      facetStack.add(sealCrown);
      kinetic.spinY.push({ mesh: sealCrown, speed: 1.25 });
      root.add(facetStack);

      // 5-Layer Memory Bead Rosary
      const rosary = new THREE.Group();
      rosary.position.y = 0.75;
      rosary.rotation.z = 0.38;
      for (let i = 0; i < 15; i++) {
        const a = (i / 15) * Math.PI * 2;
        const bead = new THREE.Mesh(
          new THREE.SphereGeometry(i % 3 === 0 ? 0.19 : 0.12, 12, 12),
          i % 3 === 0 ? mats.emissivePrimary : mats.brass
        );
        bead.position.set(Math.cos(a) * 2.2, 0, Math.sin(a) * 2.2);
        rosary.add(bead);
      }
      root.add(rosary);
      kinetic.gyro.push({ mesh: rosary, speedX: 0.45, speedZ: 0.35 });
      break;
    }
  }
}

export function createProjectStation(project, index, totalStops, anchorPos, splineT, qualityTier = 'high') {
  const group = new THREE.Group();
  group.name = `stop-${project.id}`;
  group.position.copy(anchorPos);

  const mats = createSharedMaterials(project, qualityTier);
  const { glowRing, brassCollar } = buildOrganPedestal(group, mats);

  const sculptureRoot = new THREE.Group();
  group.add(sculptureRoot);

  const kinetic = {
    spinY: [],
    gyro: [],
    pulse: [],
    pendulum: [],
    wings: [],
    pistons: [],
    keycaps: [],
    floatGroup: []
  };

  buildArchetypeGeometry(project, sculptureRoot, mats, kinetic);

  // Invisible generous raycast collider sphere for smooth hover & click selection
  const hitTarget = new THREE.Mesh(
    new THREE.SphereGeometry(3.6, 16, 12),
    new THREE.MeshBasicMaterial({ visible: false })
  );
  hitTarget.position.y = 0.6;
  hitTarget.userData = {
    isStopCollider: true,
    stopId: project.id,
    stopIndex: index
  };
  group.add(hitTarget);

  const labelSprite = createLabelSprite(project);
  if (labelSprite) {
    group.add(labelSprite);
  }

  return {
    id: project.id,
    index,
    project,
    group,
    sculptureRoot,
    hitTarget,
    labelSprite,
    glowRing,
    brassCollar,
    mats,
    kinetic,
    splineT,
    anchor: anchorPos.clone(),
    currentTargetPos: anchorPos.clone(),
    layouts: {
      overview: anchorPos.clone(),
      rail: anchorPos.clone(),
      lineage: anchorPos.clone()
    },
    hoverScale: 1
  };
}

export function updateStationSculpture(station, elapsed, dt, worldUniforms, isHovered, isFocused, reducedMotion = false) {
  // Smoothly interpolate position between active layout modes
  station.group.position.lerp(station.currentTargetPos, Math.min(1, dt * 4.5));

  const targetScale = isFocused ? 1.18 : isHovered ? 1.1 : 1.0;
  station.hoverScale += (targetScale - station.hoverScale) * Math.min(1, dt * 8.0);
  station.sculptureRoot.scale.setScalar(station.hoverScale);

  const anomalyBoost = 1 + (worldUniforms?.uAnomalyFactor?.value || 0) * 1.6;
  const glitch = worldUniforms?.uGlitchIntensity?.value || 0;

  // Pedestal ring intensity
  const targetEmissive = isFocused ? 3.2 : isHovered ? 2.5 : 1.65;
  station.mats.emissivePrimary.emissiveIntensity = targetEmissive + glitch * 1.4;

  if (reducedMotion) return;

  // Gentle breathing float on the sculpture root
  station.sculptureRoot.position.y = Math.sin(elapsed * 1.5 + station.index * 0.7) * 0.18;

  const k = station.kinetic;
  for (const item of k.spinY) {
    item.mesh.rotation.y += dt * item.speed * anomalyBoost;
  }
  for (const item of k.gyro) {
    item.mesh.rotation.x += dt * item.speedX * anomalyBoost;
    item.mesh.rotation.z += dt * item.speedZ * anomalyBoost;
  }
  for (const item of k.pulse) {
    const s = 0.88 + 0.24 * Math.sin(elapsed * 3.8 + item.phase);
    item.mesh.scale.set(1, s, 1);
  }
  for (const item of k.pendulum) {
    const angle = Math.sin(elapsed * item.freq) * item.amp;
    if (item.axis === 'x') {
      item.mesh.rotation.x = angle;
    } else {
      item.mesh.rotation.z = angle;
    }
  }
  for (const item of k.wings) {
    const flap = Math.sin(elapsed * item.freq) * item.amp;
    item.left.rotation.z = flap;
    item.right.rotation.z = -flap;
  }
  for (const item of k.pistons) {
    const stroke = item.baseR + Math.sin(elapsed * 3.6 + item.phase) * 0.35;
    item.mesh.position.x = Math.cos(item.angle) * stroke;
    item.mesh.position.z = Math.sin(item.angle) * stroke;
  }
  for (const item of k.keycaps) {
    const press = Math.max(0, Math.sin(elapsed * 3.2 + item.index * 0.85)) * 0.08;
    item.mesh.position.z = 0.24 - press;
    if (item.isAlert) {
      const blink = Math.sin(elapsed * 7.5 + item.index) > 0 ? 2.8 : 0.35;
      item.mesh.material.emissiveIntensity = blink;
    }
  }
}
