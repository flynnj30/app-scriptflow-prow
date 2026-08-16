import fs from 'node:fs/promises';
import path from 'node:path';
import { build } from 'esbuild';

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

console.log(`Production build complete: ${files.length} client modules + server compiled.`);
