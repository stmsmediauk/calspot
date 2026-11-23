-- Run once in the Supabase SQL editor (safe to run again). Run it BEFORE deploying the code
-- that uses it: the app now saves `capacity` on lessons.
--
-- Group sessions: a lesson can have several spaces (2 for a duo, 4 for a small group,
-- 12 for an americano). Each player request takes 1 or more spaces. Players share a
-- session only when the lesson, club, date and start time are all the same; any other
-- overlap with an active request is still "taken". Price stays per person.

alter table public.lessons
  add column if not exists capacity integer not null default 1;
alter table public.lessons drop constraint if exists lessons_capacity_check;
alter table public.lessons
  add constraint lessons_capacity_check check (capacity between 1 and 40);

alter table public.bookings
  add column if not exists spaces integer not null default 1;
alter table public.bookings drop constraint if exists bookings_spaces_check;
alter table public.bookings
  add constraint bookings_spaces_check check (spaces between 1 and 40);

-- One live request per start time no longer holds for groups. request_booking() now
-- serialises requests per coach and date with an advisory lock and counts spaces itself.
drop index if exists public.bookings_one_live_per_slot;

-- Busy times now say which lesson and how many spaces are taken, so the public page
-- can show "5 of 12 spaces left". Still no names, emails or messages.
drop function if exists public.booked_times(text);
create function public.booked_times(p_slug text)
returns table(date date, hour numeric, club_id uuid, minutes integer, lesson_id uuid, spaces integer)
language sql stable security definer set search_path = ''
as $$
  select b.date, b.hour, b.club_id, l.duration, b.lesson_id, b.spaces
  from public.bookings b
  join public.coaches c on c.id = b.coach_id
  join public.lessons l on l.id = b.lesson_id
  where c.slug = p_slug and c.published and b.status in ('pending', 'confirmed')
    and b.date >= current_date - 1
$$;
grant execute on function public.booked_times(text) to anon, authenticated;

drop function if exists public.request_booking(text, uuid, uuid, date, numeric, text, text, text, text);
create function public.request_booking(
  p_slug text, p_club uuid, p_lesson uuid, p_date date, p_hour numeric,
  p_name text, p_email text, p_phone text, p_message text, p_spaces integer default 1
) returns uuid
language plpgsql security definer set search_path = ''
as $$
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

  if (select count(*) from public.bookings b
      where b.coach_id = v_coach and lower(b.email) = lower(btrim(p_email)) and b.status = 'pending') >= 3
  then raise exception 'You already have several requests waiting for this coach'; end if;

  insert into public.bookings (coach_id, club_id, lesson_id, date, hour, player_name, email, phone, message, spaces)
  values (v_coach, p_club, p_lesson, p_date, p_hour, btrim(p_name), btrim(p_email),
          coalesce(btrim(p_phone), ''), coalesce(btrim(p_message), ''), p_spaces)
  returning id into v_id;
  return v_id;
end $$;
grant execute on function public.request_booking(text, uuid, uuid, date, numeric, text, text, text, text, integer)
  to anon, authenticated;
