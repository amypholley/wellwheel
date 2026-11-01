import { NextResponse } from 'next/server';
import { anonClient, configured, emailFor } from '@/lib/server/admin';

// Always answers "ok" so nobody can use this to find out who has an account.
export async function POST(req: Request) {
  if (!configured()) return NextResponse.json({ error: 'The app isn’t connected to Supabase yet.' }, { status: 500 });
  const { identifier } = await req.json().catch(() => ({}));
  const email = identifier ? await emailFor(String(identifier)) : null;
  if (email) {
    const origin = req.headers.get('origin') || new URL(req.url).origin;
    await anonClient().auth.resetPasswordForEmail(email, { redirectTo: origin + '/' });
  }
  return NextResponse.json({ ok: true });
}
