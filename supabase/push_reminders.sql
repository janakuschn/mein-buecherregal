-- Rückgabe-Erinnerungen per Push (siehe supabase/functions/borrow-reminders).
-- Einmalig im Supabase SQL Editor ausführen.

-- 1) "Zurückgegeben" für geliehene Bücher
alter table public.books
  add column if not exists borrowed_returned_at date;

-- 2) Push-Abos der Geräte
create table if not exists public.push_subscriptions (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  created_at timestamptz not null default now()
);
alter table public.push_subscriptions enable row level security;
drop policy if exists "eigene Push-Abos" on public.push_subscriptions;
create policy "eigene Push-Abos" on public.push_subscriptions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- 3) Protokoll gesendeter Erinnerungen (verhindert Doppelte), nur Server
create table if not exists public.borrow_reminders_sent (
  book_id text not null,
  due_date date not null,
  days_before int not null,
  sent_at timestamptz not null default now(),
  primary key (book_id, due_date, days_before)
);
alter table public.borrow_reminders_sent enable row level security;

-- 4) Zeitplan: stündlich 6-20 Uhr UTC, die Funktion sendet ab 9 Uhr Berlin
--    (erst NACH dem Deploy der Funktion ausführen)
-- create extension if not exists pg_cron;
-- create extension if not exists pg_net;
-- select cron.schedule('borrow-reminders', '0 6-20 * * *', $$
--   select net.http_post(
--     url := 'https://rfmqeffkhjcwnzkbaclv.supabase.co/functions/v1/borrow-reminders',
--     headers := '{"Content-Type": "application/json"}'::jsonb,
--     body := '{}'::jsonb
--   );
-- $$);
