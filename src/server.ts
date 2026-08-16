declare const require: any;
declare const process: any;
declare const __dirname: string;

const http: any = require('http');
const https: any = require('https');
const fs: any = require('fs');
const path: any = require('path');
const URLCtor: any = require('url').URL;
type IncomingMessage = any;
type ServerResponse = any;

const PORT = Number(process.env.PORT || 3000);
const PUBLIC_ROOT = path.join(__dirname);
const TARGET = new URLCtor('https://transcript-studio-n0nv.onrender.com/');
const PROXY_PREFIX = '/transcript-browser/';

const MIME: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.ogg': 'audio/ogg',
  '.m4a': 'audio/mp4',
};

function safeLocalPath(urlPath: string): string | null {
  let pathname: string;
  try {
    pathname = decodeURIComponent(urlPath);
  } catch {
    return null;
  }
  if (pathname.includes('\0')) return null;
  if (pathname === '/') pathname = '/index.html';
  const relative = pathname.replace(/^\/+/, '');
  const candidate = path.resolve(PUBLIC_ROOT, relative);
  if (candidate !== PUBLIC_ROOT && !candidate.startsWith(PUBLIC_ROOT + path.sep)) return null;
  return candidate;
}

function applySecurityHeaders(res: ServerResponse): void {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
}

function sendFile(res: ServerResponse, file: string): void {
  applySecurityHeaders(res);
  const ext = path.extname(file).toLowerCase();
  res.writeHead(200, {
    'Content-Type': MIME[ext] || 'application/octet-stream',
    'Cache-Control': 'no-cache',
    'X-Content-Type-Options': 'nosniff',
  });
  fs.createReadStream(file).pipe(res);
}

function serveLocal(req: IncomingMessage, res: ServerResponse, pathname: string): void {
  // Never expose TypeScript source, package files, build metadata, or server internals.
  const forbidden = /^(\/src|\/build-client|\/node_modules|\/\.git|\/package(?:-lock)?\.json|\/tsconfig|\/build\.mjs|\/server\.js|\/server\.ts)/i;
  if (forbidden.test(pathname)) {
    applySecurityHeaders(res);
    applySecurityHeaders(res);
    res.writeHead(404);
    res.end('Not Found');
    return;
  }

  const file = safeLocalPath(pathname);
  if (!file || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
    const index = path.join(PUBLIC_ROOT, 'index.html');
    if (fs.existsSync(index)) return sendFile(res, index);
    res.writeHead(404);
    res.end('Not Found');
    return;
  }
  sendFile(res, file);
}

function rewriteHtml(html: string, baseUrl: string): string {
  const origin = TARGET.origin;
  const attrs = ['href', 'src', 'action', 'poster'];
  for (const attr of attrs) {
    const re = new RegExp(`(${attr}\\s*=\\s*["'])(?!data:|javascript:|#)([^"']+)(["'])`, 'gi');
    html = html.replace(re, (_match, prefix: string, value: string, quote: string) => {
      try {
        const absolute = new URLCtor(value, baseUrl);
        if (absolute.origin === origin) {
          return `${prefix}${PROXY_PREFIX}${absolute.pathname.replace(/^\//, '')}${absolute.search}${absolute.hash}${quote}`;
        }
      } catch {
        // Leave malformed references untouched.
      }
      return _match;
    });
  }

  html = html.split(origin).join(PROXY_PREFIX.slice(0, -1));
  html = html.replace(/<base[^>]*>/gi, '');
  html = html.replace(/<meta[^>]+http-equiv=["']Content-Security-Policy[^>]*>/gi, '');
  html = html.replace(/<meta[^>]+http-equiv=["']X-Frame-Options[^>]*>/gi, '');
  return html;
}

function proxy(req: IncomingMessage, res: ServerResponse, tail: string, search: string): void {
  let target: URL;
  try {
    target = new URLCtor('/' + tail.replace(/^\/+/, '') + search, TARGET);
    if (target.origin !== TARGET.origin) throw new Error('Target not allowed');
  } catch {
    res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Invalid Transcript Studio URL');
    return;
  }

  const headers: Record<string, string | string[] | undefined> = { ...req.headers };
  headers.host = TARGET.host;
  headers.origin = TARGET.origin;
  headers.referer = TARGET.href;
  delete headers['content-length'];
  delete headers['accept-encoding'];
  delete headers['x-forwarded-for'];
  delete headers['x-forwarded-host'];
  delete headers['x-forwarded-proto'];

  const upstream = https.request({
    protocol: 'https:',
    hostname: target.hostname,
    port: 443,
    path: target.pathname + target.search,
    method: req.method,
    headers,
    timeout: 30000,
  }, (upstreamRes) => {
    const responseHeaders: Record<string, string | string[] | undefined> = { ...upstreamRes.headers };
    delete responseHeaders['content-security-policy'];
    delete responseHeaders['content-security-policy-report-only'];
    delete responseHeaders['x-frame-options'];
    delete responseHeaders['content-length'];
    delete responseHeaders['set-cookie'];
    responseHeaders['cache-control'] = 'no-store';
    responseHeaders['x-content-type-options'] = 'nosniff';

    const contentType = String(upstreamRes.headers['content-type'] || '').toLowerCase();
    res.writeHead(upstreamRes.statusCode || 502, responseHeaders);

    if (req.method === 'HEAD' || req.method === 'OPTIONS') {
      upstreamRes.resume();
      res.end();
      return;
    }

    if (contentType.includes('text/html') || contentType.includes('application/xhtml')) {
      let body = '';
      upstreamRes.setEncoding('utf8');
      upstreamRes.on('data', chunk => { body += chunk; });
      upstreamRes.on('end', () => res.end(rewriteHtml(body, target.href)));
    } else {
      upstreamRes.pipe(res);
    }
  });

  upstream.on('timeout', () => upstream.destroy(new Error('Transcript Studio request timed out')));
  upstream.on('error', (error: Error) => {
    if (res.headersSent) {
      res.destroy(error);
      return;
    }
    res.writeHead(502, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
    res.end(JSON.stringify({ error: 'Transcript Studio proxy failed', message: error.message }));
  });

  req.pipe(upstream);
}

const server = http.createServer((req, res) => {
  try {
    const requestUrl = new URLCtor(req.url || '/', 'http://localhost');
    const pathname = requestUrl.pathname;

    if (pathname.startsWith(PROXY_PREFIX)) {
      return proxy(req, res, pathname.slice(PROXY_PREFIX.length), requestUrl.search);
    }

    if (pathname === '/healthz') {
      applySecurityHeaders(res);
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
      res.end(JSON.stringify({ ok: true, service: 'scriptflow-pro' }));
      return;
    }

    serveLocal(req, res, pathname);
  } catch (error) {
    console.error('[ScriptFlow]', error);
    if (!res.headersSent) res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Internal Server Error');
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`ScriptFlow Pro listening on port ${PORT}`);
});
