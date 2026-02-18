const CACHE_NAME = 'baby-abc-v3-github';
const assets = [
  './',
  './index.html',
  './manifest.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(assets))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys => Promise.all(
            keys.map(key => {
                if (key !== CACHE_NAME) return caches.delete(key);
            })
        ))
    );
    return self.clients.claim();
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // ১. যদি রিকোয়েস্টটি GitHub এর ইমেজের জন্য হয় (.jpg)
  if (url.pathname.endsWith('.jpg') && url.hostname.includes('githubusercontent.com')) {
    event.respondWith(
      caches.open(CACHE_NAME).then(cache => {
        return cache.match(event.request).then(response => {
          // ক্যাশে থাকলে ক্যাশ থেকে দাও, না থাকলে ইন্টারনেট থেকে আনো এবং ক্যাশে রাখো
          return response || fetch(event.request).then(networkResponse => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
        });
      })
    );
  } 
  // ২. বাকি সব ফাইল (HTML, CSS)
  else {
    event.respondWith(
      caches.match(event.request).then(response => response || fetch(event.request))
    );
  }
});
