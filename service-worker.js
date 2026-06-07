const CACHE_NAME = 'basketball-tactics-v1';
const urlsToCache = [
  './',
  './index.html',
  './basketball_court.png',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  // ffmpeg 目录下的文件不经过 Service Worker 缓存，避免 wasm 加载问题
  if (url.pathname.startsWith('/ffmpeg/')) {
    return;
  }
  event.respondWith(
    caches.match(event.request).then(response => {
      if (response) return response;
      return fetch(event.request);
    })
  );
});
