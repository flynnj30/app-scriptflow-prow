import fs from 'node:fs/promises';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { build } from 'esbuild';

const root = process.cwd();
const dist = path.join(root, 'dist');
const clientBuild = path.join(root, 'build-client');
const tsc = path.join(root, 'node_modules', '.bin', process.platform === 'win32' ? 'tsc.cmd' : 'tsc');

await fs.rm(dist, { recursive: true, force: true });
await fs.rm(clientBuild, { recursive: true, force: true });

execFileSync(tsc, ['-p', 'tsconfig.client.json'], { stdio: 'inherit' });
execFileSync(tsc, ['-p', 'tsconfig.server.json'], { stdio: 'inherit' });

await fs.mkdir(path.join(dist, 'assets'), { recursive: true });
await fs.copyFile(path.join(root, 'index.html'), path.join(dist, 'index.html'));
await fs.copyFile(path.join(root, 'style.css'), path.join(dist, 'style.css'));

const template = await fs.readFile(path.join(root, 'src/client/template.html'), 'utf8');
const escapedTemplate = JSON.stringify(template);
const bootstrap = `
(() => {
  'use strict';
  const dependencies = [
    ['https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js', false],
    ['https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js', false],
    ['https://cdn.jsdelivr.net/npm/sortablejs@1.15.0/Sortable.min.js', false],
    ['https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js', false],
    ['https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore-compat.js', false],
    ['https://www.gstatic.com/firebasejs/9.22.0/firebase-auth-compat.js', false]
  ];
  const css = [
    'https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,300;400;500;600;700;800&display=swap',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
    '/style.css'
  ];
  const loadScript = (src) => new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = src;
    s.async = false;
    s.onload = resolve;
    s.onerror = () => reject(new Error('Failed to load dependency'));
    document.head.appendChild(s);
  });
  const loadCss = (href) => {
    const l = document.createElement('link');
    l.rel = 'stylesheet';
    l.href = href;
    document.head.appendChild(l);
  };
  async function start() {
    css.forEach(loadCss);
    document.getElementById('app').innerHTML = ${escapedTemplate};
    for (const [src] of dependencies) await loadScript(src);
    const core = document.createElement('script');
    core.src = '/assets/runtime.min.js';
    core.defer = false;
    document.body.appendChild(core);
  }
  start().catch(() => {
    document.getElementById('app').innerHTML = '<div style="font-family:system-ui;padding:40px">ScriptFlow Pro could not load. Please refresh.</div>';
  });
})();
`;
await fs.writeFile(path.join(dist, 'assets', 'app.js'), bootstrap, 'utf8');

const moduleOrder = [
  'firebase-config.js',
  'loading.js',
  'objection-handler.js',
  'notifications.js',
  'ics-calendar-sync.js',
  'app.js',
  'transcript-studio.js'
];
const chunks = [];
for (const file of moduleOrder) {
  const p = path.join(clientBuild, 'js', file);
  chunks.push(`\n/* ${file} */\n`, await fs.readFile(p, 'utf8'));
}
await fs.writeFile(path.join(dist, 'assets', 'runtime.js'), chunks.join('\n'), 'utf8');

for (const [inputName, outputName] of [['app.js','app.min.js'], ['runtime.js','runtime.min.js']]) {
  await build({
    entryPoints: [path.join(dist, 'assets', inputName)],
    outfile: path.join(dist, 'assets', outputName),
    format: 'iife',
    target: 'es2020',
    minify: true,
    sourcemap: false,
    legalComments: 'none',
  });
}
await fs.rm(path.join(dist, 'assets', 'app.js'), {force:true});
await fs.rm(path.join(dist, 'assets', 'runtime.js'), {force:true});
await fs.rm(clientBuild, {recursive:true, force:true});

console.log('Production build complete. Public HTML is a minimal shell; TypeScript source and source maps are not deployed.');
