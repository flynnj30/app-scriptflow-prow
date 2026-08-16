# ScriptFlow Pro — TypeScript Web Service Build

## Deployment

Run as a **Render Web Service**.

- Build Command: `npm install --no-audit --no-fund && npm run build`
- Start Command: `npm start`
- Health Check: `/healthz`
- Node: 20+

## Architecture

- Application source is under `src/` as TypeScript.
- Render builds the TypeScript source into `dist/`.
- The server exposes only `dist/` and never serves `src/`, build metadata, or package files.
- Browser JavaScript is compiled without source maps.
- Production builds minify client modules with esbuild.
- `server.ts` remains server-side and is not delivered to browsers.

## Security reality

TypeScript does not make browser code secret. Any JavaScript required by a browser can be inspected by an end user through DevTools. This build prevents the original TypeScript source and source maps from being served and adds production minification, but it cannot make client-side logic invisible.

Never place API secrets, private keys, service-account credentials, or privileged Firebase credentials in client code.

## Transcript Studio

The Transcript Studio integration is restricted to `https://transcript-studio-n0nv.onrender.com` at the server proxy layer and is surfaced under Tools & Settings as the first menu item.

The no-iframe browser surface fetches and renders the proxied HTML in the application panel. This approach is suitable for pages that are compatible with DOM-injection rendering. It is not equivalent to a full browser engine; sites that depend on cross-document isolation, service workers, WebSockets, or strict browser APIs may require a true browsing context such as an iframe or separate tab.
