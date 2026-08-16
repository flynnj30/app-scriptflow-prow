declare const require: any;
declare const process: any;
declare const __dirname: string;

const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const URLCtor = require('url').URL;

type IncomingMessage = any;
type ServerResponse = any;

const PORT = Number(process.env.PORT || 3000);
const PUBLIC_ROOT = path.join(__dirname);
const TARGET = new URLCtor('https://transcript-studio-n0nv.onrender.com/');
const TARGET_ORIGIN = TARGET.origin;
const PROXY_PREFIX = '/transcript-browser/';
const MAX_PROXY_BODY = 15 * 1024 * 1024;

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

function proxy(req: IncomingMessage, res: ServerResponse, tail: string, search: string): void {
  let target: URL;
  try {
    const cleanTail = tail.replace(/^\/+/, '');
    target = new URLCtor('/' + cleanTail + search, TARGET);
    if (target.origin !== TARGET_ORIGIN) throw new Error('Target not allowed');
  } catch {
    res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Invalid Transcript Studio URL'); return;
  }

  const headers: Record<string, any> = { ...req.headers };
  headers.host = TARGET.host;
  headers.origin = TARGET_ORIGIN;
  headers.referer = TARGET.href;
  delete headers['content-length'];
  delete headers['accept-encoding'];
  delete headers['x-forwarded-for'];
  delete headers['x-forwarded-host'];
  delete headers['x-forwarded-proto'];
  delete headers['connection'];

  const upstream = https.request({
    protocol: 'https:', hostname: target.hostname, port: 443,
    path: target.pathname + target.search, method: req.method || 'GET', headers,
    timeout: 45000
  }, (upstreamRes: any) => {
    const responseHeaders: Record<string, any> = { ...upstreamRes.headers };
    delete responseHeaders['content-security-policy'];
    delete responseHeaders['content-security-policy-report-only'];
    delete responseHeaders['x-frame-options'];
    delete responseHeaders['content-length'];
    delete responseHeaders['content-encoding'];
    delete responseHeaders['set-cookie'];
    if (responseHeaders.location) responseHeaders.location = rewriteRedirect(responseHeaders.location);
    responseHeaders['cache-control'] = 'no-store';
    responseHeaders['x-content-type-options'] = 'nosniff';

    const contentType = String(upstreamRes.headers['content-type'] || '').toLowerCase();
    const textual = contentType.includes('text/html') || contentType.includes('application/xhtml') || contentType.includes('javascript') || contentType.includes('text/css');

    res.writeHead(upstreamRes.statusCode || 502, responseHeaders);
    if (req.method === 'HEAD' || req.method === 'OPTIONS') { upstreamRes.resume(); res.end(); return; }

    if (!textual) return upstreamRes.pipe(res);

    let body = '';
    let size = 0;
    upstreamRes.setEncoding('utf8');
    upstreamRes.on('data', (chunk: string) => {
      size += Buffer.byteLength(chunk, 'utf8');
      if (size <= MAX_PROXY_BODY) body += chunk;
      else upstreamRes.destroy(new Error('Proxy response too large'));
    });
    upstreamRes.on('end', () => {
      try {
        const rewritten = contentType.includes('text/html') || contentType.includes('application/xhtml')
          ? rewriteHtml(body, target.href)
          : rewriteTextAsset(body, target.href, contentType);
        res.end(rewritten);
      } catch (error) {
        console.error('[Transcript proxy rewrite]', error);
        if (!res.writableEnded) res.end(body);
      }
    });
    upstreamRes.on('error', (error: Error) => {
      if (!res.writableEnded) res.end(JSON.stringify({ error: error.message }));
    });
  });

  upstream.on('timeout', () => upstream.destroy(new Error('Transcript Studio request timed out')));
  upstream.on('error', (error: Error) => {
    console.error('[Transcript proxy]', error.message);
    if (res.headersSent) { res.destroy(error); return; }
    securityHeaders(res);
    res.writeHead(502, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
    res.end(JSON.stringify({ error: 'Transcript Studio proxy unavailable', message: error.message }));
  });

  let bodyBytes = 0;
  req.on('data', (chunk: Buffer) => {
    bodyBytes += chunk.length;
    if (bodyBytes > MAX_PROXY_BODY) upstream.destroy(new Error('Request body too large'));
  });
  req.pipe(upstream);
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

    serveLocal(res, pathname);
  } catch (error) {
    console.error('[ScriptFlow]', error);
    if (!res.headersSent) res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Internal Server Error');
  }
});

server.listen(PORT, '0.0.0.0', () => console.log(`ScriptFlow Pro listening on ${PORT}`));
