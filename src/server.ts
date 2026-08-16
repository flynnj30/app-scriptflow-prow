declare const require: any;
declare const process: any;
declare const __dirname: string;

const http = require('http');
const childProcess = require('child_process');
const https = require('https');
const dns = require('dns');
const fs = require('fs');
const path = require('path');
const URLCtor = require('url').URL;

type IncomingMessage = any;
type ServerResponse = any;

const PORT = Number(process.env.PORT || 3000);
const PUBLIC_ROOT = path.join(__dirname);
const TARGET = new URLCtor('https://transcript-studio-n0nv.onrender.com/');
const LOCAL_TRANSCRIPT = new URLCtor('http://127.0.0.1:3101/');
const TRANSCRIPT_SERVER_SCRIPT = path.join(__dirname, 'transcript-server.cjs');
const TARGET_ORIGIN = TARGET.origin;
const PROXY_PREFIX = '/transcript-browser/';
const MAX_PROXY_BODY = 15 * 1024 * 1024;
const UPSTREAM_TIMEOUT_MS = 90000;
const UPSTREAM_RETRIES = 6;

// Render environments can prefer IPv6 even when the upstream is reachable only
// over IPv4. Prefer IPv4 for the outbound Transcript Studio connection.
try { dns.setDefaultResultOrder('ipv4first'); } catch {}
const upstreamAgent = new https.Agent({ keepAlive: true, family: 4, maxSockets: 20 });
const localAgent = new http.Agent({ keepAlive: true, maxSockets: 20 });

const MIME: Record<string, string> = {
  '.html': 'text/html; charset=utf-8', '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon', '.webp': 'image/webp', '.woff': 'font/woff', '.woff2': 'font/woff2',
  '.mp3': 'audio/mpeg', '.wav': 'audio/wav', '.ogg': 'audio/ogg', '.m4a': 'audio/mp4',
  '.txt': 'text/plain; charset=utf-8', '.map': 'application/json; charset=utf-8'
};

function securityHeaders(res: ServerResponse): void {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
}

function safeLocalPath(urlPath: string): string | null {
  let pathname: string;
  try { pathname = decodeURIComponent(urlPath); } catch { return null; }
  if (pathname.includes('\0')) return null;
  if (pathname === '/') pathname = '/index.html';
  const candidate = path.resolve(PUBLIC_ROOT, pathname.replace(/^\/+/, ''));
  if (candidate !== PUBLIC_ROOT && !candidate.startsWith(PUBLIC_ROOT + path.sep)) return null;
  return candidate;
}

function serveLocal(res: ServerResponse, pathname: string): void {
  const forbidden = /^(\/src|\/build-client|\/node_modules|\/\.git|\/package(?:-lock)?\.json|\/tsconfig|\/build\.mjs|\/server\.(?:js|ts)|\/\.env)/i;
  if (forbidden.test(pathname)) {
    securityHeaders(res); res.writeHead(404); res.end('Not Found'); return;
  }

  const file = safeLocalPath(pathname);
  if (!file || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
    const index = path.join(PUBLIC_ROOT, 'index.html');
    if (!fs.existsSync(index)) { res.writeHead(404); res.end('Not Found'); return; }
    return sendLocalFile(res, index);
  }
  sendLocalFile(res, file);
}

function sendLocalFile(res: ServerResponse, file: string): void {
  securityHeaders(res);
  res.writeHead(200, {
    'Content-Type': MIME[path.extname(file).toLowerCase()] || 'application/octet-stream',
    'Cache-Control': 'no-cache'
  });
  fs.createReadStream(file).pipe(res);
}

