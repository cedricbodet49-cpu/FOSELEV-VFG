const CACHE = 'foselev-vfg-public-20261029-referentiel-complet';

const ASSETS = [
  './',
  './index.html',
  './style.css?v=V8A353-FINITION-VISUELLE',
  './manifest.webmanifest',
  './parc.json',
  './parc.js?v=PUBLIC-20261029-REFERENTIEL-COMPLET',
  './agences.js',
  './contacts-agences.js',
  './app-v4.0.js?v=PUBLIC-20261029-REFERENTIEL-COMPLET',
  './lib/html2pdf.bundle.min.js',
  './icon-192.svg',
  './icon-512.svg'
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)));
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  // Ne jamais mettre en cache les reponses SQLite (donnees vivantes).
  if (new URL(event.request.url).pathname.startsWith('/api/')) return;
  event.respondWith(
    fetch(event.request)
      .then(response => {
        const copy = response.clone();
        caches.open(CACHE).then(cache => cache.put(event.request, copy));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
