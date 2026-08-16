# Render Deployment

Deploy as a **Web Service** from the repository root.

- Root Directory: leave blank
- Build: `npm install --no-audit --no-fund && npm run build`
- Start: `npm start`
- Health check: `/healthz`
- Node: 20.x (see `.node-version`)

Do not deploy this version as a Static Site. The in-app Transcript Studio browser depends on the Node server proxy route `/transcript-browser/*`.
