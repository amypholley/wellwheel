-- =====================================================================
-- WellWheel database — Phase 1 (accounts, goals, journal, gratitude)
-- Paste this whole file into Supabase -> SQL Editor -> New query -> Run.
-- It is safe to run more than once.
-- =====================================================================

-- ---------- Profiles (one per account) ----------
create table if not exists public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  username      text not null unique check (username ~ '^[a-z0-9_]{3,20}$'),
  display_name  text not null default '',
  couple_code   text not null unique,
  seed_examples boolean not null default false,
  created_at    timestamptz not null default now()
);

-- Random couple code like WW-AB12CD (no look-alike letters)
create or replace function public.gen_couple_code() returns text
language plpgsql volatile set search_path = public as $$
declare
  alphabet text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  c text;
begin
  loop
    c := 'WW-';
    for i in 1..6 loop
      c := c || substr(alphabet, 1 + floor(random() * 32)::int, 1);
    end loop;
    exit when not exists (select 1 from public.profiles where couple_code = c);
  end loop;
  return c;
end $$;

-- When someone signs up, create their profile from the sign-up form details
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, username, display_name, couple_code, seed_examples)
  values (
    new.id,
    lower(new.raw_user_meta_data->>'username'),
    coalesce(new.raw_user_meta_data->>'display_name', ''),
    public.gen_couple_code(),
    coalesce((new.raw_user_meta_data->>'seed_examples')::boolean, false)
  );
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Lets the sign-up screen check a username before creating the account
create or replace function public.username_available(u text) returns boolean
language sql stable security definer set search_path = public as $$
  select not exists (select 1 from public.profiles where username = lower(u));
$$;
grant execute on function public.username_available(text) to anon, authenticated;

alter table public.profiles enable row level security;
drop policy if exists "profiles: read own" on public.profiles;
create policy "profiles: read own" on public.profiles
  for select to authenticated using (id = auth.uid());
drop policy if exists "profiles: update own" on public.profiles;
create policy "profiles: update own" on public.profiles
  for update to authenticated using (id = auth.uid()) with check (id = auth.uid());
-- People may only change these columns on their own profile
revoke update on public.profiles from authenticated, anon;
grant update (display_name, seed_examples) on public.profiles to authenticated;

-- ---------- Goals ----------
create table if not exists public.goals (
  id          uuid primary key default gen_random_uuid(),
  owner_id    uuid not null default auth.uid() references auth.users(id) on delete cascade,
  pillar      text not null check (pillar in ('physical','mental','emotional','spiritual','intellectual','environmental','financial','relationships','purpose')),
  title       text not null check (length(title) between 1 and 200),
  type        text not null check (type in ('habit','target')),
  count       numeric,
  per         text check (per in ('day','week')),
  unit        text not null default 'times',
  amt         boolean not null default false,
  step        numeric,
  step_label  text,
  target      numeric,
  why         text not null default '',
  deadline    date,
  sure        int check (sure between 1 and 10),
  example     boolean not null default false,
  created_at  timestamptz not null default now()
);
create index if not exists goals_owner_idx on public.goals(owner_id);

-- One place that decides who can see/log a goal (Phase 4 adds partners here)
create or replace function public.can_access_goal(g uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.goals where id = g and owner_id = auth.uid());
$$;

alter table public.goals enable row level security;
drop policy if exists "goals: read" on public.goals;
create policy "goals: read" on public.goals for select to authenticated using (owner_id = auth.uid());
drop policy if exists "goals: add" on public.goals;
create policy "goals: add" on public.goals for insert to authenticated with check (owner_id = auth.uid());
drop policy if exists "goals: edit" on public.goals;
create policy "goals: edit" on public.goals for update to authenticated using (owner_id = auth.uid()) with check (owner_id = auth.uid());
drop policy if exists "goals: delete" on public.goals;
create policy "goals: delete" on public.goals for delete to authenticated using (owner_id = auth.uid());

-- ---------- Goal progress (one row per goal, per person, per day) ----------
create table if not exists public.goal_logs (
  goal_id  uuid not null references public.goals(id) on delete cascade,
  user_id  uuid not null default auth.uid() references auth.users(id) on delete cascade,
  day      date not null,
  amount   numeric not null default 0 check (amount >= 0),
  primary key (goal_id, user_id, day)
);

alter table public.goal_logs enable row level security;
drop policy if exists "logs: read" on public.goal_logs;
create policy "logs: read" on public.goal_logs for select to authenticated using (public.can_access_goal(goal_id));
drop policy if exists "logs: add" on public.goal_logs;
create policy "logs: add" on public.goal_logs for insert to authenticated with check (user_id = auth.uid() and public.can_access_goal(goal_id));
drop policy if exists "logs: edit" on public.goal_logs;
create policy "logs: edit" on public.goal_logs for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid() and public.can_access_goal(goal_id));
drop policy if exists "logs: delete" on public.goal_logs;
create policy "logs: delete" on public.goal_logs for delete to authenticated using (user_id = auth.uid());

