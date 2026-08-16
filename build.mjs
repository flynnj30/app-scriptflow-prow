import fs from 'node:fs/promises';
import path from 'node:path';
import { build } from 'esbuild';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const dist = path.join(root, 'dist');

await fs.rm(dist, { recursive: true, force: true });
await fs.mkdir(path.join(dist, 'js'), { recursive: true });

// Compile the server directly from TypeScript. No TypeScript CLI or source maps
// are required in production, which keeps the deployed surface smaller.
await build({
  entryPoints: [path.join(root, 'src/server.ts')],
  outfile: path.join(dist, 'server.js'),
  platform: 'node',
  target: 'node20',
  format: 'cjs',
  bundle: false,
  minify: true,
  sourcemap: false,
  legalComments: 'none'
});

const clientRoot = path.join(root, 'src/client/js');
const files = (await fs.readdir(clientRoot)).filter((file) => file.endsWith('.ts'));
for (const file of files) {
  await build({
    entryPoints: [path.join(clientRoot, file)],
    outfile: path.join(dist, 'js', file.replace(/\.ts$/, '.js')),
    format: 'iife',
    platform: 'browser',
    target: 'es2020',
    bundle: false,
    minify: true,
    sourcemap: false,
    legalComments: 'none'
  });
}

await fs.copyFile(path.join(root, 'index.html'), path.join(dist, 'index.html'));
await fs.copyFile(path.join(root, 'style.css'), path.join(dist, 'style.css'));

// Build the complete Transcript Studio application from the supplied source.
const transcriptRoot = path.join(root, 'transcript-studio-source');
const transcriptDist = path.join(dist, 'transcript-studio');
await fs.rm(transcriptDist, { recursive: true, force: true });
await fs.mkdir(transcriptDist, { recursive: true });

const viteResult = spawnSync(process.platform === 'win32' ? 'npx.cmd' : 'npx', [
  'vite', 'build', '--config', path.join(transcriptRoot, 'vite.config.ts'),
  '--outDir', transcriptDist, '--emptyOutDir'
], { stdio: 'inherit', cwd: root });
if (viteResult.status !== 0) throw new Error('Transcript Studio frontend build failed.');

await build({
  entryPoints: [path.join(transcriptRoot, 'server.ts')],
  outfile: path.join(dist, 'transcript-server.cjs'),
  platform: 'node',
  target: 'node20',
  format: 'cjs',
  bundle: true,
  minify: true,
  sourcemap: false,
  legalComments: 'none',
  external: ['express', 'multer', '@google/genai']
});

console.log(`Production build complete: ${files.length} CRM client modules + ScriptFlow server + embedded Transcript Studio.`);
