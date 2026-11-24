-- Run once in the Supabase SQL editor (safe to run again).
-- Run it BEFORE deploying the code that saves these columns, or saving clubs and
-- requests will fail.
--
-- Adds two optional fields:
--   * clubs.playtomic_url: the club's Playtomic page. A button on each request opens
--     it in a new tab so the coach can check court times. Calspot never reads from or
--     writes to Playtomic.
--   * bookings.court_booked: the coach's own "Court booked" tick. Calspot does not
--     verify it with the club.

alter table public.clubs add column if not exists playtomic_url text
  check (playtomic_url is null or char_length(playtomic_url) <= 300);
alter table public.bookings add column if not exists court_booked boolean not null default false;
