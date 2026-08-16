# Transcript Studio In-App Browser

ScriptFlow Pro includes Transcript Studio as the first item under **Tools & Settings**.

Target URL:
`https://transcript-studio-n0nv.onrender.com/`

## Architecture

This integration deliberately does **not** use an iframe. The ScriptFlow Node web service exposes a restricted same-origin route:

`/transcript-browser/*`

The server fetches only the Transcript Studio Render origin, rewrites navigation/assets back through that route, and the frontend renders the returned page inside the dedicated browser viewport.

The browser toolbar shows the current Transcript Studio URL and supports Back, Forward, Home, Reload, and direct URL navigation.

## Important browser limitation

A normal web page cannot create a fully isolated Chrome/WebView browsing context without an iframe or separate browser context. Therefore this is a browser-style in-app renderer, not a full browser engine. It works best for standard HTML/CSS/JavaScript web apps. Features that require service workers, WebSockets, cross-origin browser isolation, or other browser-context APIs may not be reproducible through this architecture.

## Deployment

Deploy ScriptFlow Pro as a **Render Web Service**. Do not deploy as a Static Site because the `/transcript-browser/*` route is provided by the Node server.

Build command:
`npm install --no-audit --no-fund && npm run build`

Start command:
`npm start`

Health check:
`/healthz`
