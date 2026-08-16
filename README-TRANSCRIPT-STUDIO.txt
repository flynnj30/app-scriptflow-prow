TRANSCRIPT STUDIO — IN-APP BROWSER-STYLE PREVIEW

This build places Transcript Studio as the first item under Tools & Settings.
The destination is fixed to:
https://transcript-studio-n0nv.onrender.com/

Architecture
- No iframe is used.
- No normal navigation/redirect is used.
- ScriptFlow's Node Web Service proxies GET/HEAD requests through /transcript-browser/.
- The client renders the fetched HTML in a dedicated browser-like workspace.
- Third-party JavaScript is deliberately NOT executed inside ScriptFlow.

Security reason
Executing a remote site's JavaScript in a same-origin CRM page would allow that code to access the CRM DOM, localStorage, Firebase state, and application event handlers. A non-iframe implementation cannot provide a separate browser security context. This build therefore provides a safe in-app HTML preview/navigation surface rather than pretending it is a full browser engine.

If full Transcript Studio interactivity depends on JavaScript, WebSockets, service workers, browser storage, uploads, or another isolated browsing context, a true embedded browser requires an iframe/webview or a separate tab. That limitation is enforced by normal browser security and cannot be safely removed with TypeScript.

Render
- Service type: Web Service
- Root Directory: leave empty
- Build: npm install --no-audit --no-fund && npm run build
- Start: npm start
- Health: /healthz
