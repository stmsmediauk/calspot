-- Run once in the Supabase SQL editor (safe to run again).
-- A support view for platform admins: a coach's setup and request counts,
-- with NO player names, emails, phone numbers or messages.
create or replace function public.admin_coach_support(p_coach uuid)
returns jsonb
language plpgsql stable security definer set search_path = ''
as $$
declare r jsonb;
begin
  if not (select public.is_platform_admin()) then raise exception 'Not allowed'; end if;
  select jsonb_build_object(
    'profile', jsonb_build_object(
      'name', c.profile ->> 'name',
      'title', c.profile ->> 'title',
      'location', c.profile ->> 'location',
      'has_tagline', coalesce(c.profile ->> 'tagline', '') <> '',
      'has_introduction', coalesce(c.profile ->> 'introduction', '') <> '',
      'has_photo', coalesce(c.profile ->> 'photograph', '') <> '',
      'has_whatsapp', coalesce(c.profile ->> 'whatsapp', '') <> '',
      'palette', c.profile #>> '{appearance,palette}',
      'hero', c.profile #>> '{appearance,hero}'
    ),
    'published', c.published,
    'suspended', c.suspended,
    'clubs', coalesce((select jsonb_agg(jsonb_build_object('id', x.id, 'name', x.name, 'address', x.address, 'active', x.active) order by x.position) from public.clubs x where x.coach_id = c.id), '[]'),
    'lessons', coalesce((select jsonb_agg(jsonb_build_object('id', x.id, 'name', x.name, 'duration', x.duration, 'price', x.price, 'active', x.active) order by x.position) from public.lessons x where x.coach_id = c.id), '[]'),
    'rules', coalesce((select jsonb_agg(jsonb_build_object('day', a.day, 'start', a.start_hour, 'end', a.end_hour, 'club_id', a.club_id, 'lesson_id', a.lesson_id, 'from', a.effective_start, 'to', a.effective_end) order by a.day, a.start_hour) from public.availability_rules a where a.coach_id = c.id), '[]'),
    'extra_dates', (select count(*) from public.availability_exceptions e where e.coach_id = c.id and e.kind <> 'blocked'),
    'blocked_dates', (select count(*) from public.availability_exceptions e where e.coach_id = c.id and e.kind = 'blocked'),
    'requests', coalesce((select jsonb_object_agg(s.status, s.n) from (select b.status, count(*) n from public.bookings b where b.coach_id = c.id group by b.status) s), '{}'),
    'oldest_pending', (select min(b.requested_at) from public.bookings b where b.coach_id = c.id and b.status = 'pending')
  ) into r
  from public.coaches c where c.id = p_coach;
  if r is null then raise exception 'Coach not found'; end if;
  return r;
end $$;

revoke all on function public.admin_coach_support(uuid) from public, anon;
grant execute on function public.admin_coach_support(uuid) to authenticated;
