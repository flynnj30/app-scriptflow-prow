# ScriptFlow Pro — Direct Transcript Studio Integration

Transcript Studio is now built from the supplied `transcript-studio-main` source and launched as an internal child service of ScriptFlow Pro.

## Architecture

- ScriptFlow remains the public Render Web Service.
- ScriptFlow starts an internal Transcript Studio server on `127.0.0.1:3101`.
- The Transcript Studio frontend is built into `dist/transcript-studio`.
- ScriptFlow's `/transcript-browser/*` route proxies to the local Transcript Studio service, not to the public Render URL.
- The UI uses the existing no-iframe browser-style surface.
- The visible address bar remains `https://transcript-studio-n0nv.onrender.com/` while the actual content is served locally through the ScriptFlow service.
- Transcript Studio API requests are routed through `/transcript-browser/api/*` so they never collide with ScriptFlow's own API routes.

This removes the previous Render-to-Render 502 dependency and uses the supplied Transcript Studio source directly.

## Render

Service type: Web Service
Root Directory: blank / repository root
Build: `npm install --no-audit --no-fund && npm run build`
Start: `npm start`
Health check: `/healthz`

Set `GEMINI_API_KEY` in Render Environment Variables if AI transcription/analysis is required.

## Security

Do not commit `.env` files or API keys. TypeScript source is compiled for production and source maps are disabled. Browser-delivered JavaScript can always be inspected by users; server secrets and AI credentials remain server-side.
