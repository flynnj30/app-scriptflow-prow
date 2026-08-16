/* ================================================================
 * TRANSCRIPT STUDIO EMBEDDED BROWSER
 * Isolated integration. Does not touch Firebase/CRM state.
 * ================================================================ */
(function () {
    'use strict';

    const URL_DEFAULT = 'https://transcript-studio-n0nv.onrender.com/';
    const IDS = {
        button: 'openTranscriptStudioBtn',
        panel: 'transcriptStudioPanel',
        frame: 'transcriptStudioFrame',
        address: 'transcriptAddress',
        status: 'transcriptBrowserStatus',
        fallback: 'transcriptFrameFallback',
        back: 'transcriptBackBtn',
        reload: 'transcriptReloadBtn',
        go: 'transcriptGoBtn',
        newTab: 'transcriptNewTabBtn',
        fallbackOpen: 'transcriptFallbackOpenBtn',
        fallbackRetry: 'transcriptFallbackRetryBtn'
    };

    const $ = id => document.getElementById(id);

    function normalizeUrl(value) {
        let url = String(value || '').trim();
        if (!url) return URL_DEFAULT;
        if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
        try {
            const parsed = new URL(url);
            if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') return URL_DEFAULT;
            return parsed.href;
        } catch (_) {
            return URL_DEFAULT;
        }
    }

    function setStatus(text) {
        const el = $(IDS.status);
        if (el) el.textContent = text;
    }

    function showFallback(show) {
        const fallback = $(IDS.fallback);
        if (fallback) fallback.hidden = !show;
    }

    function setPanelVisible(visible) {
        const panel = $(IDS.panel);
        const scriptPanel = $('scriptPanel');
        const featurePanel = $('featurePanel');
        if (!panel) return;
        panel.hidden = !visible;
        panel.style.display = visible ? 'flex' : 'none';
        if (visible) {
            if (scriptPanel) scriptPanel.style.display = 'none';
            if (featurePanel) featurePanel.style.display = 'none';
        } else if (scriptPanel) {
            scriptPanel.style.display = '';
        }
    }

    function openExternal(url) {
        const target = normalizeUrl(url);
        const win = window.open(target, '_blank', 'noopener,noreferrer');
        if (!win) window.location.assign(target);
    }

    function loadUrl(url) {
        const target = normalizeUrl(url);
        const frame = $(IDS.frame);
        const address = $(IDS.address);
        if (!frame) return;
        if (address) address.value = target;
        showFallback(false);
        setStatus('Loading Transcript Studio…');
        frame.src = target;
    }

    function openEmbedded() {
        setPanelVisible(true);
        loadUrl($(IDS.address)?.value || URL_DEFAULT);
    }

    function closeEmbedded() {
        const frame = $(IDS.frame);
        setPanelVisible(false);
        // Stop the external page and release its resources when closed.
        if (frame) frame.src = 'about:blank';
        setStatus('Ready');
    }

    function init() {
        const button = $(IDS.button);
        const frame = $(IDS.frame);
        if (!button || button.dataset.transcriptStudioBound === 'true') return;
        button.dataset.transcriptStudioBound = 'true';

        button.addEventListener('click', openEmbedded);
        $(IDS.back)?.addEventListener('click', closeEmbedded);
        $(IDS.reload)?.addEventListener('click', () => loadUrl($(IDS.address)?.value || URL_DEFAULT));
        $(IDS.go)?.addEventListener('click', () => loadUrl($(IDS.address)?.value || URL_DEFAULT));
        $(IDS.newTab)?.addEventListener('click', () => openExternal($(IDS.address)?.value || URL_DEFAULT));
        $(IDS.fallbackOpen)?.addEventListener('click', () => openExternal($(IDS.address)?.value || URL_DEFAULT));
        $(IDS.fallbackRetry)?.addEventListener('click', () => loadUrl($(IDS.address)?.value || URL_DEFAULT));

        $(IDS.address)?.addEventListener('keydown', e => {
            if (e.key === 'Enter') { e.preventDefault(); loadUrl(e.currentTarget.value); }
        });

        if (frame) {
            frame.addEventListener('load', () => {
                setStatus('Transcript Studio loaded');
                // A cross-origin iframe cannot be inspected for content. A
                // load event is therefore only a transport signal; security
                // headers remain authoritative.
            });
            frame.addEventListener('error', () => {
                setStatus('Unable to load Transcript Studio');
                showFallback(true);
            });
        }
    }

    window.ScriptFlowTranscriptStudio = Object.freeze({
        url: URL_DEFAULT,
        open: openEmbedded,
        openExternal: () => openExternal(URL_DEFAULT),
        close: closeEmbedded
    });

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init, { once: true });
    } else {
        init();
    }
})();
