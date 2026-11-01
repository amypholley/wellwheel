// Stripe calls this when someone subscribes, renews, or cancels. It turns Plus on or off.
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { adminClient, configured } from '@/lib/server/admin';

export const runtime = 'nodejs';

const periodEnd = (sub: any): string | null => {
  const end = sub?.items?.data?.[0]?.current_period_end ?? sub?.current_period_end;
  return end ? new Date(end * 1000).toISOString() : null;
};

// "Share with a friend": when a friend who signed up with someone's link pays for Plus,
// that person gets their next month free (once per friend; free-code checkouts don't count).
async function rewardReferrer(admin: any, stripe: Stripe, friendId: string, amountPaid: number) {
  if (!amountPaid) return;
  const now = new Date().toISOString();
  // Claim the reward first so it can never be given twice
  const { data: ref } = await admin.from('referrals').update({ rewarded_at: now, reward: 'pending' })
    .eq('referred_id', friendId).is('rewarded_at', null).select().maybeSingle();
  if (!ref) return;
  const { data: rp } = await admin.from('profiles').select('*').eq('id', ref.referrer_id).maybeSingle();
  let note = 'no account';
  try {
  if (rp) {
    if (rp.plus_status === 'comp' && !rp.plus_until) note = 'already has permanent Plus';
    else if (rp.stripe_subscription_id && rp.stripe_customer_id && ['active', 'trialing', 'past_due'].includes(rp.plus_status)) {
      // Paying member: credit one month's price, so their next bill is covered
      const sub = await stripe.subscriptions.retrieve(rp.stripe_subscription_id);
      const amount = sub.items.data[0]?.price?.unit_amount || 599;
      await stripe.customers.createBalanceTransaction(rp.stripe_customer_id, { amount: -amount, currency: sub.currency || 'usd', description: 'WellWheel: a friend joined Plus, so your next month is free' });
      note = `credit ${(amount / 100).toFixed(2)}`;
    } else {
      // Free account or free code: add 30 days of Plus
      const base = rp.plus_status === 'comp' && rp.plus_until && new Date(rp.plus_until) > new Date() ? new Date(rp.plus_until) : new Date();
      const until = new Date(base.getTime() + 30 * 864e5).toISOString();
      await admin.from('profiles').update({ plus_status: 'comp', plus_plan: rp.plus_plan || 'individual', plus_until: until }).eq('id', rp.id);
      note = '30 free days of Plus';
    }
  }
  } catch (e) {
    // Undo the claim so Stripe's automatic retry can give the reward
    await admin.from('referrals').update({ rewarded_at: null, reward: null }).eq('referred_id', friendId);
    throw e;
  }
  await admin.from('referrals').update({ reward: note }).eq('referred_id', friendId);
}

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
        await rewardReferrer(admin, stripe, uid, s.amount_total || 0);
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
