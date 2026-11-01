-- WellWheel Phase 2 database update. Paste into Supabase -> SQL Editor -> New query -> Run.
-- (Only needed once. New projects get this automatically from schema.sql.)
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
