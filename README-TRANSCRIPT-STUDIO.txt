TRANSCRIPT STUDIO INTEGRATION
============================

Added a single isolated launcher module:
  js/transcript-studio.js

Added a responsive button to the existing action bar:
  #openTranscriptStudioBtn

Destination:
  https://transcript-studio-n0nv.onrender.com/

Behavior:
- Opens Transcript Studio in a new tab from a direct user click.
- Uses noopener/noreferrer behavior.
- Falls back to same-tab navigation if the browser blocks the new tab.
- Does not modify Firebase, Firestore, authentication, appointments,
  scripts, notifications, analytics, or existing application state.
- No iframe is used, so the external tool cannot interfere with the
  ScriptFlow Pro DOM or JavaScript context.

The external service must be available for the button destination to load.
No claim of live service health is made by this client-side integration.
