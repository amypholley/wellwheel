// Service worker so WellWheel can be installed on a phone home screen.
// It never stores anything. Its job is to make sure a phone always opens the newest version:
// phones like to reopen an old saved copy of a page, so every page load is fetched fresh here.
// v3
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil((async () => {
  await self.clients.claim();
  // A tab still showing an older saved copy reloads once, now that this version is in charge
  const tabs = await self.clients.matchAll({ type: 'window' });
  tabs.forEach((c) => { try { c.navigate(c.url).catch(() => {}); } catch {} });
})()));
self.addEventListener('fetch', (e) => {
  if (e.request.mode !== 'navigate' || e.request.method !== 'GET') return;
  e.respondWith(fetch(e.request, { cache: 'no-store' }).catch(() => fetch(e.request)));
});
