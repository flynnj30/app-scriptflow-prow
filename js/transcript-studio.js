/* ================================================================
 * SCRIPTFLOW PRO — TRANSCRIPT STUDIO TOOL
 * ================================================================
 * Isolated feature integration.
 * - Lives under Tools & Settings as the first tool.
 * - Uses the existing Feature Panel instead of creating a second shell.
 * - Embeds Transcript Studio in a browser-like iframe workspace.
 * - Does not touch Firebase, Firestore, CRM data, scripts, appointments,
 *   notifications, analytics, or existing app state.
 * ================================================================ */
(function () {
    'use strict';

    const CONFIG = Object.freeze({
        url: 'https://transcript-studio-n0nv.onrender.com/',
        toolName: 'transcript-studio',
        title: 'Transcript Studio'
    });

    let initialized = false;
    let iframe = null;
    let workspace = null;

    function getFeaturePanel() {
        return document.getElementById('featurePanel');
    }

    function getFeatureBody() {
        return document.getElementById('featurePanelBody');
    }

    function setFeaturePanelVisible(visible) {
        const panel = getFeaturePanel();
        const scriptPanel = document.getElementById('scriptPanel');
        if (!panel) return false;
        panel.style.display = visible ? 'block' : 'none';
        if (scriptPanel) scriptPanel.style.display = visible ? 'none' : '';
        return true;
    }

    function stopEmbeddedTool() {
        if (iframe) {
            // Releasing the iframe source prevents the external app from
            // continuing to consume resources after leaving the feature.
            iframe.src = 'about:blank';
            iframe = null;
        }
        workspace = null;
    }

    function escapeHtml(value) {
        return String(value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function renderWorkspace() {
        const body = getFeatureBody();
        if (!body) return;

        body.innerHTML = `
            <div class="transcript-studio-workspace" role="application" aria-label="Transcript Studio browser workspace">
                <div class="transcript-browser-toolbar">
                    <div class="transcript-browser-nav" role="group" aria-label="Browser controls">
                        <button type="button" class="transcript-browser-btn" data-ts-action="back" title="Return to ScriptFlow" aria-label="Return to ScriptFlow">
                            <i class="fas fa-arrow-left"></i>
                        </button>
                        <button type="button" class="transcript-browser-btn" data-ts-action="reload" title="Reload Transcript Studio" aria-label="Reload Transcript Studio">
                            <i class="fas fa-rotate-right"></i>
                        </button>
                    </div>
                    <div class="transcript-address-bar" aria-label="Transcript Studio address">
                        <i class="fas fa-lock" aria-hidden="true"></i>
                        <span>${escapeHtml(CONFIG.url)}</span>
                    </div>
                    <div class="transcript-browser-nav transcript-browser-nav-right" role="group" aria-label="External controls">
                        <button type="button" class="transcript-browser-btn" data-ts-action="new-tab" title="Open in a new tab" aria-label="Open in a new tab">
                            <i class="fas fa-up-right-from-square"></i>
                        </button>
                    </div>
                </div>
                <div class="transcript-browser-status" id="transcriptStudioStatus" role="status" aria-live="polite">
                    <span><i class="fas fa-circle-notch fa-spin"></i> Connecting to Transcript Studio…</span>
                </div>
                <div class="transcript-iframe-wrap">
                    <iframe
                        id="transcriptStudioFrame"
                        title="Transcript Studio"
                        src="${escapeHtml(CONFIG.url)}"
                        loading="eager"
                        referrerpolicy="strict-origin-when-cross-origin"
                        allow="clipboard-read; clipboard-write; microphone"
                        allowfullscreen>
                    </iframe>
                    <div class="transcript-iframe-fallback" id="transcriptStudioFallback" hidden>
                        <div class="transcript-fallback-card">
                            <div class="transcript-fallback-icon"><i class="fas fa-window-maximize"></i></div>
                            <h3>Transcript Studio couldn't be embedded</h3>
                            <p>The Transcript Studio server may prevent embedded browser access. ScriptFlow is still working normally.</p>
                            <div class="transcript-fallback-actions">
                                <button type="button" class="btn-icon" data-ts-action="retry" style="background:var(--primary);color:white;">
                                    <i class="fas fa-rotate-right"></i> Retry
                                </button>
                                <button type="button" class="btn-icon" data-ts-action="new-tab">
                                    <i class="fas fa-up-right-from-square"></i> Open Transcript Studio
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        workspace = body.querySelector('.transcript-studio-workspace');
        iframe = body.querySelector('#transcriptStudioFrame');

        const status = body.querySelector('#transcriptStudioStatus');
        const fallback = body.querySelector('#transcriptStudioFallback');

        const showReady = () => {
            if (status) {
                status.innerHTML = '<span><i class="fas fa-circle-check"></i> Transcript Studio connected</span>';
                status.classList.add('is-ready');
            }
        };

        const showFallback = () => {
            if (status) {
                status.innerHTML = '<span><i class="fas fa-circle-exclamation"></i> Embedded access is unavailable</span>';
                status.classList.remove('is-ready');
            }
            if (fallback) fallback.hidden = false;
        };

        if (iframe) {
            iframe.addEventListener('load', showReady, { once: true });
            // A blocked frame generally does not expose a useful DOM error to
            // the parent. The timeout provides a deterministic, non-destructive
            // fallback without producing console errors.
            window.setTimeout(() => {
                if (!iframe || !workspace || !workspace.isConnected) return;
                try {
                    const frameDoc = iframe.contentDocument;
                    if (frameDoc && frameDoc.readyState === 'complete') showReady();
                } catch (_) {
                    // Cross-origin access is expected and is not an error.
                    // A loaded cross-origin frame is still usable.
                }
            }, 4500);
        }

        body.querySelectorAll('[data-ts-action]').forEach(button => {
            button.addEventListener('click', () => {
                const action = button.dataset.tsAction;
                if (action === 'back') closeTool();
                if (action === 'reload') reloadTool();
                if (action === 'retry') retryTool();
                if (action === 'new-tab') window.open(CONFIG.url, '_blank', 'noopener,noreferrer');
            });
        });
    }

    function openTool() {
        const panel = getFeaturePanel();
        const body = getFeatureBody();
        const title = document.getElementById('featurePanelTitle');
        if (!panel || !body) return;

        if (title) title.innerHTML = '<i class="fas fa-file-audio"></i> Transcript Studio';
        setFeaturePanelVisible(true);
        renderWorkspace();

        const closeButton = document.getElementById('closeFeaturePanelBtn');
        if (closeButton) closeButton.focus({ preventScroll: true });
    }

    function closeTool() {
        stopEmbeddedTool();
        const panel = getFeaturePanel();
        const scriptPanel = document.getElementById('scriptPanel');
        if (panel) panel.style.display = 'none';
        if (scriptPanel) scriptPanel.style.display = '';

        // Let the existing application restore its normal script view.
        if (window.Scripts && typeof window.Scripts.loadScript === 'function') {
            try { window.Scripts.loadScript('opening'); } catch (_) { /* no-op */ }
        }
    }

    function reloadTool() {
        if (!iframe) return;
        iframe.src = CONFIG.url;
    }

    function retryTool() {
        if (!iframe) {
            openTool();
            return;
        }
        const fallback = document.getElementById('transcriptStudioFallback');
        const status = document.getElementById('transcriptStudioStatus');
        if (fallback) fallback.hidden = true;
        if (status) {
            status.classList.remove('is-ready');
            status.innerHTML = '<span><i class="fas fa-circle-notch fa-spin"></i> Reconnecting to Transcript Studio…</span>';
        }
        iframe.src = CONFIG.url;
    }

    function interceptToolClick(event) {
        const item = event.target && event.target.closest
            ? event.target.closest('.tool-item[data-tool="' + CONFIG.toolName + '"]')
            : null;
        if (!item) return;

        // Capture phase prevents the generic app tool handler from falling
        // through to its "coming soon" toast. No existing handler is changed.
        event.preventDefault();
        event.stopImmediatePropagation();
        openTool();
    }

    function handleCloseButton(event) {
        const button = event.target && event.target.closest
            ? event.target.closest('#closeFeaturePanelBtn')
            : null;
        if (!button) return;

        // Only take ownership when Transcript Studio is currently displayed.
        const body = getFeatureBody();
        if (!body || !body.querySelector('.transcript-studio-workspace')) return;
        stopEmbeddedTool();
    }

    function init() {
        if (initialized) return;
        initialized = true;
        document.addEventListener('click', interceptToolClick, true);
        document.addEventListener('click', handleCloseButton, true);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init, { once: true });
    } else {
        init();
    }

    window.ScriptFlowTranscriptStudio = Object.freeze({
        url: CONFIG.url,
        open: openTool,
        close: closeTool,
        reload: reloadTool
    });
})();
