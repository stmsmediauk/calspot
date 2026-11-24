-- Run once in the Supabase SQL editor (safe to run again).
-- Run it BEFORE deploying the code that shows "Sync to your calendar".
--
-- A coach can subscribe to their confirmed sessions from Apple Calendar, Google
-- Calendar or Outlook. The link holds a secret token, so anyone with the link can
-- read the sessions: it shows first names, lesson, club and time only, never emails,
-- phone numbers or messages. The coach can reset the link to cut off old copies.
--
-- The token lives in its own table, not on coaches, because coach rows are readable
-- by visitors once a page is published.

create table if not exists public.coach_calendar_tokens (
  coach_id uuid primary key references public.coaches(id) on delete cascade,
  token uuid not null unique default gen_random_uuid(),
  created_at timestamptz not null default now()
);
alter table public.coach_calendar_tokens enable row level security;
drop policy if exists calendar_tokens_owner on public.coach_calendar_tokens;
create policy calendar_tokens_owner on public.coach_calendar_tokens
  for all to authenticated
  using (coach_id in (select id from public.coaches where owner_id = (select auth.uid())))
  with check (coach_id in (select id from public.coaches where owner_id = (select auth.uid())));

-- The signed-in coach's token, created the first time it is asked for.
create or replace function public.my_calendar_token()
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare v_coach uuid; v_token uuid;
begin
  select id into v_coach from public.coaches where owner_id = auth.uid();
  if v_coach is null then raise exception 'No coach page'; end if;
  insert into public.coach_calendar_tokens (coach_id) values (v_coach)
    on conflict (coach_id) do nothing;
  select token into v_token from public.coach_calendar_tokens where coach_id = v_coach;
  return v_token;
end;
$$;

-- Replaces the token, so any link already shared stops working.
create or replace function public.reset_calendar_token()
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare v_coach uuid; v_token uuid := gen_random_uuid();
begin
  select id into v_coach from public.coaches where owner_id = auth.uid();
  if v_coach is null then raise exception 'No coach page'; end if;
  insert into public.coach_calendar_tokens (coach_id, token) values (v_coach, v_token)
    on conflict (coach_id) do update set token = excluded.token, created_at = now();
  return v_token;
end;
$$;

-- What the calendar link serves: confirmed sessions from the last 30 days onwards.
-- Callable without signing in, but only returns rows for a valid token.
create or replace function public.calendar_feed(p_token uuid)
returns table (
  booking_id uuid,
  coach_name text,
  first_name text,
  lesson_name text,
  duration int,
  club_name text,
  club_address text,
  date date,
  hour numeric,
  spaces int,
  court_booked boolean
)
language sql
stable
security definer
set search_path = public
as $$
  select b.id,
         c.profile ->> 'name',
         split_part(b.player_name, ' ', 1),
         l.name,
         l.duration,
         cl.name,
         cl.address,
         b.date,
         b.hour,
         b.spaces,
         b.court_booked
  from public.coach_calendar_tokens t
  join public.coaches c on c.id = t.coach_id
  join public.bookings b on b.coach_id = c.id
  join public.lessons l on l.id = b.lesson_id
  join public.clubs cl on cl.id = b.club_id
  where t.token = p_token
    and b.status = 'confirmed'
    and b.date >= current_date - 30
  order by b.date, b.hour;
$$;

revoke all on function public.my_calendar_token() from public, anon;
revoke all on function public.reset_calendar_token() from public, anon;
revoke all on function public.calendar_feed(uuid) from public;
grant execute on function public.my_calendar_token() to authenticated;
grant execute on function public.reset_calendar_token() to authenticated;
grant execute on function public.calendar_feed(uuid) to anon, authenticated;
