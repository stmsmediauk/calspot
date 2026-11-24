-- Run this in the Supabase SQL editor AFTER the new /api/book is deployed and
-- SUPABASE_SERVICE_ROLE_KEY is set on Vercel (Project Settings, Environment
-- Variables, then redeploy). Running it earlier stops every booking request.

-- 1. Booking requests may only come through /api/book, which has the spam checks.
revoke execute on function public.request_booking(text, uuid, uuid, date, numeric, text, text, text, text, integer, uuid)
  from public, anon, authenticated;
revoke execute on function public.request_booking_series(text, uuid, uuid, date, numeric, text, text, text, text, integer, integer)
  from public, anon, authenticated;
grant execute on function public.request_booking(text, uuid, uuid, date, numeric, text, text, text, text, integer, uuid)
  to service_role;
grant execute on function public.request_booking_series(text, uuid, uuid, date, numeric, text, text, text, text, integer, integer)
  to service_role;

-- 2. Clubs and lessons of pages that are not published were readable by anyone.
-- The published-only policies (clubs_public_read, lessons_public_read) remain.
drop policy if exists clubs_public_active on public.clubs;
drop policy if exists lessons_public_active on public.lessons;

-- 3. Page addresses that would clash with real routes or folders.
create or replace function public.slug_available(p_slug text)
returns boolean
language sql
stable
security definer
set search_path to ''
as $$
  select p_slug ~ '^[a-z0-9][a-z0-9-]{1,38}[a-z0-9]$'
    and p_slug not in (
      'dashboard','signup','login','logout','onboarding','auth','api','preview','privacy','terms',
      'admin','app','www','calspot','support','help','about','pricing','contact','settings','static','assets',
      'forgot-password','reset-password','favicon','robots','sitemap',
      'examples','coach','brand','logos','landing','platform','blog','docs','status')
    and not exists (select 1 from public.coaches where slug = p_slug)
$$;

-- 4. The same reserved names, enforced by the table itself as a backstop.
alter table public.coaches drop constraint if exists coaches_slug_not_reserved;
alter table public.coaches add constraint coaches_slug_not_reserved check (slug <> all (array[
  'dashboard','signup','login','logout','onboarding','auth','api','preview','privacy','terms',
  'admin','app','www','calspot','support','help','about','pricing','contact','settings','static','assets',
  'forgot-password','reset-password','favicon','robots','sitemap',
  'examples','coach','brand','logos','landing','platform','blog','docs','status']));
