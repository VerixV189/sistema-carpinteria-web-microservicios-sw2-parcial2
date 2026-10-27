import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { resolve } from 'path';

// Build del microfrontend: un único ES module con los lifecycles single-spa.
export default defineConfig({
  plugins: [svelte()],
  resolve: {
    alias: { $lib: resolve(__dirname, 'src/lib') },
  },
  build: {
    outDir: 'dist-mfe',
    lib: {
      entry: resolve(__dirname, 'src/mfe.ts'),
      formats: ['es'],
      fileName: () => 'mfe.js',
    },
    rollupOptions: {
      output: { inlineDynamicImports: true },
    },
  },
});
