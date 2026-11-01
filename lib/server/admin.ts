// Server-only helpers. These use the secret key and never run in the browser.
import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
export const configured = () => !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY && process.env.SUPABASE_SERVICE_ROLE_KEY);
export const adminClient = () => createClient(url, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false, autoRefreshToken: false } });
export const anonClient = () => createClient(url, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, { auth: { persistSession: false, autoRefreshToken: false } });

// Turn a username into the account's email (kept on the server so emails are never revealed)
export async function emailFor(identifier: string): Promise<string | null> {
  const id = identifier.trim().toLowerCase();
  if (id.includes('@')) return id;
  if (!/^[a-z0-9_]{3,20}$/.test(id)) return null;
  const admin = adminClient();
  const { data } = await admin.from('profiles').select('id').eq('username', id).maybeSingle();
  if (!data) return null;
  const { data: u } = await admin.auth.admin.getUserById(data.id);
  return u?.user?.email ?? null;
}
