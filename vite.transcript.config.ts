import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'node:path';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    outDir: path.resolve(__dirname, 'dist/transcript-studio'),
    emptyOutDir: true,
    lib: {
      entry: path.resolve(__dirname, 'src/transcript-studio/mount.tsx'),
      name: 'TranscriptStudioApp',
      formats: ['iife'],
      fileName: () => 'transcript-studio.js',
      cssFileName: 'transcript-studio.css'
    },
    rollupOptions: {
      output: { inlineDynamicImports: true }
    },
    sourcemap: false,
    minify: 'esbuild'
  }
});
