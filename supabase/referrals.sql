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
