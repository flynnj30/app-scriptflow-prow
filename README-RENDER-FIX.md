# Render Deployment Fix

## Critical setting
This repository must be deployed from the **repository root**. In Render, leave **Root Directory** empty. Do not set it to `src`, `dist`, or another subfolder.

The deployment error:

`ENOENT: no such file or directory, open '/opt/render/project/src/package.json'`

means Render is currently treating `src` as the service root. `package.json` is intentionally at the repository root.

## Render settings

- Service type: Web Service
- Runtime: Node
- Root Directory: **blank / repository root**
- Build Command: `npm install --no-audit --no-fund && npm run build`
- Start Command: `npm start`
- Health Check Path: `/healthz`

Do not set the Root Directory to `src`.

## Local verification

```bash
npm install
npm run build
npm start
```

Then open `/healthz`. It should return JSON with `ok: true`.
