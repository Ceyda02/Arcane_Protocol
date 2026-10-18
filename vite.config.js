import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { createHash } from 'node:crypto';
import { readdirSync, writeFileSync } from 'node:fs';
import { relative, resolve, sep } from 'node:path';

function offlineServiceWorker() {
  return {
    name: 'arcane-offline-service-worker',
    apply: 'build',
    closeBundle() {
      const outputDirectory = resolve('dist');
      const files = [];
      const visit = (directory) => {
        for (const entry of readdirSync(directory, { withFileTypes: true })) {
          const fullPath = resolve(directory, entry.name);
          if (entry.isDirectory()) visit(fullPath);
          else if (entry.name !== 'service-worker.js') files.push(fullPath);
        }
      };
      visit(outputDirectory);

      const assets = files
        .map((file) => `./${relative(outputDirectory, file).split(sep).join('/')}`)
        .sort();
      const version = createHash('sha256').update(assets.join('\n')).digest('hex').slice(0, 12);
      const worker = `
const CACHE_PREFIX = 'arcane-protocol-';
const CACHE_NAME = CACHE_PREFIX + '${version}';
const PRECACHE_URLS = ${JSON.stringify(assets)};

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys
        .filter((key) => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME)
        .map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => caches.match('./index.html')),
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => cached || fetch(request)),
  );
});
`;
      writeFileSync(resolve(outputDirectory, 'service-worker.js'), worker);
    },
  };
}

export default defineConfig({
  plugins: [react(), offlineServiceWorker()],
  base: './',
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/tests/setup.js'],
    css: false,
  },
});
