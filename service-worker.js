const CACHE_NAME = 'basketball-tactics-v3';
const RUNTIME_CACHE_NAME = 'basketball-tactics-runtime-v1';
const urlsToCache = [
  './',
  './index.html',
  './basketball_court.png',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './fix-webm-duration.js',
  './ffmpeg/ffmpeg.js',
  './ffmpeg/814.ffmpeg.js'
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
        names.filter(name =>
          name.startsWith('basketball-tactics-') &&
          name !== CACHE_NAME &&
          name !== RUNTIME_CACHE_NAME
        )
          .map(name => caches.delete(name))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  const isFfmpegCore = url.pathname.endsWith('/ffmpeg/ffmpeg-core.js') ||
    url.pathname.endsWith('/ffmpeg/ffmpeg-core.wasm');

  event.respondWith(
    caches.match(event.request).then(response => {
      if (response) return response;
      return fetch(event.request).then(networkResponse => {
        if (isFfmpegCore && networkResponse.ok) {
          const copy = networkResponse.clone();
          caches.open(RUNTIME_CACHE_NAME).then(cache => cache.put(event.request, copy));
        }
        return networkResponse;
      });
    })
  );
});
