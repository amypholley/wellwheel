-- =====================================================================
-- WellWheel Phase 5 database update: WellWheel Plus (Stripe).
-- Paste into Supabase -> SQL Editor -> New query -> Run. Only needed once.
-- Stripe tells the app when someone pays or cancels; the app records it here.
-- People can't change these columns themselves (only the app's server can).
-- =====================================================================

alter table public.profiles add column if not exists plus_status text;           -- active, trialing, past_due, canceled, comp
alter table public.profiles add column if not exists plus_plan text;             -- individual or couple
alter table public.profiles add column if not exists plus_until timestamptz;     -- end of the paid period
alter table public.profiles add column if not exists stripe_customer_id text;
alter table public.profiles add column if not exists stripe_subscription_id text;
create index if not exists profiles_stripe_customer_idx on public.profiles(stripe_customer_id);
create index if not exists profiles_stripe_sub_idx on public.profiles(stripe_subscription_id);

-- Is one person's Plus currently on?
create or replace function public.plus_active(p public.profiles) returns boolean
language sql stable set search_path = public as $$
  select p.plus_status = 'comp'
      or (p.plus_status in ('active', 'trialing', 'past_due') and (p.plus_until is null or p.plus_until > now() - interval '3 days'));
$$;

-- My Plus status. A couples plan paid by either partner covers both.
create or replace function public.my_plus() returns json
language sql stable security definer set search_path = public as $$
  select case
    when public.plus_active(me) then json_build_object('plus', true, 'source', 'me', 'plan', coalesce(me.plus_plan, 'individual'), 'status', me.plus_status, 'until', me.plus_until, 'can_manage', me.stripe_customer_id is not null)
    when p.id is not null and public.plus_active(p) and coalesce(p.plus_plan, '') = 'couple' then json_build_object('plus', true, 'source', 'partner', 'plan', 'couple', 'status', p.plus_status, 'until', p.plus_until, 'can_manage', false, 'paid_by', p.display_name)
    else json_build_object('plus', false, 'status', me.plus_status, 'can_manage', me.stripe_customer_id is not null)
  end
  from public.profiles me
  left join public.profiles p on me.couple_id is not null and p.couple_id = me.couple_id and p.id <> me.id
  where me.id = auth.uid();
$$;
grant execute on function public.my_plus() to authenticated;
