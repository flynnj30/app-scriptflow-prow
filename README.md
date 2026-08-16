# ScriptFlow Pro

ScriptFlow Pro is deployed as a Node Web Service. The application preserves the existing CRM UI and features while using a production build that keeps the public HTML intentionally minimal.

## Development source

TypeScript source is under `src/`. The production server serves only `dist/` after `npm run build`.

## Build

    npm install
    npm run build
    npm start

## Render

Use a Web Service:

- Build: `npm install --no-audit --no-fund && npm run build`
- Start: `npm start`
- Health check: `/healthz`

## Frontend security

See `README-FRONTEND-SECURITY.md`.

Client-side code is never truly secret because the browser must download it. This build prevents accidental exposure of the original TypeScript/source structure and disables source maps; it does not claim to make browser code impossible to inspect.
