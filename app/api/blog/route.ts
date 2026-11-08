// Pulls the posts from the WellWheel blog on Substack so they can be read inside the app.
// Substack doesn't allow its pages to be shown in a frame, so we read its public RSS feed instead.
export const dynamic = 'force-dynamic'; // fetched when asked; Vercel's edge keeps a copy for 15 minutes
const revalidate = 900;

const FEED = process.env.BLOG_FEED || 'https://jamieth2032.substack.com/feed';

const decode = (s: string) => s
  .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'")
  .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n)).replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
  .replace(/&amp;/g, '&');
const field = (item: string, tag: string) => {
  const m = item.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`));
  if (!m) return '';
  const v = m[1].trim();
  const c = v.match(/^<!\[CDATA\[([\s\S]*)\]\]>$/);
  return c ? c[1] : decode(v);
};
// Keep the post's own formatting but drop anything that could run code
function clean(html: string) {
  return html
    .replace(/<(script|style|iframe|object|embed|form|input|button|textarea|select|noscript)[\s\S]*?<\/\1>/gi, '')
    .replace(/<(script|iframe|object|embed|input|button|link|meta)\b[^>]*\/?>/gi, '')
    .replace(/\s(on\w+|style|srcset|data-[\w-]+)\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/(href|src)\s*=\s*("|')\s*(javascript|data|vbscript):[^"']*\2/gi, '$1="#"')
    .replace(/<a\s/gi, '<a target="_blank" rel="noopener noreferrer" ');
}
const text = (html: string) => decode(html.replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();

export async function GET() {
  try {
    const r = await fetch(FEED, { headers: { 'User-Agent': 'WellWheel/1.0 (+https://wellwheel.vercel.app)', Accept: 'application/rss+xml, application/xml, text/xml' }, next: { revalidate } });
    if (!r.ok) throw new Error('feed ' + r.status);
    const xml = await r.text();
    const blog = field(xml.split('<item>')[0], 'title');
    const posts = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].map(([, it]) => {
      const content = field(it, 'content:encoded');
      const desc = field(it, 'description');
      const img = (it.match(/<enclosure[^>]+url="([^"]+)"/) || [])[1] || (content.match(/<img[^>]+src="([^"]+)"/) || [])[1] || '';
      return {
        id: field(it, 'guid') || field(it, 'link'),
        title: text(field(it, 'title')),
        link: field(it, 'link'),
        date: field(it, 'pubDate'),
        author: text(field(it, 'dc:creator')),
        summary: text(desc).slice(0, 240),
        image: decode(img),
        html: clean(content || desc),
      };
    });
    return Response.json({ blog: text(blog), posts }, { headers: { 'Cache-Control': 'public, s-maxage=900, stale-while-revalidate=86400' } });
  } catch (e) {
    return Response.json({ error: String(e), posts: [] }, { status: 502, headers: { 'Cache-Control': 'no-store' } });
  }
}
