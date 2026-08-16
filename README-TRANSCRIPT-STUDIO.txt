SCRIPT FLOW PRO — TRANSCRIPT STUDIO INTEGRATION

Transcript Studio is integrated as the first item under Tools & Settings.
It opens inside the existing Feature Panel using an isolated iframe browser workspace.

Controls:
- Back: closes the embedded workspace and returns to the CRM script view.
- Reload: reloads the Transcript Studio iframe.
- Open in new tab: opens the external site directly.
- Retry: retries an iframe connection if embedding is unavailable.

Isolation:
- No Firebase/Firestore code was changed.
- No appointment, script, analytics, notification, or CRM data code was changed.
- The integration is contained in js/transcript-studio.js plus isolated HTML/CSS hooks.

Browser security:
The remote Transcript Studio service must permit iframe embedding. If it sends X-Frame-Options or a restrictive Content-Security-Policy frame-ancestors directive, browsers will block embedding. The app provides a graceful fallback instead of breaking ScriptFlow Pro.

URL:
https://transcript-studio-n0nv.onrender.com/
