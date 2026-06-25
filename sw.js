const CACHE_NAME = 'novcalc-v3';
const ASSETS = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './en.json',
  './ur.json',
  './assets/icons/logo-192.png',
  './assets/icons/logo-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
