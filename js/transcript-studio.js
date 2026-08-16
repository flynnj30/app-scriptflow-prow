/* ================================================================
 * SCRIPTFLOW PRO — TRANSCRIPT STUDIO
 * Embedded browser-style workspace.
 * Isolated module: no Firebase/CRM data mutations.
 * ================================================================ */
(function () {
    'use strict';

    const CONFIG = Object.freeze({
        url: 'https://transcript-studio-n0nv.onrender.com/',
        toolId: 'transcriptStudioToolItem',
        viewName: 'transcript-studio'
    });

    let currentFrame = null;

    function escapeHtml(value) {
        return String(value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function getFeatureBody() {
        return document.getElementById('featurePanelBody');
    }

    function stopFrame() {
        if (currentFrame) {
            currentFrame.src = 'about:blank';
            currentFrame = null;
        }
    }

    function openExternal() {
        const opened = window.open(CONFIG.url, '_blank', 'noopener,noreferrer');
        if (!opened) window.location.href = CONFIG.url;
    }

    function render(container) {
        if (!container) return;
        stopFrame();
        container.innerHTML = `
            <section class="transcript-studio-workspace" aria-label="Transcript Studio">
                <div class="transcript-browser-toolbar">
                    <div class="transcript-browser-actions" role="group" aria-label="Transcript Studio controls">
                        <button type="button" class="transcript-browser-btn" id="transcriptBackBtn" title="Back to ScriptFlow" aria-label="Back to ScriptFlow">
                            <i class="fas fa-arrow-left"></i>
                        </button>
                        <button type="button" class="transcript-browser-btn" id="transcriptReloadBtn" title="Reload Transcript Studio" aria-label="Reload Transcript Studio">
                            <i class="fas fa-rotate-right"></i>
                        </button>
                    </div>
                    <div class="transcript-addressbar" title="Transcript Studio URL">
                        <i class="fas fa-lock"></i>
                        <span>${escapeHtml(CONFIG.url)}</span>
                    </div>
                    <button type="button" class="transcript-browser-btn transcript-external-btn" id="transcriptExternalBtn" title="Open in new tab" aria-label="Open in new tab">
                        <i class="fas fa-up-right-from-square"></i>
                    </button>
                </div>
                <div class="transcript-frame-wrap" id="transcriptFrameWrap">
                    <div class="transcript-frame-loading" id="transcriptFrameLoading">
                        <div class="transcript-loading-spinner" aria-hidden="true"></div>
                        <strong>Opening Transcript Studio…</strong>
                        <span>Connecting securely to the hosted tool.</span>
                    </div>
                    <iframe
                        id="transcriptStudioFrame"
                        class="transcript-studio-frame"
                        title="Transcript Studio"
                        src="${escapeHtml(CONFIG.url)}"
                        loading="eager"
                        referrerpolicy="strict-origin-when-cross-origin"
                        allow="clipboard-read; clipboard-write; microphone"
                        allowfullscreen>
                    </iframe>
                    <div class="transcript-frame-fallback" id="transcriptFrameFallback" hidden>
                        <div class="transcript-fallback-icon"><i class="fas fa-window-maximize"></i></div>
                        <h3>Transcript Studio cannot be embedded here</h3>
                        <p>The hosted tool is blocking embedded browser access, or the connection is temporarily unavailable. Your ScriptFlow CRM is still working normally.</p>
                        <button type="button" class="btn-icon" id="transcriptFallbackOpenBtn">
                            <i class="fas fa-up-right-from-square"></i> Open Transcript Studio
                        </button>
                    </div>
                </div>
            </section>
        `;

        const frame = container.querySelector('#transcriptStudioFrame');
        const loading = container.querySelector('#transcriptFrameLoading');
        const fallback = container.querySelector('#transcriptFrameFallback');

        currentFrame = frame;

        const showFallback = () => {
            if (loading) loading.hidden = true;
            if (frame) frame.style.display = 'none';
            if (fallback) fallback.hidden = false;
        };

        if (frame) {
            frame.addEventListener('load', () => {
                if (loading) loading.hidden = true;
            }, { once: true });
            // An iframe's load event does not expose cross-origin HTTP errors.
            // The timeout only catches an unresponsive/blocked embedding case.
            window.setTimeout(() => {
                if (loading && !loading.hidden) showFallback();
            }, 12000);
        }

        container.querySelector('#transcriptBackBtn')?.addEventListener('click', () => {
            if (window.FeaturePanel && typeof window.FeaturePanel.hide === 'function') {
                stopFrame();
                window.FeaturePanel.hide();
            }
        });
        container.querySelector('#transcriptReloadBtn')?.addEventListener('click', () => {
            if (!frame) return;
            if (loading) loading.hidden = false;
            if (fallback) fallback.hidden = true;
            frame.style.display = 'block';
            frame.src = CONFIG.url;
        });
        container.querySelector('#transcriptExternalBtn')?.addEventListener('click', openExternal);
        container.querySelector('#transcriptFallbackOpenBtn')?.addEventListener('click', openExternal);
    }

    function open() {
        if (typeof window.FeaturePanel === 'undefined' || typeof window.FeaturePanel.show !== 'function') {
            // Safe fallback if the host application has not initialized yet.
            openExternal();
            return;
        }
        window.FeaturePanel.show(CONFIG.viewName, '🎙️ Transcript Studio');
    }

    function init() {
        const item = document.getElementById(CONFIG.toolId);
        if (!item || item.dataset.transcriptStudioBound === 'true') return;
        item.dataset.transcriptStudioBound = 'true';
        item.addEventListener('click', open);
        item.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                open();
            }
        });
    }

    // Extend the existing FeaturePanel without changing app.js.
    // The original FeaturePanel remains the source of truth for all other tools.
    function installFeaturePanelAdapter() {
        if (!window.FeaturePanel || window.FeaturePanel.__transcriptStudioInstalled) return;
        const panel = window.FeaturePanel;
        const originalShow = panel.show.bind(panel);
        const originalHide = panel.hide.bind(panel);

        panel.show = function (featureType, title) {
            if (featureType === CONFIG.viewName) {
                const scriptPanel = document.getElementById('scriptPanel');
                const featurePanel = document.getElementById('featurePanel');
                const featureTitle = document.getElementById('featurePanelTitle');
                const toggle = document.getElementById('viewToggleContainer');
                const body = getFeatureBody();
                if (!featurePanel || !body) return;
                
                if (scriptPanel) scriptPanel.style.display = 'none';
                featurePanel.style.display = 'block';
                if (featureTitle) featureTitle.innerHTML = '<i class="fas fa-file-audio"></i> Transcript Studio';
                if (toggle) toggle.innerHTML = '';
                render(body);
                return;
            }
            stopFrame();
            return originalShow(featureType, title);
        };

        panel.hide = function () {
            stopFrame();
            return originalHide();
        };
        panel.__transcriptStudioInstalled = true;
    }

    function boot() {
        init();
        installFeaturePanelAdapter();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot, { once: true });
    } else {
        boot();
    }

    window.ScriptFlowTranscriptStudio = Object.freeze({
        url: CONFIG.url,
        open,
        openExternal
    });
})();
