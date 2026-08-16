# ScriptFlow Pro frontend security/deployment

## What is protected

- The production server serves only `dist/`.
- TypeScript under `src/` is build-time source and is not copied into `dist/`.
- `tsconfig*.json`, `build.mjs`, package metadata, and server source are not publicly served.
- Browser source maps are disabled.
- The public `index.html` is intentionally a minimal application shell.
- Production browser code is minified into `dist/assets/app.min.js` and `dist/assets/runtime.min.js`.
- The full application markup is compiled into the runtime build rather than being present in `index.html`.
- Security headers are applied by the Node web service.

## Important limitation

Client-side code cannot be made secret. A browser must receive and execute JavaScript, so a determined user can inspect downloaded assets. This setup hides the original development structure and TypeScript source from ordinary page-source inspection, but it is not encryption or a way to make browser code impossible to reverse engineer.

Never put passwords, private API keys, service-account credentials, Firebase Admin credentials, or other secrets in browser TypeScript. Put those on the server and expose only authenticated server endpoints.

## Render

Service type: Web Service

Build command:

    npm install --no-audit --no-fund && npm run build

Start command:

    npm start

Health check:

    /healthz
