-- Ausleihen: Bücher, die mir nicht gehören (von jemandem geliehen).
-- Einmalig im Supabase SQL Editor ausführen.
alter table public.books
  add column if not exists borrowed_from text,
  add column if not exists borrowed_since date;
