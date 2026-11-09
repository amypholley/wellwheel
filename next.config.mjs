/** @type {import('next').NextConfig} */
// A label for this build, so an app left open on a phone can tell when a newer version has been published
const BUILD = process.env.VERCEL_GIT_COMMIT_SHA || String(Date.now());
// Pages and the service worker are never kept by the phone, so it can't reopen an old copy of the app
const fresh = [{ key: 'Cache-Control', value: 'no-store, max-age=0' }];
const nextConfig = {
  reactStrictMode: true, env: { NEXT_PUBLIC_BUILD: BUILD },
  async headers() { return [{ source: '/', headers: fresh }, { source: '/sw.js', headers: fresh }, { source: '/privacy', headers: fresh }, { source: '/terms', headers: fresh }]; },
};
export default nextConfig;
