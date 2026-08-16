/* ScriptFlow Pro — embedded Transcript Studio micro-frontend.
 * No iframe. The attached Transcript Studio React application is bundled and
 * mounted into an isolated Shadow DOM so its styles/components do not leak into CRM.
 */
(function () {
  'use strict';
  const IDS = {
    panel: 'transcriptStudioPanel',
    viewport: 'transcriptBrowserViewport',
    status: 'transcriptBrowserStatus',
    address: 'transcriptAddress',
    back: 'transcriptBackBtn',
    reload: 'transcriptReloadBtn'
  };
  const SCRIPT = '/transcript-studio/transcript-studio.js';
  const DEFAULT_URL = 'https://transcript-studio-n0nv.onrender.com/';
  let loaded = false;
  let unmount = null;
  const $ = id => document.getElementById(id);

  function status(text) { const el = $(IDS.status); if (el) el.textContent = text; }
  function showPanel(open) {
    const panel = $(IDS.panel);
    const scripts = $('scriptPanel');
    const features = $('featurePanel');
    if (!panel) return;
    panel.hidden = !open;
    panel.style.display = open ? 'flex' : 'none';
    if (open) {
      if (scripts) scripts.style.display = 'none';
      if (features) features.style.display = 'none';
    } else if (scripts) scripts.style.display = '';
  }
  function ensureScript() {
    if (loaded && window.TranscriptStudioApp?.mount) return Promise.resolve();
    return new Promise((resolve, reject) => {
      const existing = document.querySelector('script[data-transcript-studio-bundle]');
      if (existing) {
        existing.addEventListener('load', () => resolve());
        existing.addEventListener('error', reject);
        if (window.TranscriptStudioApp?.mount) resolve();
        return;
      }
      const s = document.createElement('script');
      s.src = SCRIPT;
      s.async = true;
      s.dataset.transcriptStudioBundle = 'true';
      s.onload = () => { loaded = true; resolve(); };
      s.onerror = () => reject(new Error('Transcript Studio bundle failed to load'));
      document.head.appendChild(s);
    });
  }
  async function open() {
    const viewport = $(IDS.viewport);
    if (!viewport) return;
    showPanel(true);
    const address = $(IDS.address);
    if (address) address.value = DEFAULT_URL;
    status('Loading Transcript Studio…');
    try {
      await ensureScript();
      if (!window.TranscriptStudioApp?.mount) throw new Error('Transcript Studio mount API unavailable');
      if (unmount) unmount();
      unmount = window.TranscriptStudioApp.mount(viewport);
      status('Transcript Studio ready');
    } catch (error) {
      console.error('[Transcript Studio]', error);
      viewport.innerHTML = '<div class="transcript-embedded-error"><strong>Transcript Studio could not be loaded.</strong><span>Refresh the page and try again.</span></div>';
      status('Unable to load Transcript Studio');
    }
  }
  function close() {
    if (unmount) { try { unmount(); } catch (_) {} unmount = null; }
    const viewport = $(IDS.viewport); if (viewport) viewport.replaceChildren();
    showPanel(false); status('Ready');
  }
  function init() {
    document.querySelectorAll('[data-tool="transcript-studio"]').forEach(item => {
      item.addEventListener('click', open);
      item.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } });
    });
    $(IDS.back)?.addEventListener('click', close);
    $(IDS.reload)?.addEventListener('click', () => open());
    window.ScriptFlowTranscriptStudio = { open, close, reload: open, url: DEFAULT_URL };
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
