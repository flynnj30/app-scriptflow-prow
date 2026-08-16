/* ================================================================
 * TRANSCRIPT STUDIO LAUNCHER
 * ================================================================
 * Safe, isolated integration: this module only owns the launcher
 * button and does not modify Firebase, CRM state, routing, scripts,
 * appointments, notifications, or existing application logic.
 */
(function () {
    'use strict';

    const TRANSCRIPT_STUDIO_URL = 'https://transcript-studio-n0nv.onrender.com/';
    const BUTTON_ID = 'openTranscriptStudioBtn';

    function openTranscriptStudio(event) {
        if (event) event.preventDefault();

        // Open from a direct user click so normal browser popup protection
        // does not treat this as an unsolicited popup.
        const opened = window.open(
            TRANSCRIPT_STUDIO_URL,
            '_blank',
            'noopener,noreferrer'
        );

        // Fallback for environments that block window.open. This still
        // guarantees the user can reach the tool from the button.
        if (!opened) {
            window.location.assign(TRANSCRIPT_STUDIO_URL);
        }
    }

    function initTranscriptStudioLauncher() {
        const button = document.getElementById(BUTTON_ID);
        if (!button || button.dataset.transcriptStudioBound === 'true') return;

        button.dataset.transcriptStudioBound = 'true';
        button.addEventListener('click', openTranscriptStudio);
        button.setAttribute('aria-label', 'Open Transcript Studio');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initTranscriptStudioLauncher, { once: true });
    } else {
        initTranscriptStudioLauncher();
    }

    // Expose only the URL for optional future integrations without creating
    // a dependency on the main ScriptFlow application object.
    window.ScriptFlowTranscriptStudio = Object.freeze({
        url: TRANSCRIPT_STUDIO_URL,
        open: openTranscriptStudio
    });
})();
