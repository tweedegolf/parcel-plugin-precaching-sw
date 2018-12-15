const caches = '%{caches}';
const cacheName = '%{cacheName}';
const offlineUrl = '%{offlineUrl}';

self.addEventListener('install', function(e) {
  e.waitUntil(caches.open(cacheName).then(function(cache) {
    cache.addAll(caches).then(() => self.skipWaiting());
  }));
});

self.addEventListener('activate', function(event) {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', function(event) {
  if (event.request.mode === 'navigate' || (event.request.method === 'GET' && event.request.headers.get('accept').includes('text/html'))) {
    event.respondWith(fetch(event.request.url).catch(function() {
      caches.match(offlineUrl);
    }));
  } else {
    event.respondWith(caches.match(event.request).then(response => response || fetch(event.request)));
  }
});
