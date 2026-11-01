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
