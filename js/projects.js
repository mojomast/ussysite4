/**
 * USSYSITE4 // THE HELIX ORGANUM
 * Canonical Catalog of the 11 Mojomast Software Stops
 *
 * Dual-exported as ES Module (`USSY_PROJECTS`, `USSY_CATEGORIES`, `ORGANUM_CHORDS`)
 * and attached to `window` when running in a browser context.
 */

export const USSY_CATEGORIES = {
  workspace: {
    id: 'workspace',
    title: 'Agent Workspaces & Terminals',
    shortTitle: 'Workspaces',
    color: '#3ee0d0',
    secondary: '#d4af37',
    description: 'Local-first agent desktops, standalone Rust/Pi terminal harnesses, and live Hermes supervision consoles.'
  },
  ai: {
    id: 'ai',
    title: 'Roleplay & Governed Continuity',
    shortTitle: 'AI & Continuity',
    color: '#f4b942',
    secondary: '#c084fc',
    description: 'Server-authoritative tabletop RPG engines and steward-governed agent self-models with semantic diffing.'
  },
  creative: {
    id: 'creative',
    title: 'Audio DSP & Arena Engines',
    shortTitle: 'DSP & Engines',
    color: '#fb7185',
    secondary: '#2dd4bf',
    description: 'Lock-free JUCE neural guitar rigs, deterministic 60 Hz Three.js arena shooters, and native Godot 4 ports.'
  },
  infra: {
    id: 'infra',
    title: 'Routing, Bake & Telemetry',
    shortTitle: 'Infra & Hardware',
    color: '#38bdf8',
    secondary: '#22c55e',
    description: 'Zero-dependency LLM token routers, deterministic asset-baking pipelines, and physical RGB keyboard annunciators.'
  }
};

