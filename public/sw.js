// Minimal service worker so WellWheel can be installed on a phone home screen.
// It always fetches fresh from the network (your data lives in Supabase).
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', () => {});
