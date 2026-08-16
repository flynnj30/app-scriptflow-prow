// @ts-nocheck
/* ================================================================
 * TRANSCRIPT STUDIO - IN-APP BROWSER SURFACE
 * No iframe. The page is fetched through ScriptFlow's same-origin
 * server proxy and rendered inside a dedicated browser viewport.
 * Only the Transcript Studio origin is accepted.
 * ================================================================ */
(function () {
  'use strict';

  const DEFAULT_URL = 'https://transcript-studio-n0nv.onrender.com/';
  const TARGET_ORIGIN = new URL(DEFAULT_URL).origin;
  const PROXY_PREFIX = '/transcript-browser/';
  const IDS = {
    panel: 'transcriptStudioPanel',
    address: 'transcriptAddress',
    viewport: 'transcriptBrowserViewport',
    status: 'transcriptBrowserStatus',
    back: 'transcriptBackBtn',
    forward: 'transcriptForwardBtn',
    reload: 'transcriptReloadBtn',
    home: 'transcriptHomeBtn',
    form: 'transcriptAddressForm',
    menu: 'transcriptBrowserMenu',
    menuClose: 'transcriptBrowserCloseBtn',
    fallback: 'transcriptBrowserFallback',
    fallbackRetry: 'transcriptFallbackRetryBtn'
  };

  const $ = (id) => document.getElementById(id);
  let historyStack = [];
  let historyIndex = -1;
  let currentUrl = DEFAULT_URL;
  let loading = false;
  let initialized = false;

  function setStatus(text, busy = false) {
    const el = $(IDS.status);
    if (el) {
      el.textContent = text;
      el.classList.toggle('is-loading', !!busy);
    }
  }

  function normalizeUrl(value) {
    let raw = String(value || '').trim();
    if (!raw) return DEFAULT_URL;
    if (!/^https?:\/\//i.test(raw)) raw = 'https://' + raw;
    try {
      const url = new URL(raw);
      if (url.origin !== TARGET_ORIGIN) return DEFAULT_URL;
      url.hash = '';
      return url.href;
    } catch {
      return DEFAULT_URL;
    }
  }

  function proxyUrl(target) {
    const url = new URL(normalizeUrl(target));
    return PROXY_PREFIX + url.pathname.replace(/^\//, '') + url.search;
  }

  function absoluteUrl(value, base) {
    try { return new URL(value, base).href; } catch { return ''; }
  }

  function targetUrlFromElement(raw, base) {
    if (!raw || /^(#|data:|blob:|mailto:|tel:|javascript:)/i.test(raw)) return '';
    const absolute = absoluteUrl(raw, base);
    try {
      return new URL(absolute).origin === TARGET_ORIGIN ? absolute : '';
    } catch {
      return '';
    }
  }

  function updateAddress(url) {
    const input = $(IDS.address);
    if (input) input.value = url;
  }

  function updateNavButtons() {
    const back = $(IDS.back);
    const forward = $(IDS.forward);
    if (back) back.disabled = historyIndex <= 0;
    if (forward) forward.disabled = historyIndex < 0 || historyIndex >= historyStack.length - 1;
  }

  function pushHistory(url) {
    if (historyIndex >= 0 && historyStack[historyIndex] === url) return;
    historyStack = historyStack.slice(0, historyIndex + 1);
    historyStack.push(url);
    historyIndex = historyStack.length - 1;
    updateNavButtons();
  }

  function showFallback(show) {
    const el = $(IDS.fallback);
    if (el) el.hidden = !show;
  }

  function showPanel(show) {
    const panel = $(IDS.panel);
    const scriptPanel = $('scriptPanel');
    const featurePanel = $('featurePanel');
    if (!panel) return;

    panel.hidden = !show;
    panel.style.display = show ? 'flex' : 'none';

    if (show) {
      if (scriptPanel) scriptPanel.style.display = 'none';
      if (featurePanel) featurePanel.style.display = 'none';
    } else {
      if (scriptPanel) scriptPanel.style.display = '';
      if (featurePanel) featurePanel.style.display = '';
    }
  }

  function sanitizeRemoteDocument(doc, baseUrl) {
    // The proxied page is displayed in a controlled application surface.
    // Remove page-level features that would try to navigate the parent CRM.
    doc.querySelectorAll('base').forEach((node) => node.remove());
    doc.querySelectorAll('meta[http-equiv]').forEach((node) => {
      const key = (node.getAttribute('http-equiv') || '').toLowerCase();
      if (key === 'content-security-policy' || key === 'x-frame-options' || key === 'refresh') node.remove();
    });

    const links = doc.querySelectorAll('a[href], link[href], img[src], script[src], source[src], video[src], audio[src], form[action], input[src], button[formaction]');
    links.forEach((el) => {
      const attr = el.hasAttribute('href') ? 'href' : el.hasAttribute('src') ? 'src' : el.hasAttribute('action') ? 'action' : 'formaction';
      const raw = el.getAttribute(attr);
      if (!raw || /^(#|data:|blob:|mailto:|tel:|javascript:)/i.test(raw)) return;
      const target = targetUrlFromElement(raw, baseUrl);
      if (target) el.setAttribute(attr, proxyUrl(target));
    });

    // Force links to remain inside this browser surface.
    doc.querySelectorAll('a[target]').forEach((a) => a.removeAttribute('target'));

    // Prevent the remote document from changing the CRM location.
    doc.querySelectorAll('form').forEach((form) => {
      form.setAttribute('target', '_self');
    });

    return doc;
  }

  function executeRemoteScripts(container) {
    // External scripts are executed only after the sanitized document is mounted.
    // Inline scripts are supported because many small Render apps bundle their logic inline.
    const scripts = Array.from(container.querySelectorAll('script'));
    scripts.forEach((oldScript) => {
      const script = document.createElement('script');
      Array.from(oldScript.attributes).forEach((attribute) => script.setAttribute(attribute.name, attribute.value));
      if (oldScript.src) script.src = oldScript.src;
      else script.textContent = oldScript.textContent || '';
      oldScript.replaceWith(script);
    });
  }

  async function loadUrl(target, options = {}) {
    const { addHistory = true } = options;
    const viewport = $(IDS.viewport);
    if (!viewport || loading) return;

    const url = normalizeUrl(target);
    loading = true;
    showFallback(false);
    setStatus('Connecting to Transcript Studio…', true);
    updateAddress(url);

    try {
      const response = await fetch(proxyUrl(url), {
        method: 'GET',
        credentials: 'same-origin',
        cache: 'no-store',
        headers: { 'X-ScriptFlow-Browser': '1', 'Accept': 'text/html,application/xhtml+xml' }
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const type = (response.headers.get('content-type') || '').toLowerCase();
      if (!type.includes('text/html') && !type.includes('application/xhtml')) {
        throw new Error('Transcript Studio returned a non-HTML response.');
      }

      const html = await response.text();
      const parser = new DOMParser();
      const parsed = parser.parseFromString(html, 'text/html');
      const sanitized = sanitizeRemoteDocument(parsed, url);

      viewport.replaceChildren();
      const fragment = document.createDocumentFragment();
      Array.from(sanitized.body.childNodes).forEach((node) => fragment.appendChild(node.cloneNode(true)));
      viewport.appendChild(fragment);

      // Stylesheets in the remote <head> are copied into the viewport as well.
      sanitized.head.querySelectorAll('style, link[rel="stylesheet"]').forEach((node) => {
        const clone = node.cloneNode(true);
        if (clone.tagName === 'LINK') {
          const href = clone.getAttribute('href');
          const targetHref = targetUrlFromElement(href, url);
          if (targetHref) clone.setAttribute('href', proxyUrl(targetHref));
        }
        viewport.prepend(clone);
      });

      executeRemoteScripts(viewport);
      currentUrl = url;
      if (addHistory) pushHistory(url);
      else updateNavButtons();
      setStatus('Connected · Transcript Studio', false);
    } catch (error) {
      console.error('[Transcript Studio]', error);
      viewport.replaceChildren();
      showFallback(true);
      setStatus('Unable to load Transcript Studio', false);
    } finally {
      loading = false;
    }
  }

  function open() {
    showPanel(true);
    if (!historyStack.length) {
      pushHistory(DEFAULT_URL);
      loadUrl(DEFAULT_URL, { addHistory: false });
    } else {
      loadUrl(currentUrl, { addHistory: false });
    }
  }

  function close() {
    const viewport = $(IDS.viewport);
    if (viewport) viewport.replaceChildren();
    showPanel(false);
    setStatus('Ready');
  }

  function goBack() {
    if (historyIndex > 0) {
      historyIndex -= 1;
      updateNavButtons();
      loadUrl(historyStack[historyIndex], { addHistory: false });
    }
  }

  function goForward() {
    if (historyIndex < historyStack.length - 1) {
      historyIndex += 1;
      updateNavButtons();
      loadUrl(historyStack[historyIndex], { addHistory: false });
    }
  }

  function goHome() {
    loadUrl(DEFAULT_URL);
  }

  function bindViewportEvents() {
    const viewport = $(IDS.viewport);
    if (!viewport) return;

    viewport.addEventListener('click', (event) => {
      const anchor = event.target.closest('a[href]');
      if (!anchor) return;
      const raw = anchor.getAttribute('href');
      const target = targetUrlFromElement(raw, currentUrl);
      if (!target) return;
      event.preventDefault();
      event.stopPropagation();
      loadUrl(target);
    }, true);

    viewport.addEventListener('submit', (event) => {
      const form = event.target.closest('form');
      if (!form) return;
      const action = targetUrlFromElement(form.getAttribute('action') || currentUrl, currentUrl) || currentUrl;
      const method = (form.getAttribute('method') || 'get').toLowerCase();
      if (method !== 'get') return;
      event.preventDefault();
      event.stopPropagation();
      const data = new URLSearchParams(new FormData(form));
      const target = new URL(action);
      const query = data.toString();
      target.search = query ? `?${query}` : '';
      loadUrl(target.href);
    }, true);
  }

  function init() {
    if (initialized) return;
    initialized = true;

    $(IDS.back)?.addEventListener('click', goBack);
    $(IDS.forward)?.addEventListener('click', goForward);
    $(IDS.home)?.addEventListener('click', goHome);
    $(IDS.reload)?.addEventListener('click', () => loadUrl(currentUrl, { addHistory: false }));
    $(IDS.form)?.addEventListener('submit', (event) => {
      event.preventDefault();
      loadUrl($(IDS.address)?.value || DEFAULT_URL);
    });
    $(IDS.menuClose)?.addEventListener('click', close);
    $(IDS.fallbackRetry)?.addEventListener('click', () => loadUrl(currentUrl, { addHistory: false }));

    bindViewportEvents();

    window.ScriptFlowTranscriptStudio = { open, close, reload: () => loadUrl(currentUrl, { addHistory: false }), url: DEFAULT_URL };
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
