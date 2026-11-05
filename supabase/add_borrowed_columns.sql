-- Ausleihen: Bücher, die mir nicht gehören. borrowed_until = Rückgabedatum.
-- Einmalig im Supabase SQL Editor ausführen.
alter table public.books
  add column if not exists borrowed_until date;
