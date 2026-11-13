import { defineConfig } from 'vite';

// Vite is the tool that runs the game in your browser while you develop,
// and bundles everything into the `dist/` folder when you build for release.
export default defineConfig({
  server: {
    host: true, // lets you open the game from your phone on the same Wi-Fi
    port: 5173,
  },
  build: {
    target: 'es2020',
    sourcemap: true,
  },
});
