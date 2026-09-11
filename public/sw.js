// Lumina Tarot Service Worker (Resilient Offline Cache & Network-First HTML Shell)
const CACHE_NAME = 'lumina-tarot-v3.0';

const OFFLINE_ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icon.svg',
  './robots.txt'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(OFFLINE_ASSETS).catch((err) => {
        console.warn('Pre-caching offline assets notice:', err);
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key.startsWith('lumina-tarot-') && key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = event.request.url;
  if (new URL(url).origin !== self.location.origin) return;

  // Skip external APIs
  if (url.includes('workers.dev') || url.includes('googleapis.com') || url.includes('gstatic.com')) {
    return;
  }

  // Network-First for HTML navigation to prevent stale chunk hash mismatch on new deployments
  if (event.request.mode === 'navigate' || url.endsWith('.html') || url.endsWith('/')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => caches.match(event.request).then((res) => res || caches.match('./index.html')))
    );
    return;
  }

  // Cache-first with network fallback for static hashed assets
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) {
        return cached;
      }
      return fetch(event.request).then((response) => {
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        return response;
      }).catch(() => {
        // If chunk failed to fetch and is not in cache, return 404 so lazyWithRetry triggers reload
        return new Response('Asset not found', { status: 404, statusText: 'Not Found' });
      });
    })
  );
});
