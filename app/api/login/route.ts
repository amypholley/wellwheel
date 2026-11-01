import { NextResponse } from 'next/server';
import { anonClient, configured, emailFor } from '@/lib/server/admin';

export async function POST(req: Request) {
  if (!configured()) return NextResponse.json({ error: 'The app isn’t connected to Supabase yet.' }, { status: 500 });
  const { identifier, password } = await req.json().catch(() => ({}));
  const bad = NextResponse.json({ error: 'That username and password don’t match.' }, { status: 401 });
  if (!identifier || !password) return bad;
  const email = await emailFor(String(identifier));
  if (!email) return bad;
  const { data, error } = await anonClient().auth.signInWithPassword({ email, password: String(password) });
  if (error) {
    if (error.code === 'email_not_confirmed') return NextResponse.json({ error: 'Please confirm your email first. Check your inbox for the link we sent.' }, { status: 401 });
    if (error.status === 429) return NextResponse.json({ error: 'Too many tries. Wait a few minutes and try again.' }, { status: 429 });
    return bad;
  }
  return NextResponse.json({ access_token: data.session.access_token, refresh_token: data.session.refresh_token });
}