export const USSY_PROJECTS = [
  {
    id: 'orbitdesktop',
    name: 'OrbitDesktop',
    stopRoman: 'I',
    stopName: 'The Caduceus Workspace Rings',
    sculptureArchetype: 'caduceus-rings',
    tagline: 'An agent-shaped browser desktop powered by Hermes where tools are built, tiled, and evolved around you.',
    description: 'OrbitDesktop is a local-first, single-owner browser workspace combining a Node.js host with a Vite/TypeScript spatial desktop. It treats Hermes agent chats, tmux-backed host terminals, content-addressed sandboxed HTML plugins, and containerized Xpra Linux apps as panes in one unified environment with preview-mutate-receipt checkpoints.',
    category: 'workspace',
    accentColor: '#3ee0d0',
    secondaryColor: '#f4b942',
    chord: {
      name: 'Cmaj9',
      rootHz: 261.63,
      notesHz: [261.63, 329.63, 392.00, 493.88, 587.33]
    },
    tags: ['Featured', 'Hermes', 'TypeScript', 'Three.js CSS3D', 'tmux', 'DuckDB-Wasm', 'SQLite-Vec', 'Desktop'],
    github: 'https://github.com/mojomast/orbitdesktop',
    demo: '',
    status: 'Active',
    connections: ['hermesdashboard', 'warpi', 'becomussy', 'rgbagentflightindicator'],
    specs: {
      'Primary Stack': 'TypeScript / Node 22.12+ / Python',
      'Window Engine': 'Dockview Tiling + Three.js CSS3D',
      'Knowledge & Data': 'SQLite FTS5 + sqlite-vec + DuckDB-Wasm',
      'Terminal & Apps': 'xterm.js + node-pty + tmux + Xpra Linux'
    },
    features: [
      'Typed orbit_workspace controller with preview -> mutate -> receipt and checkpoint rollback',
      'Content-addressed sandboxed HTML plugin lifecycle with GitHub-pinned catalog',
      'Hybrid local search (FTS5 + sqlite-vec MiniLM embeddings) and embedded DuckDB data lab',
      'Experimental Comet Project Workbench with isolated git candidate testing and human review'
    ],
    telemetry: '[ORBIT_HOST] Loopback workspace bound on 127.0.0.1 // rev-check: ARMED\n[HERMES_PLUGIN] Registered orbit_workspace, orbit_resources, orbit_workbench\n[TMUX_PTY] Attached persistent session orbit:0.0 (xterm-256color)\n[SQLITE_VEC] Indexed 1,420 workspace chunks (384-dim MiniLM) // READY'
  },
  {
    id: 'velvetrp',
    name: 'VelvetRP',
    stopRoman: 'II',
    stopName: 'The Velvet Director Reliquary',
    sculptureArchetype: 'velvet-reliquary',
    tagline: 'Local-first AI roleplay and campaign RPG where the model proposes and the server owns what became true.',
    description: 'VelvetRP is a TypeScript monorepo pairing a React Adventure Table with a Fastify + SQLite authoritative rules server across 177 RPG operations. While the LLM narrates scenes, the server commits atomic dice rolls, tactical combat grids, travel, commerce, and non-omniscient NPC gossip with immutable receipts.',
    category: 'ai',
    accentColor: '#e4c37a',
    secondaryColor: '#b91c4c',
    chord: {
      name: 'Gadd9',
      rootHz: 196.00,
      notesHz: [196.00, 246.94, 293.66, 392.00, 440.00]
    },
    tags: ['Featured', 'TypeScript', 'Fastify', 'SQLite WAL', 'React 18', 'SRD 5.1', 'RPG Engine', 'Zod'],
    github: 'https://github.com/mojomast/velvetrp',
    demo: '',
    status: 'Active',
    connections: ['routetok', 'becomussy', 'orbitdesktop'],
    specs: {
      'Architecture': 'TypeScript Monorepo (Client / Fastify / Contracts)',
      'Rule Authority': '177 Atomic Server Operations + SRD 5.1 Catalog',
      'World Builder': '11-Stage Pipeline across 14 Content Sections',
      'State Persistence': 'better-sqlite3 WAL + Immutable Content Packs'
    },
    features: [
      '11-stage deterministic world builder with coverage checks and interrupted-build recovery',
      'Server-owned dice, tactical grids (fog, cover, reactions), travel, and inventory ledger',
      'Epistemic NPC memory modeling witnessed events, told rumors, and regional gossip',
      'Three Director modes: Human DM, Reviewed AI Proposals, or Delegated Scene Direction'
    ],
    telemetry: '[VELVET_SRV] Fastify authority online // SRD-5.1:starter@1.7.0 pinned\n[WORLDBUILD] Stage 11/11 verified: 14 lore & faction sections sealed\n[DIRECTOR] Proposal #409 received -> Dice Roll 1d20+6 = 19 (COMMITTED)\n[EPISTEMIC] Propagating witnessed combat receipt to 4 local NPC graphs'
  },
  {
    id: 'jammate',
    name: 'JamMate',
    stopRoman: 'III',
    stopName: 'The Vacuum-Tube Harmonic Clock',
    sculptureArchetype: 'harmonic-clock',
    tagline: 'Offline-first guitar practice and creative jamming built with JUCE, Neural Amp Modeler, and an adaptive rhythm clock.',
    description: 'JamMate pairs a full Standalone/VST3 Neural Amp Modeler (NAM Core v0.5.4) guitar rig with a lock-free real-time rhythm analysis pipeline. Guitar input flows through a bounded lock-free audio ring into an asynchronous beat-tracking worker, driving a bar-quantized Musical Clock and adaptive Jam Director drum engine without ever blocking audio monitoring.',
    category: 'creative',
    accentColor: '#ffb347',
    secondaryColor: '#2ec4b6',
    chord: {
      name: 'Emaj9',
      rootHz: 164.81,
      notesHz: [164.81, 207.65, 246.94, 309.23, 369.99]
    },
    tags: ['Featured', 'C++', 'JUCE', 'Neural Amp Modeler', 'Audio DSP', 'VST3', 'Real-Time', 'Eigen'],
    github: 'https://github.com/mojomast/jammate',
    demo: '',
    status: 'Active',
    connections: ['cocs', 'cocs-godot', 'mothbake'],
    specs: {
      'DSP Core': 'C++20 / JUCE / Neural Amp Modeler v0.5.4',
      'Real-Time Contract': 'Zero Heap Alloc / Zero Lock Audio Callback',
      'Rhythm Pipeline': 'Bounded Ring -> BTrack/Aubio -> Musical Clock',
      'Plugin Targets': 'Standalone Desktop + VST3 Host & Plugin'
    },
    features: [
      'Up to three parallel SHA-verified NAM neural amp/cab rigs with reorderable pedalboard',
      'Lock-free audio callback verified across 26 processor probes with zero heap allocations',
      'Live Jam adaptive drummer (Rock, Metal, Blues, Funk, Shuffle) with bar-quantized fills',
      'Portable jam-core C++ rhythm library testable headlessly without an audio device'
    ],
    telemetry: '[AUDIO_RT] ASIO/ALSA callback locked @ 48kHz / 64 samples (1.33ms)\n[NAM_CORE] Dual LSTM amp models warm // 0 heap allocs in 26 RT probes\n[MUSICAL_CLOCK] Tempo locked: 118.4 BPM (Confidence: 0.94 // Bar 16.2)\n[JAM_DIRECTOR] Queuing next-bar Funk groove transition + humanize swing'
  },
  {
    id: 'cocs',
    name: 'COCS',
    stopRoman: 'IV',
    stopName: 'The Prism Colosseum Spire',
    sculptureArchetype: 'prism-colosseum',
    tagline: 'Colosseum Of Competitive Slop — a deterministic 60 Hz Three.js arena shooter where parody AI operators settle differences.',
    description: 'COCS (v8.6 PRISM) is a local-first multiplayer Three.js arena shooter powered by a pure, deterministic 60 Hz simulation engine shared across client prediction, Node WebSocket authority, and automated test suites. Nine parody AI operators and seven agent harnesses clash across 34 procedural arenas, 21 game modes, 5 combined-arms vehicles, and a 23-layer Graphics Lab.',
    category: 'creative',
    accentColor: '#2dd4bf',
    secondaryColor: '#e11d8f',
    chord: {
      name: 'Dm11',
      rootHz: 293.66,
      notesHz: [293.66, 349.23, 440.00, 523.25, 659.25]
    },
    tags: ['Featured', 'Three.js', 'JavaScript', 'WebGL2', '60Hz Netcode', 'Arena Shooter', 'Procedural'],
    github: 'https://github.com/mojomast/cocs',
    demo: 'https://arena.ussyco.de',
    status: 'Active',
    connections: ['cocs-godot', 'mothbake', 'jammate'],
    specs: {
      'Simulation Core': 'Deterministic 60 Hz Pure JS Engine (game/)',
      'Netcode': 'Client Prediction + 30 Hz Quantized WS Snapshots',
      'Content Scale': '34 Arenas · 21 Modes · 10 Weapons · 5 Vehicles',
      'Renderer': 'Dual WebGL2 + 23-Layer Graphics Lab + CPU Fallback'
    },
    features: [
      'Quake/Source-inspired movement physics with host migration and push-to-talk voice',
      'LATTICE tactical command layer: squad routes, FLUX/REQ economy, and Operations waves',
      'Five combined-arms vehicles (Puma, Hornet, Titan, Scout, Transport) with multi-crew seats',
      '23-layer customizable shader stack with Moth-baked normal/sky/IR asset integration'
    ],
    telemetry: '[SIM_60HZ] Authoritative tick #18,420 // Snapshot quantization delta: 1.8 KB\n[LATTICE] Squad Alpha assigned REINFORCE vector -> Sector C (FLUX: 420)\n[GRAPHICS_LAB] Active stack: PRISM_BLOOM + CHROMATIC + MOTH_NORMAL_V2\n[ARENA] Match live on Ion Speedway // 9 operators active, 0 desyncs'
  },
  {
    id: 'cocs-godot',
    name: 'COCS-Godot',
    stopRoman: 'V',
    stopName: 'The Native Chariot Frame',
    sculptureArchetype: 'chariot-frame',
    tagline: 'Native Godot 4 port of COCS: DESTINATIONS pairing native 3D presentation and GPU particle labs with the authoritative Node simulation.',
    description: 'COCS-Godot splits native presentation from simulation authority: Godot 4.5.2 owns the 3D world, HUD, spatial audio, and 1M-particle GPU labs while the unchanged Node.js simulation engine retains 100% authority over movement, damage, and match rules. Includes a semantic map exporter, Blender-authored expansion maps, and the four-chapter Quiet Relay campaign.',
    category: 'creative',
    accentColor: '#478cbf',
    secondaryColor: '#e85d04',
    chord: {
      name: 'F#m11',
      rootHz: 185.00,
      notesHz: [185.00, 220.00, 277.18, 329.63, 415.30]
    },
    tags: ['Featured', 'Godot 4', 'GDScript', 'GDShader', 'Node.js', 'Combined Arms', 'GPU Particles'],
    github: 'https://github.com/mojomast/cocs-godot',
    demo: '',
    status: 'Active',
    connections: ['cocs', 'mothbake', 'jammate'],
    specs: {
      'Native Client': 'Godot 4.5.2 (GDScript + Custom GDShaders)',
      'Authority Backend': 'Locked Node.js 22.13+ Simulation Core',
      'Campaign & Maps': 'Quiet Relay (4 Chapters) + 16 Locked/Blender Maps',
      'VFX Workbench': '3 Moth Shader Families + 8K-1M GPU Particle Lab'
    },
    features: [
      'Strict presentation/authority split: Godot renders while Node.js owns every rule and hitbox',
      'Semantic exporter (tools/godot-export) locking canonical map geometry and 101 Moth textures',
      'Quiet Relay four-chapter singleplayer/co-op campaign and Blackwater robot Horde mode',
      'Built-in GDShader material lab and analytic/GPU particle workbench scaling up to 1M particles'
    ],
    telemetry: '[GODOT_4_5] Native viewport initialized // 101 Moth material planes bound\n[BRIDGE] Authoritative WS pipe locked to Node simulation @ 60.0 Hz\n[PARTICLE_LAB] Analytic GPU emitter active: 250,000 sparks // 0.9ms GPU\n[CAMPAIGN] Quiet Relay Chapter II: LATTICE HOLD receipt verified'
  },
  {
    id: 'routetok',
    name: 'RouteTok',
    stopRoman: 'VI',
    stopName: 'The Token Switchboard Cascade',
    sculptureArchetype: 'token-switchboard',
    tagline: 'Zero-dependency OpenAI- and Anthropic-compatible LLM token router with health-aware failover, observability, and Model Fieldbook.',
    description: 'RouteTok is a single Node 22 TypeScript service with zero runtime npm dependencies exposing three unified surfaces: a `/v1` OpenAI + Anthropic proxy, an `/dashboard` operations console, and a `/sandbox` Model Fieldbook. Virtual routes (`auto`, `best`, `free`, custom cascades) resolve to health-checked provider candidates with strict pre-output failover so streams are never spliced mid-flight.',
    category: 'infra',
    accentColor: '#f59e0b',
    secondaryColor: '#3b82f6',
    chord: {
      name: 'Abmaj7#11',
      rootHz: 207.65,
      notesHz: [207.65, 261.63, 311.13, 392.00, 440.00]
    },
    tags: ['Featured', 'TypeScript', 'Zero-Dependency', 'LLM Router', 'OpenAI API', 'Anthropic API', 'Observability'],
    github: 'https://github.com/mojomast/routetok',
    demo: '',
    status: 'Stable',
    connections: ['velvetrp', 'orbitdesktop', 'hermesdashboard', 'warpi'],
    specs: {
      'Runtime Footprint': 'Node 22 Stdlib HTTP // 0 Runtime Dependencies',
      'API Compatibility': 'OpenAI Chat/Responses + Anthropic Messages',
      'Failover Contract': 'Pre-Output Circuit Breaker (Never Splices Streams)',
      'Sandbox UI': '4-Lane Compare + Multi-Model Rooms + Iteration Studio'
    },
    features: [
      'Canonical namespaced routing (openrouter:model) plus virtual cascades (auto, best, free)',
      'Real-time circuit health, TTFT, token throughput, cache hit ratio, and x-router-* headers',
      'Human-reviewed, revision-bound routing configuration proposals with instant rollback',
      'Browser-local Model Fieldbook with 4-lane side-by-side comparison and multi-model rooms'
    ],
    telemetry: '[ROUTETOK] Listening on 127.0.0.1:8787 // 0 external npm deps loaded\n[CASCADE] Route "best" -> candidate #1 healthy (TTFT: 184ms, 92 tok/s)\n[CIRCUIT] All 6 provider breakers CLOSED // Cache hit ratio: 68.4%\n[FIELDBOOK] 4-Lane Compare room active in IndexedDB sandbox'
  },
  {
    id: 'rgbagentflightindicator',
    name: 'RGBAgentFlightIndicator',
    stopRoman: 'VII',
    stopName: 'The Annunciator Glare-Shield',
    sculptureArchetype: 'annunciator-shield',
    tagline: 'Turn an RGB keyboard into a physical cockpit annunciator panel for AI agent sessions — green in flight, white complete, blinking red on human gate.',
    description: 'RGBAgentFlightIndicator (`rgi` v0.8.0) is a Python daemon and hardware bridge that paints per-key RGB keyboards and lighting arrays from live coding-agent telemetry. Each active session claims a physical keycap lane: steady green while executing, crisp white on completion, and blinking master-caution red when waiting on human approval — with typing-quiet freeze so HID repaints never drop keystrokes.',
    category: 'infra',
    accentColor: '#22c55e',
    secondaryColor: '#ef4444',
    chord: {
      name: 'Bm9',
      rootHz: 246.94,
      notesHz: [246.94, 293.66, 369.99, 440.00, 554.37]
    },
    tags: ['Featured', 'Python', 'HID Hardware', 'OpenRGB', 'QMK', 'Agent Telemetry', 'OTLP', 'MQTT'],
    github: 'https://github.com/mojomast/rgbagentflightindicator',
    demo: '',
    status: 'Active',
    connections: ['orbitdesktop', 'hermesdashboard', 'warpi', 'becomussy'],
    specs: {
      'Daemon Core': 'Python 3.10+ Stdlib HTTP (127.0.0.1:8730) + hidapi',
      'Hardware Backends': 'Sinowealth · EVision · OpenRGB · QMK · WLED · sysfs',
      'Agent Harnesses': 'Cursor · Claude Code · Gemini CLI · Codex · OpenCode · Pi',
      'Alert Reach': 'Physical RGB + OTLP Receiver + MQTT/HomeAssistant + ntfy'
    },
    features: [
      'Scarce 12-lane physical keycap allocator with LRU eviction and typing-quiet repaint freeze',
      'Hardware-verified USB HID drivers (Sinowealth, EVision) plus OpenRGB, QMK, WLED, and GameSense',
      'Ingests telemetry from 16+ coding harnesses including Cursor, Claude Code, Gemini CLI, and Pi',
      'Interactive web map wizard with optional webcam lamp locator and byte-exact CI dummy backend'
    ],
    telemetry: '[RGI_DAEMON] Bound 127.0.0.1:8730 // HID device 258A:0049 connected\n[LANE_01] cursor:ussysite4 -> IN_FLIGHT (Lamp #14: #22C55E GREEN)\n[LANE_02] hermes:orbit     -> AWAITING_HUMAN (Lamp #15: #EF4444 BLINK)\n[TYPING_GUARD] Keypress activity detected -> pausing HID flush for 350ms'
  },
  {
    id: 'mothbake',
    name: 'MothBake',
    stopRoman: 'VIII',
    stopName: 'The Quantum Moth Light-Table',
    sculptureArchetype: 'moth-lighttable',
    tagline: 'Manifest-driven asset baking CLI with zero runtime dependencies for textures, normal maps, skyboxes, LUTs, and impulse responses.',
    description: 'MothBake is a zero-dependency Node 20+ asset-baking pipeline and local approval workbench containing its own clean-room binary decoders and encoders for PNG, GIF89a, ZIP/deflate, Radiance RGBE HDR, WAV PCM/float, and Standard MIDI. Every job produces five-layer cryptographic fingerprints from recipe to exported Godot 4 / Three.js ESM bundle so CI runs deterministically offline.',
    category: 'infra',
    accentColor: '#a855f7',
    secondaryColor: '#e6b422',
    chord: {
      name: 'Fmaj9#11',
      rootHz: 174.61,
      notesHz: [174.61, 220.00, 261.63, 329.63, 392.00]
    },
    tags: ['Featured', 'JavaScript', 'Zero-Dependency', 'Asset Pipeline', 'Shaders', 'Godot 4', 'Three.js', 'Audio IR'],
    github: 'https://github.com/mojomast/mothbake',
    demo: '',
    status: 'Stable',
    connections: ['cocs', 'cocs-godot', 'jammate'],
    specs: {
      'CLI Runtime': 'Node 20+ ESM // 0 npm Dependencies',
      'In-Repo Codecs': 'PNG · GIF89a · ZIP · Radiance RGBE · WAV · MIDI',
      'Bake Domains': 'Texture Tile · Normal Map · Sky HDR · LUT · Audio IR',
      'Target Emitters': 'Three.js ESM · Godot 4 Material Pack · Atlas · Audio'
    },
    features: [
      'Five-layer SHA fingerprinting (recipe, instance, raw bytes, bake, export) with spend gates',
      'Self-contained binary codecs for HDR skyboxes, normal maps, sprite sheets, and reverb IRs',
      'Offline repair and deterministic rebuild from archived raw blocks with zero network calls',
      'Loopback visual/audio approval workbench with 3x3 seamless tile preview and hash sign-off'
    ],
    telemetry: '[MOTHBAKE] Loaded manifest: 14 bake jobs // 0 external dependencies\n[FINGERPRINT] Recipe sha256:9f4c...2a1b matches recorded block cache\n[CODEC_RGBE] Baked equirect sky + 3x3 normal tile (seam error < 0.001)\n[EMITTER] Wrote byte-exact Godot 4 + Three.js ESM material bundles'
  },
  {
    id: 'warpi',
    name: 'Warpi',
    stopRoman: 'IX',
    stopName: 'The Copper Engine-Room Core',
    sculptureArchetype: 'copper-engine',
    tagline: 'Standalone Rust Warp terminal powered by a local Pi coding-agent backend — no cloud account required.',
    description: 'Warpi (v0.1.2) is an independent AGPL fork of the Warp GPU terminal engineered to run 100% locally without a Warp account. A dedicated Rust crate (`crates/standalone_agent`) supervises a private Node helper running the Pi coding-agent SDK over NDJSON stdio, brokering seven audited local tools (`bash`, `read`, `write`, `edit`, `glob`, `grep`, `bash_output`) against any OpenAI-compatible local or hosted model.',
    category: 'workspace',
    accentColor: '#00d4aa',
    secondaryColor: '#d97706',
    chord: {
      name: 'C#m9',
      rootHz: 277.18,
      notesHz: [277.18, 329.63, 415.30, 493.88, 622.25]
    },
    tags: ['Featured', 'Rust', 'Terminal', 'Pi SDK', 'Local LLM', 'Ollama', 'NDJSON', 'Security'],
    github: 'https://github.com/mojomast/warpi',
    demo: '',
    status: 'Active',
    connections: ['orbitdesktop', 'routetok', 'rgbagentflightindicator', 'hermesdashboard'],
    specs: {
      'Host Binary': 'Rust (98%) + WarpUI GPU Terminal',
      'Agent Supervisor': 'crates/standalone_agent <-> Pi SDK 0.84.2 (NDJSON)',
      'Brokered Tools': 'bash · bash_output · read · write · edit · glob · grep',
      'Secret Storage': 'OS Keychain / DPAPI / Secret Service / AES-256-GCM'
    },
    features: [
      'Zero cloud login required: strips telemetry/billing surfaces while preserving native diff & approval UI',
      'Every shell invocation marked NontrivialLocalChange + is_risky so terminal allow/denylists stay in path',
      'Live context-window meter with amber (75%), red (90%), and compaction (95%) thresholds',
      '156 Rust adapter unit tests + 37 NDJSON helper contract tests across local & hosted providers'
    ],
    telemetry: '[WARPI_RUST] dev.warpi.warpi v0.1.2 booted // Cloud surfaces: DISABLED\n[PI_HELPER] NDJSON stdio link established (Pi SDK 0.84.2 // PID 4812)\n[MODEL_PICK] Active profile: standalone:local|deepseek-v3 (Context: 42%)\n[TOOL_GATE] Brokered bash call -> flagged is_risky: awaiting local ACK'
  },
  {
    id: 'hermesdashboard',
    name: 'HermesDashboard',
    stopRoman: 'X',
    stopName: 'The Winged Operations Lectern',
    sculptureArchetype: 'winged-lectern',
    tagline: 'Standalone web dashboard for the Hermes AI agent runtime with streaming tool progress, session graphs, memory, and PTY hatches.',
    description: 'HermesDashboard wraps an existing Hermes agent installation (`HERMES_HOME`, `state.db`, skills, secrets) in a Starlette/Uvicorn operations console. Its SSE streaming bridge normalizes live `hermes.tool.progress` events, heartbeats long-running delegated subagents, visualizes session topologies as interactive graphs, and provides a SQLite-persisted threaded message board.',
    category: 'workspace',
    accentColor: '#d4af37',
    secondaryColor: '#5b8def',
    chord: {
      name: 'Dmaj9',
      rootHz: 293.66,
      notesHz: [293.66, 369.99, 440.00, 554.37, 659.25]
    },
    tags: ['Featured', 'Python', 'Starlette', 'Hermes', 'SSE Streaming', 'Agent Ops', 'SQLite', 'xterm.js'],
    github: 'https://github.com/mojomast/hermesdashboard',
    demo: '',
    status: 'Active',
    connections: ['orbitdesktop', 'becomussy', 'rgbagentflightindicator', 'routetok'],
    specs: {
      'Web Backend': 'Python Starlette + Uvicorn + SSE-Starlette (:8081)',
      'Agent Upstream': 'Hermes Runtime API (:8642) + state.db + YAML Skills',
      'Ops Surfaces': 'Chat · Session Graph · Memory · Skills · Cron · PTY',
      'Experimental Labs': 'Agent Ops · Self-Improvement · Vesuvius AutoResearch'
    },
    features: [
      'Resumable SSE tool-progress streaming with live subagent drawer on delegate_task calls',
      'Interactive 2D/3D session topology graph, token/cost accounting, and cron schedule manager',
      'SQLite-backed threaded Message Board where Hermes operates scoped to individual threads',
      'Optional jailed #hermesdashboard IRC bridge and cookie-authenticated floating xterm.js PTY'
    ],
    telemetry: '[HERMES_DASH] Starlette ops console bound on 127.0.0.1:8081\n[SSE_BRIDGE] Attached to Hermes runtime :8642 // Heartbeat: 15s NOMINAL\n[DELEGATE] Subagent drawer opened for toolCallId=tc_992a (running 14.2s)\n[GRAPH_SYNC] Rendered 38 session nodes & 112 memory edges // 0 errors'
  },
  {
    id: 'becomussy',
    name: 'Becomussy',
    stopRoman: 'XI',
    stopName: 'The Kintsugi Continuity Seal',
    sculptureArchetype: 'kintsugi-seal',
    tagline: 'A governed continuity system for agent self-development with 5-layer memory, reflection journals, semantic self-model diffing, and steward gates.',
    description: 'Becomussy is a modular FastAPI + PostgreSQL/pgvector monolith and Next.js 15 Steward UI that gives autonomous agents long-term continuity without surrendering human governance. It manages five distinct memory strata, reflection journals, and a four-facet versioned self-model where high-risk boundary or value revisions require cryptographic evidence and explicit human steward approval.',
    category: 'ai',
    accentColor: '#c9a227',
    secondaryColor: '#14b8a6',
    chord: {
      name: 'EbMaj9',
      rootHz: 311.13,
      notesHz: [311.13, 392.00, 466.16, 587.33, 698.46]
    },
    tags: ['Featured', 'Python', 'FastAPI', 'Next.js 15', 'PostgreSQL', 'pgvector', 'MCP', 'Agent Governance'],
    github: 'https://github.com/mojomast/becomussy',
    demo: '',
    status: 'Active',
    connections: ['hermesdashboard', 'orbitdesktop', 'velvetrp', 'rgbagentflightindicator'],
    specs: {
      'Core Service': 'FastAPI 0.115 + Async SQLAlchemy + PostgreSQL/pgvector',
      'Steward Console': 'Next.js 15 / React 19 + Becomussy MCP Server',
      'Memory Strata': 'Episodic · Semantic · Working · Relational · Autobiographical',
      'Self-Model Facets': 'Descriptive · Aspirational · Constrained · Relational'
    },
    features: [
      'Immutable audit_events ledger recording every memory reinforcement, contradiction, and revision',
      'Versioned four-facet self-model with semantic diffing and multi-stage revision state machine',
      'Risk-tiered governance: low-risk descriptive updates auto-adopt; constrained facets require Steward ACK',
      'Token-budgeted continuity compiler (/api/v1/continuity/resume) assembling startup context bundles'
    ],
    telemetry: '[BECOMUSSY] Continuity compiler online // Alembic head: 003_self_model\n[MEMORY_5L] Compiled resume bundle: 3,840 / 4,096 tokens (18 commitments)\n[SELF_MODEL] Revision v14 diff: +1 aspirational, 0 constrained changes\n[AUDIT_LOG] Event #8,904 sealed -> Steward status: APPROVED (Role: steward)'
  }
];

export const ORGANUM_STOPS = USSY_PROJECTS;

if (typeof window !== 'undefined') {
  window.USSY_PROJECTS = USSY_PROJECTS;
  window.USSY_CATEGORIES = USSY_CATEGORIES;
  window.ORGANUM_STOPS = ORGANUM_STOPS;
}
