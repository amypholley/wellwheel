import { NextResponse } from 'next/server';
import { adminClient, configured } from '@/lib/server/admin';

export async function POST(req: Request) {
  if (!configured()) return NextResponse.json({ error: 'Not configured' }, { status: 500 });
  const token = (req.headers.get('authorization') || '').replace(/^Bearer\s+/i, '');
  if (!token) return NextResponse.json({ error: 'Not signed in' }, { status: 401 });
  const admin = adminClient();
  const { data, error } = await admin.auth.getUser(token);
  if (error || !data.user) return NextResponse.json({ error: 'Not signed in' }, { status: 401 });
  // Remove their photos first (Phase 3)
  try {
    const store = admin.storage.from('photos');
    for (let round = 0; round < 50; round++) {
      const { data: files } = await store.list(data.user.id, { limit: 1000 });
      if (!files || !files.length) break;
      await store.remove(files.map((f) => `${data.user.id}/${f.name}`));
    }
  } catch {}
  // Deleting the login also deletes their profile, goals, journal and gratitude (set up in schema.sql)
  const del = await admin.auth.admin.deleteUser(data.user.id);
  if (del.error) return NextResponse.json({ error: del.error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
