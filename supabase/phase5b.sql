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
