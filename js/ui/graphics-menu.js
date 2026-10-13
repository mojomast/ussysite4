/**
 * USSYSITE4 // GRAPHICS & PERFORMANCE PANEL
 *
 * Live, per-feature toggles for every heavy visual system so the look/perf
 * balance can be dialled in by hand. The "Copy settings" button emits the
 * current effective state as JSON so it can be shared and turned into defaults.
 *
 * All values route through OrganumEngine.setGraphics(); `null` means "follow the
 * current quality tier". Automatic quality adaptation is gated by
 * engine.autoQualityEnabled (off by default while tuning).
 */

export function initGraphicsMenu(app) {
  const $ = (id) => document.getElementById(id);
  const modal = $('graphics-modal');
  if (!modal) return null;

  const engine = () => app.engine;

  const els = {
    open: $('graphics-open-btn'),
    close: $('graphics-close-btn'),
    copy: $('graphics-copy-btn'),
    reset: $('graphics-reset-btn'),
    fps: $('graphics-fps'),
    quality: $('gfx-quality'),
    dpr: $('gfx-dpr'),
    dprVal: $('gfx-dpr-val'),
    particles: $('gfx-particles'),
    pcount: $('gfx-particles-count'),
    pcountVal: $('gfx-particles-count-val'),
    bloom: $('gfx-bloom'),
    cinematic: $('gfx-cinematic'),
    msaa: $('gfx-msaa'),
    ferrofluid: $('gfx-ferrofluid'),
    windrail: $('gfx-windrail'),
    ribbons: $('gfx-ribbons'),
    vault: $('gfx-vault'),
    auto: $('gfx-auto'),
    renderer: $('graphics-renderer')
  };

  function refresh() {
    const e = engine();
    const s = e?.getGraphicsSettings?.();
    if (!s) return;
    els.quality.value = s.quality;
    els.dpr.value = String(s.pixelRatio);
    els.dprVal.textContent = Number(s.pixelRatio).toFixed(2);
    els.particles.checked = s.particles;
    els.pcount.value = String(s.particleCount);
    els.pcountVal.textContent = String(s.particleCount);
    els.pcount.disabled = !s.particles;
    els.bloom.checked = s.bloom;
    els.cinematic.checked = s.cinematic;
    els.msaa.value = String(s.msaa);
    els.ferrofluid.checked = s.ferrofluid;
    els.windrail.checked = s.windrail;
    els.ribbons.checked = s.ribbons;
    els.vault.checked = s.vault;
    els.auto.checked = s.autoQuality;
    els.fps.textContent = `${s.fps} FPS`;
    const ri = e?.getRendererInfo?.();
    if (ri && els.renderer) {
      els.renderer.textContent =
        `three r${ri.threeRevision} · ${ri.webglVersion}\n` +
        `GPU: ${ri.gpu}\n` +
        `draw calls: ${ri.drawCalls} · triangles: ${Number(ri.triangles).toLocaleString()}\n` +
        `geometries: ${ri.geometries} · textures: ${ri.textures} · programs: ${ri.programs}`;
    }
  }

  const apply = (partial) => { engine()?.setGraphics(partial); refresh(); };

  els.quality?.addEventListener('change', () => apply({ quality: els.quality.value }));
  els.dpr?.addEventListener('input', () => {
    els.dprVal.textContent = Number(els.dpr.value).toFixed(2);
    apply({ pixelRatio: Number(els.dpr.value) });
  });
  els.particles?.addEventListener('change', () => apply({ particles: els.particles.checked }));
  els.pcount?.addEventListener('input', () => {
    els.pcountVal.textContent = els.pcount.value;
    apply({ particles: true, particleCount: Number(els.pcount.value) });
  });
  els.bloom?.addEventListener('change', () => apply({ bloom: els.bloom.checked }));
  els.cinematic?.addEventListener('change', () => apply({ cinematic: els.cinematic.checked }));
  els.msaa?.addEventListener('change', () => apply({ msaa: Number(els.msaa.value) }));
  els.ferrofluid?.addEventListener('change', () => apply({ ferrofluid: els.ferrofluid.checked }));
  els.windrail?.addEventListener('change', () => apply({ windrail: els.windrail.checked }));
  els.ribbons?.addEventListener('change', () => apply({ ribbons: els.ribbons.checked }));
  els.vault?.addEventListener('change', () => apply({ vault: els.vault.checked }));
  els.auto?.addEventListener('change', () => {
    if (engine()) engine().autoQualityEnabled = els.auto.checked;
    refresh();
  });

  els.reset?.addEventListener('click', () => {
    const e = engine();
    if (!e) return;
    e.autoQualityEnabled = false;
    e.setGraphics({
      pixelRatio: null, particles: null, particleCount: null, bloom: null,
      cinematic: null, msaa: null, ferrofluid: true, windrail: true, ribbons: true, vault: true
    });
    refresh();
  });

  els.copy?.addEventListener('click', async () => {
    const s = engine()?.getGraphicsSettings?.() || {};
    const text = JSON.stringify(s, null, 2);
    let ok = false;
    try {
      await navigator.clipboard.writeText(text);
      ok = true;
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); ok = true; } catch { ok = false; }
      ta.remove();
    }
    const prev = els.copy.textContent;
    els.copy.textContent = ok ? 'COPIED ✓' : 'COPY FAILED';
    setTimeout(() => { els.copy.textContent = prev; }, 1400);
  });

  const open = () => { modal.hidden = false; refresh(); };
  const close = () => { modal.hidden = true; };
  els.open?.addEventListener('click', open);
  els.close?.addEventListener('click', close);
  modal.addEventListener('click', (e) => { if (e.target === modal) close(); });
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modal.hidden) { close(); e.stopPropagation(); }
  }, true);

  // Keep the FPS readout live while the panel is open.
  setInterval(() => { if (!modal.hidden) refresh(); }, 600);

  refresh();
  return { open, close, refresh, apply };
}
