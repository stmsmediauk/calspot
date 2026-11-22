-- Run once in the Supabase SQL editor (safe to run again).
-- Run AFTER admin_tools.sql. Adds the 14-day free trial.
--
-- How it works:
--   * Every new coach gets trial_ends_at = 14 days after sign-up.
--   * A coach is "active" if their plan is paid or free, or they are on a trial that
--     has not ended. Overdue coaches and expired trials are not active.
--   * Inactive coaches: their public page returns 404, and players cannot send
--     them requests. Nothing is deleted; their dashboard still opens.
--   * Admins can change the plan or extend the trial from /admin.

alter table public.coaches add column if not exists trial_ends_at timestamptz;
update public.coaches set trial_ends_at = created_at + interval '14 days' where trial_ends_at is null;
alter table public.coaches alter column trial_ends_at set default (now() + interval '14 days');

-- Coaches cannot change their own trial, plan or suspension.
create or replace function public.coaches_guard()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if not public.is_platform_admin() then
    new.suspended := old.suspended;
    new.billing_status := old.billing_status;
    new.trial_ends_at := old.trial_ends_at;
    if old.suspended and new.published then
      raise exception 'This page has been suspended. Please contact Calspot support.';
    end if;
  end if;
  return new;
end;
$$;

create or replace function public.coach_is_active(p_coach uuid)
returns boolean
language sql stable security definer set search_path = public
as $$
  select coalesce((
    select not c.suspended and (
      c.billing_status in ('paid', 'free')
      or (c.billing_status = 'trial' and c.trial_ends_at > now())
    )
    from public.coaches c where c.id = p_coach
  ), false)
$$;

-- Is this address a live public page? (published and active)
create or replace function public.coach_is_live(p_slug text)
returns boolean
language sql stable security definer set search_path = public
as $$
  select coalesce((select c.published and public.coach_is_active(c.id)
                   from public.coaches c where c.slug = p_slug), false)
$$;

-- For the sitemap: addresses of live pages only.
create or replace function public.live_coach_slugs()
returns setof text
language sql stable security definer set search_path = public
as $$
  select c.slug from public.coaches c
  where c.published and public.coach_is_active(c.id)
$$;

-- The signed-in coach's own plan, for the dashboard banner.
create or replace function public.my_plan()
returns jsonb
language sql stable security definer set search_path = public
as $$
  select jsonb_build_object(
    'status', c.billing_status,
    'trial_ends_at', c.trial_ends_at,
    'suspended', c.suspended,
    'active', public.coach_is_active(c.id)
  )
  from public.coaches c where c.owner_id = auth.uid()
$$;

-- Players can't send requests to a coach whose trial has ended.
-- (The coach adding their own entries in the dashboard is not affected.)
create or replace function public.bookings_entitlement()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if auth.uid() is null and not public.coach_is_active(new.coach_id) then
    raise exception 'This coach is not taking requests right now.';
  end if;
  return new;
end;
$$;
drop trigger if exists bookings_entitlement on public.bookings;
create trigger bookings_entitlement before insert on public.bookings
  for each row execute function public.bookings_entitlement();

-- Admin list, now with trial dates. (Replaces the earlier version.)
drop function if exists public.admin_coaches_v2();
create function public.admin_coaches_v2()
returns table(id uuid, slug text, name text, title text, owner_email text, published boolean,
  created_at timestamptz, clubs bigint, lessons bigint, bookings_total bigint,
  bookings_pending bigint, last_request_at timestamptz, suspended boolean,
  billing_status text, last_sign_in_at timestamptz, requests_24h bigint,
  trial_ends_at timestamptz)
language plpgsql stable security definer set search_path = ''
as $$
begin
  if not (select public.is_platform_admin()) then raise exception 'Not allowed'; end if;
  return query
  select c.id, c.slug, c.profile ->> 'name', c.profile ->> 'title', u.email::text, c.published, c.created_at,
    (select count(*) from public.clubs x where x.coach_id = c.id),
    (select count(*) from public.lessons x where x.coach_id = c.id),
    (select count(*) from public.bookings b where b.coach_id = c.id),
    (select count(*) from public.bookings b where b.coach_id = c.id and b.status = 'pending'),
    (select max(b.requested_at) from public.bookings b where b.coach_id = c.id),
    c.suspended, c.billing_status, u.last_sign_in_at,
    (select count(*) from public.bookings b where b.coach_id = c.id and b.requested_at > now() - interval '24 hours'),
    c.trial_ends_at
  from public.coaches c
  join auth.users u on u.id = c.owner_id
  order by c.created_at desc;
end $$;

-- Extend (or restart) a trial by a number of days, and put the coach back on the trial plan.
create or replace function public.admin_extend_trial(p_coach uuid, p_days integer)
returns timestamptz
language plpgsql security definer set search_path = public
as $$
declare v timestamptz;
begin
  if not public.is_platform_admin() then raise exception 'Not allowed'; end if;
  if p_days < 1 or p_days > 365 then raise exception 'Choose 1 to 365 days'; end if;
  update public.coaches
    set billing_status = 'trial',
        trial_ends_at = greatest(now(), coalesce(trial_ends_at, now())) + make_interval(days => p_days)
    where id = p_coach
    returning trial_ends_at into v;
  return v;
end;
$$;

revoke all on function public.coach_is_active(uuid) from public, anon;
revoke all on function public.my_plan() from public, anon;
revoke all on function public.admin_coaches_v2() from public, anon;
revoke all on function public.admin_extend_trial(uuid, integer) from public, anon;
grant execute on function public.coach_is_live(text) to anon, authenticated;
grant execute on function public.live_coach_slugs() to anon, authenticated;
grant execute on function public.my_plan() to authenticated;
grant execute on function public.admin_coaches_v2() to authenticated;
grant execute on function public.admin_extend_trial(uuid, integer) to authenticated;
