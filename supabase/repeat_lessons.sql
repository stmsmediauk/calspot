-- Run once in the Supabase SQL editor (safe to run again).
-- Run it BEFORE deploying the code that offers "Repeat weekly".
--
-- Repeat lessons: a player can ask for the same session every week for up to 4
-- weeks. Each week is its own booking row, so the coach can approve, decline or
-- cancel one week on its own. The weeks share a series_id so they show together.
--
-- All or nothing: request_booking_series() books every week in one transaction, so
-- if any week is unavailable (clash, blocked date, no availability, full) nothing is
-- requested and the player is told which week failed.
--
-- A series counts as ONE waiting request towards the "3 waiting requests per player"
-- limit, so a 4-week series is not refused by it.
--
-- This replaces request_booking with a version that takes an extra optional
-- p_series argument. Everything else in it is unchanged. It runs in one transaction
-- so the booking function is never missing or duplicated while it is applied.

begin;

alter table public.bookings add column if not exists series_id uuid;
create index if not exists bookings_series_idx on public.bookings (series_id)
  where series_id is not null;

create or replace function public.request_booking(
  p_slug text, p_club uuid, p_lesson uuid, p_date date, p_hour numeric,
  p_name text, p_email text, p_phone text, p_message text,
  p_spaces integer default 1, p_series uuid default null
)
returns uuid
language plpgsql
security definer
set search_path to ''
as $function$
declare
  v_coach uuid; v_id uuid; v_minutes integer; v_capacity integer; v_end numeric;
  v_now timestamp := (now() at time zone 'Europe/London');
begin
  select id into v_coach from public.coaches where slug = p_slug and published;
  if v_coach is null then raise exception 'Coach not found'; end if;
  select duration, capacity into v_minutes, v_capacity from public.lessons
    where id = p_lesson and coach_id = v_coach and active;
  if v_minutes is null
    or not exists (select 1 from public.clubs where id = p_club and coach_id = v_coach and active)
  then raise exception 'Unknown club or lesson'; end if;
  if p_spaces is null or p_spaces < 1 or p_spaces > v_capacity
  then raise exception 'Invalid number of spaces'; end if;
  if p_hour < 0 or p_hour >= 24 or (p_hour * 4) <> trunc(p_hour * 4)
  then raise exception 'Invalid time'; end if;
  if (p_date + (p_hour * interval '1 hour')) <= v_now or p_date > v_now::date + 120
  then raise exception 'That time is not available'; end if;
  v_end := p_hour + v_minutes / 60.0;

  -- One request at a time per coach and date, so two players cannot take the last space.
  perform pg_advisory_xact_lock(hashtextextended(v_coach::text || p_date::text, 0));

  if not (
    exists (
      select 1 from public.availability_rules r
      where r.coach_id = v_coach and r.club_id = p_club
        and (r.lesson_id is null or r.lesson_id = p_lesson)
        and r.day = extract(dow from p_date)
        and p_date between r.effective_start and r.effective_end
        and p_hour >= r.start_hour and v_end <= r.end_hour)
    or exists (
      select 1 from public.availability_exceptions e
      where e.coach_id = v_coach and e.kind = 'extra' and e.date = p_date
        and (e.club_id is null or e.club_id = p_club)
        and (e.lesson_id is null or e.lesson_id = p_lesson)
        and p_hour >= e.start_hour and v_end <= e.end_hour)
  ) then raise exception 'That time is not available'; end if;

  if exists (
    select 1 from public.availability_exceptions e
    where e.coach_id = v_coach and e.kind = 'blocked' and e.date = p_date
      and p_hour < e.end_hour and e.start_hour < v_end
  ) then raise exception 'That time is not available'; end if;

  -- Anything overlapping that is not this same session blocks the time.
  if exists (
    select 1 from public.bookings b
    join public.lessons l on l.id = b.lesson_id
    where b.coach_id = v_coach and b.date = p_date and b.status in ('pending', 'confirmed')
      and p_hour < b.hour + l.duration / 60.0 and b.hour < v_end
      and not (b.lesson_id = p_lesson and b.club_id = p_club and b.hour = p_hour)
  ) then raise exception 'That time has just been taken'; end if;

  -- Same session: enough spaces left?
  if coalesce((
    select sum(b.spaces) from public.bookings b
    where b.coach_id = v_coach and b.date = p_date and b.status in ('pending', 'confirmed')
      and b.lesson_id = p_lesson and b.club_id = p_club and b.hour = p_hour
  ), 0) + p_spaces > v_capacity
  then raise exception 'That time has just been taken'; end if;

  -- Waiting requests per player: a whole series counts as one.
  if (select count(distinct coalesce(b.series_id, b.id)) from public.bookings b
      where b.coach_id = v_coach and lower(b.email) = lower(btrim(p_email)) and b.status = 'pending'
        and (p_series is null or b.series_id is null or b.series_id <> p_series)) >= 3
  then raise exception 'You already have several requests waiting for this coach'; end if;

  insert into public.bookings (coach_id, club_id, lesson_id, date, hour, player_name, email, phone, message, spaces, series_id)
  values (v_coach, p_club, p_lesson, p_date, p_hour, btrim(p_name), btrim(p_email),
          coalesce(btrim(p_phone), ''), coalesce(btrim(p_message), ''), p_spaces, p_series)
  returning id into v_id;
  return v_id;
end $function$;

-- The old ten-argument version is replaced by the one above (its last two arguments
-- are optional, so existing calls keep working). Leaving both would make calls
-- ambiguous.
drop function if exists public.request_booking(
  text, uuid, uuid, date, numeric, text, text, text, text, integer
);

-- Requests the same session on the same weekday for 2 to 4 weeks. Returns the ids.
create or replace function public.request_booking_series(
  p_slug text, p_club uuid, p_lesson uuid, p_date date, p_hour numeric,
  p_name text, p_email text, p_phone text, p_message text,
  p_spaces integer, p_weeks integer
)
returns uuid[]
language plpgsql
security definer
set search_path to ''
as $function$
declare
  v_series uuid := gen_random_uuid();
  v_ids uuid[] := '{}';
  i integer;
begin
  if p_weeks is null or p_weeks < 2 or p_weeks > 4
  then raise exception 'Choose between 2 and 4 weeks'; end if;
  for i in 0 .. p_weeks - 1 loop
    begin
      v_ids := v_ids || public.request_booking(
        p_slug, p_club, p_lesson, p_date + i * 7, p_hour,
        p_name, p_email, p_phone, p_message, p_spaces, v_series
      );
    exception when others then
      -- Re-raising cancels every week already requested in this call.
      raise exception '% (week %, %)', sqlerrm, i + 1, to_char(p_date + i * 7, 'FMDD Mon');
    end;
  end loop;
  return v_ids;
end $function$;

grant execute on function public.request_booking(
  text, uuid, uuid, date, numeric, text, text, text, text, integer, uuid
) to anon, authenticated, service_role;
grant execute on function public.request_booking_series(
  text, uuid, uuid, date, numeric, text, text, text, text, integer, integer
) to anon, authenticated, service_role;

commit;
