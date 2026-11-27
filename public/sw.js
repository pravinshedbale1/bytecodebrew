/**
 * ByteCodeBrew service worker: makes repeat visits start fast.
 *
 * GitHub Pages only lets browsers cache files for 10 minutes, so every later visit re-checks
 * the ~20 files the app needs before it can start. Files under /assets/ have a content hash in
 * their name (a new deploy gives new names), so a copy can be kept and reused safely forever.
 * Only those are cached; pages (HTML) always come from the network, so a deploy is picked up at
 * once and points at its new asset names.
 */
const CACHE = 'bcb-assets-v1';
const MAX_ENTRIES = 600;     // old deploys' files are trimmed, oldest first

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    for (const key of await caches.keys()) if (key !== CACHE) await caches.delete(key);
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin || !url.pathname.startsWith('/assets/')) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const hit = await cache.match(req);
    if (hit) return hit;
    const res = await fetch(req);
    if (res.ok && res.type === 'basic') {
      event.waitUntil((async () => {
        await cache.put(req, res.clone());
        const keys = await cache.keys();
        for (let i = 0; i < keys.length - MAX_ENTRIES; i++) await cache.delete(keys[i]);
      })());
    }
    return res;
  })());
});
