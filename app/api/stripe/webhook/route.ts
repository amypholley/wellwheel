// Stripe calls this when someone subscribes, renews, or cancels. It turns Plus on or off.
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { adminClient, configured } from '@/lib/server/admin';

export const runtime = 'nodejs';

const periodEnd = (sub: any): string | null => {
  const end = sub?.items?.data?.[0]?.current_period_end ?? sub?.current_period_end;
  return end ? new Date(end * 1000).toISOString() : null;
};

export async function POST(req: Request) {
  const key = process.env.STRIPE_SECRET_KEY, secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!key || !secret || !configured()) return NextResponse.json({ error: 'Stripe is not set up' }, { status: 500 });
  const stripe = new Stripe(key);
  const body = await req.text();
  let event: Stripe.Event;
  try { event = stripe.webhooks.constructEvent(body, req.headers.get('stripe-signature') || '', secret); }
  catch { return NextResponse.json({ error: 'Bad signature' }, { status: 400 }); }

  const admin = adminClient();
  // Never overwrite permanent free Plus (owner accounts). Time-limited free Plus from a code can be replaced by a paid plan.
  const notComp = 'plus_status.is.null,plus_status.neq.comp,plus_until.not.is.null';
  try {
    if (event.type === 'checkout.session.completed') {
      const s = event.data.object as Stripe.Checkout.Session;
      const uid = s.client_reference_id;
      if (uid && s.subscription) {
        const subId = typeof s.subscription === 'string' ? s.subscription : s.subscription.id;
        // Which plan: the couples product has "Couple" in its name
        const items = await stripe.checkout.sessions.listLineItems(s.id, { limit: 5 });
        const plan = items.data.some((i) => /couple/i.test(i.description || '')) ? 'couple' : 'individual';
        const sub = await stripe.subscriptions.retrieve(subId);
        const { error } = await admin.from('profiles').update({
          plus_status: sub.status, plus_until: periodEnd(sub), plus_plan: plan,
          stripe_customer_id: typeof s.customer === 'string' ? s.customer : s.customer?.id, stripe_subscription_id: subId,
        }).eq('id', uid).or(notComp);
        if (error) throw error;
      }
    } else if (event.type === 'customer.subscription.updated' || event.type === 'customer.subscription.deleted') {
      const sub = event.data.object as Stripe.Subscription;
      const { error } = await admin.from('profiles').update({
        plus_status: event.type === 'customer.subscription.deleted' ? 'canceled' : sub.status, plus_until: periodEnd(sub),
      }).eq('stripe_subscription_id', sub.id).or(notComp);
      if (error) throw error;
    }
  } catch (e: any) {
    console.error('Stripe webhook error', e);
    return NextResponse.json({ error: 'Could not update' }, { status: 500 }); // Stripe will retry
  }
  return NextResponse.json({ received: true });
}
