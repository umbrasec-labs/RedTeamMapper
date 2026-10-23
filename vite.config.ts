import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

/**
 * Base path the site is served from.
 * - Project site (https://<user>.github.io/RedTeamMapper/): '/RedTeamMapper/' (default)
 * - User/org site or custom domain at the root:             VITE_BASE=/ npm run build
 */
const base = process.env.VITE_BASE ?? '/RedTeamMapper/';

/**
 * GitHub Pages has no SPA rewrites, so a deep link like /RedTeamMapper/flows/phishing
 * hits a 404. This emits a 404.html that encodes the path into the query string and
 * redirects to the app root; a small script in index.html restores the real URL.
 * (Technique from rafgraph/spa-github-pages.)
 */
function githubPagesSpaFallback(): Plugin {
  return {
    name: 'github-pages-spa-fallback',
    apply: 'build',
    generateBundle() {
      const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Red Team Mapper</title>
    <script>
      (function () {
        var base = ${JSON.stringify(base)};
        var l = window.location;
        var rest = l.pathname.indexOf(base) === 0 ? l.pathname.slice(base.length) : l.pathname.replace(/^\\//, '');
        l.replace(
          l.protocol + '//' + l.host + base + '?/' +
          rest.replace(/&/g, '~and~') +
          (l.search ? '&' + l.search.slice(1).replace(/&/g, '~and~') : '') +
          l.hash
        );
      })();
    </script>
  </head>
  <body></body>
</html>
`;
      this.emitFile({ type: 'asset', fileName: '404.html', source: html });
    },
  };
}

export default defineConfig({
  base,
  plugins: [react(), githubPagesSpaFallback()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  build: {
    target: 'es2020',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          motion: ['framer-motion'],
          flow: ['@xyflow/react'],
        },
      },
    },
  },
  esbuild: {
    // Keep production bundles free of stray debug output.
    drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : [],
  },
});
