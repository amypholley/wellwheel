// Minimal service worker so WellWheel can be installed on a phone home screen.
// It never stores anything: pages always come fresh from the network.
// v2: when this version takes over, a tab still showing an older saved copy of the app reloads once.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil((async () => {
  await self.clients.claim();
  const tabs = await self.clients.matchAll({ type: 'window' });
  tabs.forEach((c) => { try { c.navigate(c.url).catch(() => {}); } catch {} });
})()));
self.addEventListener('fetch', () => {});