-- Add (or take back) progress safely, even if two phones tap at once
create or replace function public.log_goal(p_goal uuid, p_day date, p_delta numeric) returns numeric
language plpgsql security invoker set search_path = public as $$
declare v numeric;
begin
  insert into public.goal_logs (goal_id, user_id, day, amount)
  values (p_goal, auth.uid(), p_day, greatest(0, p_delta))
  on conflict (goal_id, user_id, day)
  do update set amount = greatest(0, public.goal_logs.amount + p_delta)
  returning amount into v;
  return v;
end $$;
grant execute on function public.log_goal(uuid, date, numeric) to authenticated;

-- ---------- Gratitude ----------
create table if not exists public.gratitude (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references auth.users(id) on delete cascade,
  day         date not null,
  text        text not null check (length(text) between 1 and 1000),
  example     boolean not null default false,
  created_at  timestamptz not null default now()
);
create index if not exists gratitude_user_idx on public.gratitude(user_id);
alter table public.gratitude enable row level security;
drop policy if exists "gratitude: own" on public.gratitude;
create policy "gratitude: own" on public.gratitude for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ---------- Journal (one entry per day) ----------
create table if not exists public.journal (
  user_id     uuid not null default auth.uid() references auth.users(id) on delete cascade,
  day         date not null,
  pillar      text not null,
  prompt      text not null,
  label       text not null default '',
  text        text not null,
  example     boolean not null default false,
  updated_at  timestamptz not null default now(),
  primary key (user_id, day)
);
alter table public.journal enable row level security;
drop policy if exists "journal: own" on public.journal;
create policy "journal: own" on public.journal for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ---------- Permissions for the app ----------
-- Spelled out here so this works even when "Automatically expose new tables" is turned off.
-- Row Level Security (above) still limits each person to their own rows.
grant usage on schema public to anon, authenticated;
grant select on public.profiles to authenticated;
grant update (display_name, seed_examples) on public.profiles to authenticated;
grant select, insert, update, delete on public.goals, public.goal_logs, public.gratitude, public.journal to authenticated;
grant execute on function public.can_access_goal(uuid) to authenticated;
grant execute on function public.username_available(text) to anon, authenticated;
grant execute on function public.log_goal(uuid, date, numeric) to authenticated;

-- =====================================================================
-- Phase 2: worksheet answers (one saved record per person per worksheet)
-- =====================================================================
create table if not exists public.tool_data (
  user_id     uuid not null default auth.uid() references auth.users(id) on delete cascade,
  tool        text not null check (tool ~ '^[a-z]{2,20}$'),
  data        jsonb not null default '{}'::jsonb,
  updated_at  timestamptz not null default now(),
  primary key (user_id, tool)
);
alter table public.tool_data enable row level security;
drop policy if exists "tool_data: own" on public.tool_data;
create policy "tool_data: own" on public.tool_data for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());
grant select, insert, update, delete on public.tool_data to authenticated;

-- =====================================================================
-- Phase 3: photos (same as supabase/phase3.sql)
-- =====================================================================
-- A private place to keep photos. Each person gets their own folder.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('photos', 'photos', false, 10485760, array['image/jpeg','image/png','image/webp','image/heic'])
on conflict (id) do nothing;

