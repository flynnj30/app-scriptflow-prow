# Transcript Studio — Embedded Integration

Transcript Studio is integrated as a real React micro-frontend mounted inside ScriptFlow Pro.

## Behavior
- Tools & Settings → Transcript Studio opens the tool in the CRM workspace.
- No iframe is used.
- The attached Transcript Studio React application is bundled into `dist/transcript-studio/transcript-studio.js`.
- The bundle mounts inside an isolated Shadow DOM to prevent CSS/DOM leakage into the CRM.
- The toolbar displays the live Transcript Studio URL as a browser-style address bar.
- Reload remounts the app without navigating away from ScriptFlow.
- Back returns to the CRM.

## API routing
The embedded app's `/api/*` calls are rewritten at build/source level to `/transcript-api/*`.
The ScriptFlow Node server proxies those calls to:
`https://transcript-studio-n0nv.onrender.com/api/*`

This keeps the UI inside ScriptFlow while preserving the attached Transcript Studio's real API behavior.

## Render
Use a Web Service with an empty Root Directory:

Build: `npm install --no-audit --no-fund && npm run build`
Start: `npm start`
Health: `/healthz`

Keep `GEMINI_API_KEY` only in the Transcript Studio backend if you choose to run transcription locally. This integrated build currently proxies Transcript Studio API calls to the supplied Render app, so the key remains on that service.
