/** @type {import('next').NextConfig} */
// A label for this build, so an app left open on a phone can tell when a newer version has been published
const BUILD = process.env.VERCEL_GIT_COMMIT_SHA || String(Date.now());
const nextConfig = { reactStrictMode: true, env: { NEXT_PUBLIC_BUILD: BUILD } };
export default nextConfig;
