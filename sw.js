const CACHE_NAME = 'cl-v3';
const BASE = self.location.pathname.replace('/sw.js', '');

const STATIC = [
  BASE + '/',
  BASE + '/index.html',
  BASE + '/manifest.json',
  BASE + '/css/main.css',
  BASE + '/js/data.js',
  BASE + '/js/storage.js',
  BASE + '/js/audio.js',
  BASE + '/js/notifications.js',
  BASE + '/js/health-connect.js',
  BASE + '/js/ai.js',
  BASE + '/js/app.js',
  BASE + '/assets/icons/icon-192.png',
  BASE + '/assets/icons/icon-512.png',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(c => c.addAll(STATIC.map(u => new Request(u, {cache: 'reload'}))))
      .catch(err => console.warn('Cache install partial:', err))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (url.hostname === 'api.anthropic.com') return;
  if (url.hostname.includes('spotify.com')) return;
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    e.respondWith(
      caches.match(e.request).then(cached => {
        if (cached) return cached;
        return fetch(e.request).then(resp => {
          const clone = resp.clone();
          caches.open(CACHE_NAME).then(c => c.put(e.request, clone));
          return resp;
        }).catch(() => cached);
      })
    );
    return;
  }
  e.respondWith(
    caches.match(e.request).then(cached => {
      const net = fetch(e.request).then(resp => {
        if (resp && resp.status === 200) {
          const clone = resp.clone();
          caches.open(CACHE_NAME).then(c => c.put(e.request, clone));
        }
        return resp;
      }).catch(() => cached || new Response('Offline', {status: 503}));
      return cached || net;
    })
  );
});

self.addEventListener('push', e => {
  if (!e.data) return;
  try {
    const d = e.data.json();
    e.waitUntil(
      self.registration.showNotification(d.title, {
        body: d.body,
        icon: BASE + '/assets/icons/icon-192.png',
        badge: BASE + '/assets/icons/icon-192.png',
        tag: d.tag || 'cl',
        data: d.data || {},
        requireInteraction: d.persistent || false,
        actions: d.actions || []
      })
    );
  } catch(err) {}
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(
    clients.matchAll({type:'window', includeUncontrolled:true}).then(list => {
      if (list.length > 0) { list[0].focus(); return; }
      clients.openWindow(BASE + '/index.html');
    })
  );
});

self.addEventListener('sync', e => {
  if (e.tag === 'ai-sync') {
    e.waitUntil(
      caches.open('cl-ai-queue').then(c => c.keys()).then(reqs =>
        Promise.all(reqs.map(r => fetch(r).then(resp => resp.ok && caches.open('cl-ai-queue').then(c => c.delete(r))).catch(()=>{})))
      )
    );
  }
});