-- People can only add, see, and delete photos in their own folder
drop policy if exists "photos: add own" on storage.objects;
create policy "photos: add own" on storage.objects for insert to authenticated
  with check (bucket_id = 'photos' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "photos: see own" on storage.objects;
create policy "photos: see own" on storage.objects for select to authenticated
  using (bucket_id = 'photos' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "photos: delete own" on storage.objects;
create policy "photos: delete own" on storage.objects for delete to authenticated
  using (bucket_id = 'photos' and (storage.foldername(name))[1] = auth.uid()::text);

-- =====================================================================
-- Phase 4: couples (same as supabase/phase4.sql)
-- =====================================================================
-- =====================================================================
-- WellWheel Phase 4 database update: couple connection & sharing.
-- Paste into Supabase -> SQL Editor -> New query -> Run. Only needed once.
--
-- What partners share: goals marked "shared", the couple's bucket list,
-- the Couples Workbook, the joint ("Our plan") money planner, and each
-- other's travel-map places (and those places' photos).
-- Everything else stays private to each person.
-- =====================================================================

-- ---------- Couples ----------
create table if not exists public.couples (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now()
);
alter table public.couples enable row level security;

alter table public.profiles add column if not exists couple_id uuid references public.couples(id) on delete set null;
create index if not exists profiles_couple_idx on public.profiles(couple_id);

-- The couple I'm in (or null) and my partner's id (or null)
create or replace function public.my_couple() returns uuid
language sql stable security definer set search_path = public as $$
  select couple_id from public.profiles where id = auth.uid();
$$;
create or replace function public.partner_id() returns uuid
language sql stable security definer set search_path = public as $$
  select p.id from public.profiles p
  join public.profiles me on me.couple_id = p.couple_id
  where me.id = auth.uid() and me.couple_id is not null and p.id <> me.id;
$$;
grant execute on function public.my_couple() to authenticated;
grant execute on function public.partner_id() to authenticated;

drop policy if exists "couples: read own" on public.couples;
create policy "couples: read own" on public.couples for select to authenticated using (id = public.my_couple());
grant select on public.couples to authenticated;

-- Partners can see each other's name and username
drop policy if exists "profiles: read partner" on public.profiles;
create policy "profiles: read partner" on public.profiles for select to authenticated
  using (couple_id is not null and couple_id = public.my_couple());

-- ---------- Things a couple shares (bucket list, workbook, joint money plan) ----------
create table if not exists public.couple_data (
  couple_id   uuid not null references public.couples(id) on delete cascade,
  key         text not null check (key ~ '^[a-z]{2,20}$'),
  data        jsonb not null default '{}'::jsonb,
  updated_by  uuid default auth.uid(),
  updated_at  timestamptz not null default now(),
  primary key (couple_id, key)
);
alter table public.couple_data enable row level security;
drop policy if exists "couple_data: our own" on public.couple_data;
create policy "couple_data: our own" on public.couple_data for all to authenticated
  using (couple_id = public.my_couple()) with check (couple_id = public.my_couple());
grant select, insert, update, delete on public.couple_data to authenticated;

-- ---------- Shared goals ----------
alter table public.goals add column if not exists couple_id uuid references public.couples(id) on delete set null;

create or replace function public.can_access_goal(g uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.goals
    where id = g and (owner_id = auth.uid() or (couple_id is not null and couple_id = public.my_couple()))
  );
$$;

drop policy if exists "goals: read" on public.goals;
create policy "goals: read" on public.goals for select to authenticated
  using (owner_id = auth.uid() or (couple_id is not null and couple_id = public.my_couple()));
drop policy if exists "goals: add" on public.goals;
create policy "goals: add" on public.goals for insert to authenticated
  with check (owner_id = auth.uid() and (couple_id is null or couple_id = public.my_couple()));
drop policy if exists "goals: edit" on public.goals;
create policy "goals: edit" on public.goals for update to authenticated
  using (owner_id = auth.uid()) with check (owner_id = auth.uid() and (couple_id is null or couple_id = public.my_couple()));
-- (deleting a goal stays owner-only, from Phase 1)

-- ---------- Partner's travel-map places, and their photos ----------
-- Partners only see photos kept in the "places" (travel map) or "shared" (couple's bucket list) folders.
create or replace function public.partner_places() returns jsonb
language sql stable security definer set search_path = public as $$
  select coalesce((select data->'places' from public.tool_data where user_id = public.partner_id() and tool = 'adv'), '{}'::jsonb);
$$;
grant execute on function public.partner_places() to authenticated;

drop policy if exists "photos: partner sees" on storage.objects;
create policy "photos: partner sees" on storage.objects for select to authenticated
  using (bucket_id = 'photos' and (storage.foldername(name))[1] = public.partner_id()::text
         and (storage.foldername(name))[2] in ('places', 'shared'));

-- ---------- My couple, for the app ----------
create or replace function public.my_couple_info() returns json
language sql stable security definer set search_path = public as $$
  select json_build_object('couple_id', me.couple_id, 'since', c.created_at,
                           'partner_id', p.id, 'partner_name', p.display_name, 'partner_username', p.username)
  from public.profiles me
  join public.couples c on c.id = me.couple_id
  join public.profiles p on p.couple_id = me.couple_id and p.id <> me.id
  where me.id = auth.uid();
$$;
grant execute on function public.my_couple_info() to authenticated;

-- ---------- Connect with a partner's couple code ----------
create or replace function public.connect_partner(code text) returns json
language plpgsql security definer set search_path = public as $$
declare
  me public.profiles; them public.profiles; cid uuid; merged jsonb; a jsonb; b jsonb;
begin
  select * into me from public.profiles where id = auth.uid();
  if me.id is null then raise exception 'Please log in first.'; end if;
  if me.couple_id is not null then raise exception 'You’re already connected with a partner.'; end if;
  select * into them from public.profiles where couple_code = upper(regexp_replace(trim(code), '^(WW)?-?', 'WW-', 'i'));
  if them.id is null then raise exception 'We couldn’t find that code. Check it and try again.'; end if;
  if them.id = me.id then raise exception 'That’s your own code. Enter your partner’s.'; end if;
  if them.couple_id is not null then raise exception 'That account is already connected to someone.'; end if;

  insert into public.couples default values returning id into cid;
  update public.profiles set couple_id = cid where id in (me.id, them.id);

  -- One couple's bucket list from both people's lists (no duplicates)
  select coalesce(jsonb_agg(item order by ord), '[]'::jsonb) into merged from (
    select distinct on (lower(item->>'text')) item, ord from (
      select item, (case when t.user_id = me.id then 0 else 100000 end) + n as ord
      from public.tool_data t, jsonb_array_elements(coalesce(t.data->'bucket'->'us', '[]'::jsonb)) with ordinality as e(item, n)
      where t.tool = 'adv' and t.user_id in (me.id, them.id)
    ) x order by lower(item->>'text'), ord
  ) y;
  insert into public.couple_data (couple_id, key, data, updated_by) values (cid, 'bucket', jsonb_build_object('list', merged), me.id);

  -- One Couples Workbook, keeping both people's past check-ins
  select data into a from public.tool_data where user_id = me.id and tool = 'couples';
  select data into b from public.tool_data where user_id = them.id and tool = 'couples';
  insert into public.couple_data (couple_id, key, data, updated_by) values (cid, 'couples',
    coalesce(a, b, '{}'::jsonb) || jsonb_build_object('entries', coalesce(a->'entries', '[]'::jsonb) || coalesce(b->'entries', '[]'::jsonb)), me.id);

  return json_build_object('partner_name', them.display_name);
end $$;
grant execute on function public.connect_partner(text) to authenticated;

-- ---------- Disconnect: each person keeps a private copy of everything shared ----------
create or replace function public.disconnect_couple(u uuid) returns void
language plpgsql security definer set search_path = public as $$
declare
  cid uuid; m record; g record; newid uuid; bl jsonb; cw jsonb; money jsonb;
begin
  select couple_id into cid from public.profiles where id = u;
  if cid is null then return; end if;
  select data->'list' into bl from public.couple_data where couple_id = cid and key = 'bucket';
  select data into cw from public.couple_data where couple_id = cid and key = 'couples';
  select jsonb_object_agg(key, data) into money from public.couple_data
    where couple_id = cid and key in ('monthly', 'spending', 'efund', 'debt', 'nw');

  for m in select id from public.profiles where couple_id = cid loop
    -- shared goals someone else created: make a private copy, with all progress so far
    for g in select * from public.goals where couple_id = cid and owner_id <> m.id loop
      insert into public.goals (owner_id, pillar, title, type, count, per, unit, amt, step, step_label, target, why, deadline, sure, example)
      values (m.id, g.pillar, g.title, g.type, g.count, g.per, g.unit, g.amt, g.step, g.step_label, g.target, g.why, g.deadline, g.sure, false)
      returning id into newid;
      insert into public.goal_logs (goal_id, user_id, day, amount)
      select newid, m.id, day, sum(amount) from public.goal_logs where goal_id = g.id group by day;
    end loop;
    -- the couple's bucket list goes back into each person's own list
    if bl is not null then
      insert into public.tool_data (user_id, tool, data) values (m.id, 'adv', jsonb_build_object('places', '{}'::jsonb, 'bucket', jsonb_build_object('me', '[]'::jsonb, 'us', bl), 'hobbies', '[]'::jsonb))
      on conflict (user_id, tool) do update set data = public.tool_data.data || jsonb_build_object('bucket', coalesce(public.tool_data.data->'bucket', '{}'::jsonb) || jsonb_build_object('us', bl)), updated_at = now();
    end if;
    if cw is not null then
      insert into public.tool_data (user_id, tool, data) values (m.id, 'couples', cw)
      on conflict (user_id, tool) do update set data = excluded.data, updated_at = now();
    end if;
    if money is not null then
      insert into public.tool_data (user_id, tool, data) values (m.id, 'jointcopy', money)
      on conflict (user_id, tool) do update set data = excluded.data, updated_at = now();
    end if;
  end loop;

  update public.goals set couple_id = null where couple_id = cid;
  update public.profiles set couple_id = null where couple_id = cid;
  delete from public.couples where id = cid;
end $$;
revoke all on function public.disconnect_couple(uuid) from public, anon, authenticated;
grant execute on function public.disconnect_couple(uuid) to service_role;

create or replace function public.disconnect_partner() returns void
language sql security definer set search_path = public as $$ select public.disconnect_couple(auth.uid()); $$;
grant execute on function public.disconnect_partner() to authenticated;

-- =====================================================================
-- Phase 5: WellWheel Plus (same as supabase/phase5.sql)
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
-- Phase 5b: Plus codes (same as supabase/phase5b.sql)
-- =====================================================================
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
