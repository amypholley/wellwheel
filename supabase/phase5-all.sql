-- =====================================================================
-- WellWheel: everything after Phase 4, in one file (Plus, Plus codes, feedback, share with a friend).
-- Safe to run even if you already ran phase5.sql, phase5b.sql, feedback.sql, or referrals.sql.
-- Paste into Supabase -> SQL Editor -> New query -> Run.
-- =====================================================================

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

-- =====================================================================
-- WellWheel Plus codes (e.g. FRIEND = one free year of Plus).
-- Paste into Supabase -> SQL Editor -> New query -> Run. Only needed once.
-- =====================================================================

-- Free Plus ("comp") can now have an end date. No end date = permanent (owner accounts).
create or replace function public.plus_active(p public.profiles) returns boolean
language sql stable set search_path = public as $$
  select (p.plus_status = 'comp' and (p.plus_until is null or p.plus_until > now()))
      or (p.plus_status in ('active', 'trialing', 'past_due') and (p.plus_until is null or p.plus_until > now() - interval '3 days'));
$$;

-- Codes people can enter in their profile
create table if not exists public.plus_codes (
  code        text primary key,               -- stored in capitals, e.g. FRIEND
  plan        text not null default 'couple', -- couple = also covers a connected partner
  days        int  not null default 365,      -- how long the free Plus lasts
  max_uses    int,                            -- null = unlimited
  uses        int  not null default 0,
  active      boolean not null default true,  -- set to false to turn a code off
  created_at  timestamptz not null default now()
);
create table if not exists public.plus_redemptions (
  code        text not null references public.plus_codes(code) on delete cascade,
  user_id     uuid not null references auth.users(id) on delete cascade,
  redeemed_at timestamptz not null default now(),
  primary key (code, user_id)
);
alter table public.plus_codes enable row level security;        -- nobody can list the codes
alter table public.plus_redemptions enable row level security;

create or replace function public.redeem_plus_code(code text) returns json
language plpgsql security definer set search_path = public as $$
declare c public.plus_codes; me public.profiles; new_until timestamptz;
begin
  select * into me from public.profiles where id = auth.uid();
  if me.id is null then raise exception 'Please log in first.'; end if;
  select * into c from public.plus_codes where plus_codes.code = upper(trim(redeem_plus_code.code));
  if c.code is null or not c.active then raise exception 'That code isn’t valid. Check the spelling and try again.'; end if;
  if c.max_uses is not null and c.uses >= c.max_uses then raise exception 'That code has been used up.'; end if;
  if exists (select 1 from public.plus_redemptions r where r.code = c.code and r.user_id = me.id) then raise exception 'You’ve already used that code.'; end if;
  if me.plus_status = 'comp' and me.plus_until is null then raise exception 'You already have Plus.'; end if;
  if me.plus_status in ('active', 'trialing', 'past_due') and public.plus_active(me) then raise exception 'You already have a Plus subscription.'; end if;

  new_until := greatest(now(), coalesce(case when me.plus_status = 'comp' then me.plus_until end, now())) + make_interval(days => c.days);
  update public.profiles set plus_status = 'comp', plus_plan = c.plan, plus_until = new_until where id = me.id;
  insert into public.plus_redemptions (code, user_id) values (c.code, me.id);
  update public.plus_codes set uses = uses + 1 where plus_codes.code = c.code;
  return json_build_object('until', new_until, 'plan', c.plan);
end $$;
grant execute on function public.redeem_plus_code(text) to authenticated;

-- The FRIEND code: one free year of Plus, couples plan (covers a connected partner too)
insert into public.plus_codes (code, plan, days) values ('FRIEND', 'couple', 365)
on conflict (code) do nothing;

-- The 100 code: the first 100 people get 6 months of Plus free, couples plan
insert into public.plus_codes (code, plan, days, max_uses) values ('100', 'couple', 183, 100)
on conflict (code) do nothing;

-- =====================================================================
-- WellWheel feedback. Paste into Supabase -> SQL Editor -> New query -> Run. Only needed once.
-- People can send feedback; nobody can read it through the app.
-- You read it in Supabase -> Table Editor -> feedback.
-- =====================================================================
create table if not exists public.feedback (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  user_id     uuid default auth.uid() references auth.users(id) on delete set null,
  username    text,
  kind        text not null check (kind in ('bug', 'idea', 'love', 'other')),
  message     text not null check (length(message) between 1 and 4000),
  contact_ok  boolean not null default false,
  email       text check (email is null or length(email) <= 320),
  screen      text check (screen is null or length(screen) <= 60),
  device      text check (device is null or length(device) <= 400),
  status      text not null default 'new'   -- for you: new, read, planned, done
);
alter table public.feedback enable row level security;
drop policy if exists "feedback: anyone can send" on public.feedback;
create policy "feedback: anyone can send" on public.feedback for insert to anon, authenticated
  with check (user_id is null or user_id = auth.uid());
grant insert (username, kind, message, contact_ok, email, screen, device) on public.feedback to anon, authenticated;

-- =====================================================================
-- WellWheel "Share with a friend": a friend who signs up with your link
-- and pays for Plus gets you your next month free.
-- Paste into Supabase -> SQL Editor -> New query -> Run. Only needed once.
-- (Needs phase5.sql first; phase5-all.sql includes everything.)
-- =====================================================================

alter table public.profiles add column if not exists referred_by uuid references auth.users(id) on delete set null;

create table if not exists public.referrals (
  referred_id  uuid primary key references auth.users(id) on delete cascade, -- the friend (counted once)
  referrer_id  uuid not null references auth.users(id) on delete cascade,     -- who shared the link
  created_at   timestamptz not null default now(),
  rewarded_at  timestamptz,                                                    -- when the free month was given
  reward       text
);
create index if not exists referrals_referrer_idx on public.referrals(referrer_id);
alter table public.referrals enable row level security;
-- (only the app's server writes here; people see their own totals through my_referrals())

-- New accounts: create the profile, and remember who invited them (from the sign-up link)
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
declare inviter uuid;
begin
  select id into inviter from public.profiles where username = lower(nullif(new.raw_user_meta_data->>'ref', ''));
  insert into public.profiles (id, username, display_name, couple_code, seed_examples, referred_by)
  values (
    new.id,
    lower(new.raw_user_meta_data->>'username'),
    coalesce(new.raw_user_meta_data->>'display_name', ''),
    public.gen_couple_code(),
    coalesce((new.raw_user_meta_data->>'seed_examples')::boolean, false),
    inviter
  );
  if inviter is not null and inviter <> new.id then
    insert into public.referrals (referred_id, referrer_id) values (new.id, inviter) on conflict do nothing;
  end if;
  return new;
end $$;

-- My totals for the "Share with a friend" card
create or replace function public.my_referrals() returns json
language sql stable security definer set search_path = public as $$
  select json_build_object(
    'joined', count(*),
    'rewarded', count(*) filter (where rewarded_at is not null)
  ) from public.referrals where referrer_id = auth.uid();
$$;
grant execute on function public.my_referrals() to authenticated;
