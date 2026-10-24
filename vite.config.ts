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
 * redirects to the app root; public/spa-restore.js, loaded by index.html, restores the real URL.
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

/**
 * Content-Security-Policy for the built app. GitHub Pages cannot send response headers, so it
 * goes in a meta tag, which cannot carry frame-ancestors or a report-uri. Everything the app
 * loads is its own: bundled JS and CSS, self-hosted fonts (small ones inlined as data:
 * URLs by Vite), no network requests. Build only,
 * because the dev server needs inline scripts for React refresh.
 */
const CSP = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self'",
  "img-src 'self' data:",
  "font-src 'self' data:",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'none'",
].join('; ');

function contentSecurityPolicy(): Plugin {
  return {
    name: 'content-security-policy',
    apply: 'build',
    transformIndexHtml() {
      return [{ tag: 'meta', attrs: { 'http-equiv': 'Content-Security-Policy', content: CSP }, injectTo: 'head-prepend' }];
    },
  };
}

export default defineConfig({
  base,
  plugins: [react(), githubPagesSpaFallback(), contentSecurityPolicy()],
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
