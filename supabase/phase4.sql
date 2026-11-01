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
