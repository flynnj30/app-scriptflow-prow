import fs from 'node:fs/promises';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { build } from 'esbuild';

const root = process.cwd();
const dist = path.join(root, 'dist');
const clientBuild = path.join(root, 'build-client');
const npx = process.platform === 'win32' ? 'npx.cmd' : 'npx';

await fs.rm(dist, { recursive: true, force: true });
await fs.rm(clientBuild, { recursive: true, force: true });

execFileSync(npx, ['tsc', '-p', 'tsconfig.client.json'], { stdio: 'inherit' });
execFileSync(npx, ['tsc', '-p', 'tsconfig.server.json'], { stdio: 'inherit' });

await fs.mkdir(path.join(dist, 'js'), { recursive: true });
await fs.cp(clientBuild, path.join(dist, 'js'), { recursive: true });
await fs.copyFile(path.join(root, 'index.html'), path.join(dist, 'index.html'));
await fs.copyFile(path.join(root, 'style.css'), path.join(dist, 'style.css'));
await fs.rm(clientBuild, { recursive: true, force: true });

const clientFiles = (await fs.readdir(path.join(dist, 'js'))).filter(file => file.endsWith('.js'));
for (const file of clientFiles) {
  const input = path.join(dist, 'js', file);
  const output = `${input}.min`;
  await build({
    entryPoints: [input],
    outfile: output,
    format: 'iife',
    target: 'es2020',
    minify: true,
    sourcemap: false,
    legalComments: 'none',
  });
  await fs.rename(output, input);
}

console.log(`Production build complete: ${clientFiles.length} browser modules compiled and minified.`);
