// офлайн-режим: сначала сеть (чтобы обновления приходили сразу), без сети берём сохранённую копию
const CACHE = 'storm-hub-v5.2-v37';
const FONTS = ['fonts.googleapis.com', 'fonts.gstatic.com'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.add(new Request('./', { cache: 'reload' }))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k.startsWith('storm-hub-') && k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request, url = new URL(req.url);
  const own = url.origin === location.origin, font = FONTS.includes(url.hostname);
  if (req.method !== 'GET' || !(own || font)) return;   // ответы API не кэшируем
  const key = req.mode === 'navigate' ? './' : req;
  e.respondWith(fetch(req).then(res => {
    const isApp = req.mode !== 'navigate' || url.pathname === new URL('./', location).pathname || url.pathname.endsWith('/index.html');
    if (isApp && (res.ok || res.type === 'opaque')) {
      const copy = res.clone();
      e.waitUntil(caches.open(CACHE).then(c => c.put(key, copy)));
    }
    return res;
  }).catch(() => caches.match(key).then(hit => hit || Response.error())));
});
