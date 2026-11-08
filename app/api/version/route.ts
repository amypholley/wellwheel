// Tells the app which version is live right now (compared against the version it was loaded with)
export const dynamic = 'force-dynamic';
export function GET() {
  return Response.json({ v: process.env.NEXT_PUBLIC_BUILD || '' }, { headers: { 'Cache-Control': 'no-store, max-age=0' } });
}
