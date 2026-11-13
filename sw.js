/* Glass Sampler service worker: アプリ本体をプリキャッシュし、CDN(three.js / MediaPipe / Fonts)は実行時にキャッシュ */
const V = 'glass-sampler-v4', CORE = ['./', 'index.html', 'manifest.json', 'icon-192.png', 'icon-512.png'];
self.addEventListener('install', e => e.waitUntil(caches.open(V).then(c => c.addAll(CORE)).then(() => self.skipWaiting())));
self.addEventListener('activate', e => e.waitUntil(caches.keys().then(k => Promise.all(k.filter(x => x !== V).map(x => caches.delete(x)))).then(() => self.clients.claim())));
self.addEventListener('fetch', e => {
  const q = e.request;
  if (q.method !== 'GET' || !/^https?:/.test(q.url)) return;
  e.respondWith(caches.match(q).then(hit => {
    const net = fetch(q).then(r => {
      if (r && (r.ok || r.type === 'opaque')) { const cp = r.clone(); caches.open(V).then(c => c.put(q, cp)); }
      return r;
    }).catch(() => hit || (q.mode === 'navigate' ? caches.match('index.html') : undefined));
    return hit || net;
  }));
});
