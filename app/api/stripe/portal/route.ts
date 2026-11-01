// Opens the person's own Stripe page to cancel, change their card, or see receipts.
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { adminClient, configured } from '@/lib/server/admin';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key || !configured()) return NextResponse.json({ error: 'Stripe is not set up yet.' }, { status: 500 });
  const token = (req.headers.get('authorization') || '').replace(/^Bearer\s+/i, '');
  const admin = adminClient();
  const { data: u } = await admin.auth.getUser(token);
  if (!u?.user) return NextResponse.json({ error: 'Please log in again.' }, { status: 401 });
  const { data: prof } = await admin.from('profiles').select('stripe_customer_id').eq('id', u.user.id).maybeSingle();
  if (!prof?.stripe_customer_id) return NextResponse.json({ error: 'No subscription found for this account.' }, { status: 404 });
  const origin = req.headers.get('origin') || new URL(req.url).origin;
  try {
    const session = await new Stripe(key).billingPortal.sessions.create({ customer: prof.stripe_customer_id, return_url: origin + '/' });
    return NextResponse.json({ url: session.url });
  } catch {
    return NextResponse.json({ error: 'The subscription page isn’t available yet. Turn on the customer portal in Stripe settings.' }, { status: 500 });
  }
}
