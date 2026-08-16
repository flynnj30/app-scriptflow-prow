# ScriptFlow Pro — Deployment & Transcript Studio Fixes

## Fixed TypeScript errors

The Transcript Studio integration now has explicit TypeScript declarations for the browser globals and correct DOM event/value types. Promise callbacks use `Promise<void>` where appropriate.

The Transcript Studio Vite IIFE now exports named `mount` and `unmount` functions, matching the ScriptFlow loader.

## Feature preservation

The existing CRM source modules are preserved. `src/client/js/app.ts` is the same application logic as the existing `js/app.js` (apart from the TypeScript no-check directive), so calendar, tasks, analytics, closers, scripts, smart import, notifications, Firebase, export, shortcuts, and existing workflows are not replaced by the Transcript Studio integration.

## Transcript Studio API

The Node server exposes `/transcript-api/*` and proxies these Transcript Studio endpoints to the configured Transcript Studio service:

- `/api/transcribe`
- `/api/summarize`
- `/api/extract-booking`
- `/api/analyze-video`
- `/api/low-latency-query`

The Transcript Studio React bundle is mounted in a Shadow DOM; it is not an iframe.

## Render

Service: Web Service

Root Directory: leave empty

Build:
`npm install --no-audit --no-fund && npm run build`

Start:
`npm start`

Health check:
`/healthz`

Node:
`20.19.0`

## Note

A browser-executed frontend cannot be made completely secret. Production source maps are disabled and TypeScript source/server internals are blocked from direct HTTP serving, but browser code required by the application can still be inspected by a determined user.
