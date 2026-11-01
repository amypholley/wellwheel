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