function proxyPath(target: URL): string {
  return PROXY_PREFIX + target.pathname.replace(/^\//, '') + target.search;
}

function rewriteTargetReferences(value: string, baseUrl: string): string {
  if (!value || /^(data:|blob:|mailto:|tel:|javascript:|#)/i.test(value)) return value;
  try {
    const absolute = new URLCtor(value, baseUrl);
    if (absolute.origin !== TARGET_ORIGIN) return value;
    return proxyPath(absolute);
  } catch { return value; }
}

function rewriteHtml(html: string, baseUrl: string): string {
  html = html.replace(/<base\b[^>]*>/gi, '');
  html = html.replace(/<meta\b[^>]*(?:http-equiv\s*=\s*["'](?:content-security-policy|x-frame-options|refresh)["'])[^>]*>/gi, '');

  const attrs = ['href', 'src', 'action', 'poster', 'formaction'];
  for (const attr of attrs) {
    const re = new RegExp(`(${attr}\\s*=\\s*["'])([^"']+)(["'])`, 'gi');
    html = html.replace(re, (match: string, prefix: string, value: string, quote: string) => {
      const rewritten = rewriteTargetReferences(value, baseUrl);
      return rewritten === value ? match : `${prefix}${rewritten}${quote}`;
    });
  }

  // Absolute URLs embedded in inline configuration or generated markup.
  html = html.split(TARGET_ORIGIN).join(PROXY_PREFIX.slice(0, -1));
  return html;
}

function rewriteTextAsset(body: string, baseUrl: string, contentType: string): string {
  if (contentType.includes('javascript') || contentType.includes('ecmascript')) {
    return body.split(TARGET_ORIGIN).join(PROXY_PREFIX.slice(0, -1));
  }
  if (contentType.includes('text/css')) {
    return body.replace(/url\(\s*(["']?)([^)"']+)\1\s*\)/gi, (match: string, quote: string, value: string) => {
      const rewritten = rewriteTargetReferences(value, baseUrl);
      return rewritten === value ? match : `url(${quote}${rewritten}${quote})`;
    }).split(TARGET_ORIGIN).join(PROXY_PREFIX.slice(0, -1));
  }
  return body;
}

function rewriteRedirect(location: string | undefined): string | undefined {
  if (!location) return undefined;
  try {
    const absolute = new URLCtor(location, TARGET);
    return absolute.origin === TARGET_ORIGIN ? proxyPath(absolute) : location;
  } catch { return location; }
}

function requestUpstream(options: Record<string, any>, body: Buffer | null, attempt = 1): Promise<any> {
  return new Promise((resolve, reject) => {
    const transport = options.protocol === 'http:' ? http : https;
    const upstream = transport.request({
      ...options,
      agent: options.protocol === 'http:' ? localAgent : upstreamAgent,
      family: options.protocol === 'http:' ? undefined : 4,
      servername: TARGET.hostname,
      timeout: UPSTREAM_TIMEOUT_MS
    }, (upstreamRes: any) => {
      const status = Number(upstreamRes.statusCode || 0);
      // Retry transient upstream/server failures. This is especially useful when
      // a free Render service is waking from sleep.
      if (status >= 500 && status <= 599 && attempt < UPSTREAM_RETRIES) {
        upstreamRes.resume();
        const delay = 700 * attempt;
        setTimeout(() => {
          requestUpstream(options, body, attempt + 1).then(resolve).catch(reject);
        }, delay);
        return;
      }
      resolve(upstreamRes);
    });

    upstream.on('timeout', () => upstream.destroy(Object.assign(new Error('Upstream request timed out'), { code: 'ETIMEDOUT' })));
    upstream.on('error', (error: Error & { code?: string }) => {
      if (attempt < UPSTREAM_RETRIES) {
        const delay = 700 * attempt;
        setTimeout(() => {
          requestUpstream(options, body, attempt + 1).then(resolve).catch(reject);
        }, delay);
      } else {
        reject(error);
      }
    });

    if (body && body.length) upstream.end(body);
    else upstream.end();
  });
}

function collectRequestBody(req: IncomingMessage): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    let total = 0;
    req.on('data', (chunk: Buffer) => {
      total += chunk.length;
      if (total > MAX_PROXY_BODY) {
        reject(Object.assign(new Error('Request body too large'), { code: 'E2BIG' }));
        req.destroy();
        return;
      }
      chunks.push(Buffer.from(chunk));
    });
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

async function proxy(req: IncomingMessage, res: ServerResponse, tail: string, search: string): Promise<void> {
  let target: URL;
  try {
    const cleanTail = tail.replace(/^\/+/, '');
    target = new URLCtor('/' + cleanTail + search, TARGET);
    if (target.origin !== TARGET_ORIGIN) throw new Error('Target not allowed');
  } catch {
    securityHeaders(res);
    res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Invalid Transcript Studio URL');
    return;
  }

  let body = Buffer.alloc(0);
  try {
    if (req.method && !['GET', 'HEAD'].includes(req.method.toUpperCase())) {
      body = await collectRequestBody(req);
    }
  } catch (error: any) {
    securityHeaders(res);
    res.writeHead(error?.code === 'E2BIG' ? 413 : 400, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ error: 'Invalid proxy request', message: error?.message || 'Unable to read request body' }));
    return;
  }

  const incomingHeaders = { ...req.headers };
  const headers: Record<string, any> = {
    accept: incomingHeaders.accept || 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'user-agent': incomingHeaders['user-agent'] || 'Mozilla/5.0 ScriptFlow-TranscriptProxy/1.0',
    host: TARGET.host,
    referer: TARGET.href,
    origin: TARGET_ORIGIN
  };
  if (incomingHeaders['content-type']) headers['content-type'] = incomingHeaders['content-type'];
  if (body.length) headers['content-length'] = body.length;

  try {
    const upstreamRes: any = await requestUpstream({
      protocol: 'http:', hostname: LOCAL_TRANSCRIPT.hostname, port: Number(LOCAL_TRANSCRIPT.port || 3101),
      path: target.pathname + target.search, method: req.method || 'GET', headers: {
        ...headers,
        host: `${LOCAL_TRANSCRIPT.hostname}:${LOCAL_TRANSCRIPT.port || 3101}`,
        referer: TARGET.href,
        origin: TARGET_ORIGIN
      }
    }, body);

    const responseHeaders: Record<string, any> = { ...upstreamRes.headers };
    delete responseHeaders['content-security-policy'];
    delete responseHeaders['content-security-policy-report-only'];
    delete responseHeaders['x-frame-options'];
    delete responseHeaders['content-length'];
    delete responseHeaders['content-encoding'];
    delete responseHeaders['transfer-encoding'];
    // Cookies from the remote app cannot safely be forwarded with the target's
    // domain. Keep them out of the ScriptFlow origin unless a future explicit
    // cookie-jar implementation is added.
    delete responseHeaders['set-cookie'];
    if (responseHeaders.location) responseHeaders.location = rewriteRedirect(responseHeaders.location);
    responseHeaders['cache-control'] = 'no-store';
    responseHeaders['x-content-type-options'] = 'nosniff';
    responseHeaders['x-scriptflow-transcript-upstream'] = String(upstreamRes.statusCode || 0);

    const contentType = String(upstreamRes.headers['content-type'] || '').toLowerCase();
    const textual = contentType.includes('text/html') || contentType.includes('application/xhtml') || contentType.includes('javascript') || contentType.includes('text/css');

    if (!textual || req.method === 'HEAD' || req.method === 'OPTIONS') {
      res.writeHead(upstreamRes.statusCode || 502, responseHeaders);
      upstreamRes.pipe(res);
      return;
    }

    let responseBody = '';
    let size = 0;
    upstreamRes.setEncoding('utf8');
    upstreamRes.on('data', (chunk: string) => {
      size += Buffer.byteLength(chunk, 'utf8');
      if (size <= MAX_PROXY_BODY) responseBody += chunk;
      else upstreamRes.destroy(new Error('Proxy response too large'));
    });
    upstreamRes.on('end', () => {
      try {
        const rewritten = contentType.includes('text/html') || contentType.includes('application/xhtml')
          ? rewriteHtml(responseBody, target.href)
          : rewriteTextAsset(responseBody, target.href, contentType);
        res.writeHead(upstreamRes.statusCode || 502, responseHeaders);
        res.end(rewritten);
      } catch (error) {
        console.error('[Transcript proxy rewrite]', error);
        if (!res.writableEnded) {
          res.writeHead(upstreamRes.statusCode || 502, responseHeaders);
          res.end(responseBody);
        }
      }
    });
    upstreamRes.on('error', (error: Error) => {
      if (!res.writableEnded) {
        securityHeaders(res);
        res.writeHead(502, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
        res.end(JSON.stringify({ error: 'Transcript Studio response failed', message: error.message }));
      }
    });
  } catch (error: any) {
    console.error('[Transcript proxy]', error?.code || '', error?.message || error);
    securityHeaders(res);
    res.writeHead(502, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-ScriptFlow-Proxy-Error': error?.code || 'UPSTREAM_ERROR' });
    res.end(JSON.stringify({
      error: 'Transcript Studio proxy unavailable',
      message: error?.message || 'The upstream Transcript Studio service could not be reached.',
      code: error?.code || 'UPSTREAM_ERROR',
      target: TARGET_ORIGIN,
      retries: UPSTREAM_RETRIES
    }));
  }
}

const server = http.createServer((req: IncomingMessage, res: ServerResponse) => {
  try {
    const requestUrl = new URLCtor(req.url || '/', 'http://localhost');
    const pathname = requestUrl.pathname;

    if (pathname.startsWith(PROXY_PREFIX)) {
      return proxy(req, res, pathname.slice(PROXY_PREFIX.length), requestUrl.search);
    }

    if (pathname === '/healthz') {
      securityHeaders(res);
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
      res.end(JSON.stringify({ ok: true, service: 'scriptflow-pro', transcriptBrowser: true }));
      return;
    }

    if (pathname === '/transcript-browser/__health') {
      // Diagnostic endpoint for Render-to-Render connectivity. It is intentionally
      // read-only and does not expose upstream response bodies.
      requestUpstream({
        protocol: 'http:', hostname: LOCAL_TRANSCRIPT.hostname, port: Number(LOCAL_TRANSCRIPT.port || 3101), path: '/api/health',
        method: 'GET', headers: {
          host: `${LOCAL_TRANSCRIPT.hostname}:${LOCAL_TRANSCRIPT.port || 3101}`,
          accept: 'application/json',
          'user-agent': 'ScriptFlow-TranscriptHealth/1.0'
        }
      }, null).then((upstreamRes: any) => {
        upstreamRes.resume();
        securityHeaders(res);
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
        res.end(JSON.stringify({ ok: true, upstreamStatus: upstreamRes.statusCode || 0, target: TARGET_ORIGIN }));
      }).catch((error: any) => {
        securityHeaders(res);
        res.writeHead(502, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
        res.end(JSON.stringify({ ok: false, target: TARGET_ORIGIN, code: error?.code || 'UPSTREAM_ERROR', message: error?.message || 'Upstream unavailable' }));
      });
      return;
    }

    serveLocal(res, pathname);
  } catch (error) {
    console.error('[ScriptFlow]', error);
    if (!res.headersSent) res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Internal Server Error');
  }
});

let transcriptChild: any = null;
try {
  transcriptChild = childProcess.spawn(process.execPath, [TRANSCRIPT_SERVER_SCRIPT], {
    env: { ...process.env, NODE_ENV: 'production', TRANSCRIPT_STUDIO_PORT: '3101', TRANSCRIPT_STUDIO_DIST: path.join(__dirname, 'transcript-studio') },
    stdio: 'inherit'
  });
  transcriptChild.on('exit', (code: any, signal: any) => console.warn(`[Transcript Studio] child server exited code=${code} signal=${signal}`));
} catch (error: any) {
  console.error('[Transcript Studio] failed to start embedded server:', error?.message || error);
}

const shutdown = () => {
  try { if (transcriptChild && !transcriptChild.killed) transcriptChild.kill('SIGTERM'); } catch {}
  try { server.close(() => process.exit(0)); } catch { process.exit(0); }
};
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

server.listen(PORT, '0.0.0.0', () => console.log(`ScriptFlow Pro listening on ${PORT}`));
