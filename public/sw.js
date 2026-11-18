/* Cadence Studio Offline & App Shell Service Worker */
const CACHE_NAME = 'cadence-pwa-v1';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      cache
        .addAll([
          './',
          './index.html',
          './manifest.webmanifest',
          './icons/icon-192.png',
          './icons/icon-512.png',
        ])
        .catch(() => undefined)
    )
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE_NAME && k.startsWith('cadence-pwa-')).map((k) => caches.delete(k)))
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  // Never intercept cross-origin Auth, Firestore, or CDN APIs
  if (url.origin !== self.location.origin) return;

  // Network-first for HTML page navigations so new deployments apply right away
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((res) => {
          if (res && res.ok) {
            const copy = res.clone();
            void caches.open(CACHE_NAME).then((cache) => cache.put('./index.html', copy));
          }
          return res;
        })
        .catch(async () => {
          const cached = await caches.match('./index.html');
          return cached || Response.error();
        })
    );
    return;
  }

  // Stale-while-revalidate for same-origin static bundles, icons & manifest
  event.respondWith(
    caches.match(request).then((cached) => {
      const networkFetch = fetch(request)
        .then((res) => {
          if (res && res.ok && res.type === 'basic') {
            const copy = res.clone();
            void caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return res;
        })
        .catch(() => cached);

      return cached || networkFetch;
    })
  );
});
