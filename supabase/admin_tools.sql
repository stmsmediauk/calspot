-- Run once in the Supabase SQL editor (safe to run again).
-- Adds suspend, billing status, activity, and spam clean-up for platform admins.

alter table public.coaches
  add column if not exists suspended boolean not null default false,
  add column if not exists billing_status text not null default 'trial';

do $$ begin
  alter table public.coaches add constraint coaches_billing_status_check
    check (billing_status in ('trial','paid','free','overdue'));
exception when duplicate_object then null; end $$;

-- Coaches cannot change their own suspension or billing, or publish while suspended.
create or replace function public.coaches_guard()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if not public.is_platform_admin() then
    new.suspended := old.suspended;
    new.billing_status := old.billing_status;
    if old.suspended and new.published then
      raise exception 'This page has been suspended. Please contact Calspot support.';
    end if;
  end if;
  return new;
end;
$$;
drop trigger if exists coaches_guard on public.coaches;
create trigger coaches_guard before update on public.coaches
  for each row execute function public.coaches_guard();

create or replace function public.admin_coaches_v2()
returns table(id uuid, slug text, name text, title text, owner_email text, published boolean,
  created_at timestamptz, clubs bigint, lessons bigint, bookings_total bigint,
  bookings_pending bigint, last_request_at timestamptz, suspended boolean,
  billing_status text, last_sign_in_at timestamptz, requests_24h bigint)
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
    (select count(*) from public.bookings b where b.coach_id = c.id and b.requested_at > now() - interval '24 hours')
  from public.coaches c
  join auth.users u on u.id = c.owner_id
  order by c.created_at desc;
end $$;

create or replace function public.admin_set_suspended(p_coach uuid, p_suspended boolean)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.is_platform_admin() then raise exception 'Not allowed'; end if;
  update public.coaches
    set suspended = p_suspended, published = case when p_suspended then false else published end
    where id = p_coach;
end $$;

create or replace function public.admin_set_billing(p_coach uuid, p_status text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.is_platform_admin() then raise exception 'Not allowed'; end if;
  update public.coaches set billing_status = p_status where id = p_coach;
end $$;

-- Spam clean-up: removes a coach's waiting (pending) requests only.
create or replace function public.admin_clear_pending(p_coach uuid)
returns integer language plpgsql security definer set search_path = public as $$
declare n integer;
begin
  if not public.is_platform_admin() then raise exception 'Not allowed'; end if;
  delete from public.bookings where coach_id = p_coach and status = 'pending';
  get diagnostics n = row_count;
  return n;
end $$;

revoke all on function public.admin_coaches_v2() from public, anon;
revoke all on function public.admin_set_suspended(uuid, boolean) from public, anon;
revoke all on function public.admin_set_billing(uuid, text) from public, anon;
revoke all on function public.admin_clear_pending(uuid) from public, anon;
grant execute on function public.admin_coaches_v2() to authenticated;
grant execute on function public.admin_set_suspended(uuid, boolean) to authenticated;
grant execute on function public.admin_set_billing(uuid, text) to authenticated;
grant execute on function public.admin_clear_pending(uuid) to authenticated;
