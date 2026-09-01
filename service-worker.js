const CACHE_NAME = 'basketball-tactics-v2';
const urlsToCache = [
  './',
  './index.html',
  './basketball_court.png',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './fix-webm-duration.js',
  './ffmpeg/ffmpeg.js',
  './ffmpeg/814.ffmpeg.js',
  './ffmpeg/ffmpeg-core.js',
  './ffmpeg/ffmpeg-core.wasm'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(names => Promise.all(
        names.filter(name => name.startsWith('basketball-tactics-') && name !== CACHE_NAME)
          .map(name => caches.delete(name))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then(response => {
      if (response) return response;
      return fetch(event.request);
    })
  );
});
