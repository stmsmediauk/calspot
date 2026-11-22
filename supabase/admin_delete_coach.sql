-- Run once in the Supabase SQL editor. Lets a platform admin delete a coach.
-- Removes the coach's page, clubs, lessons, availability and booking requests,
-- then the coach's login. Admin accounts are protected.
create or replace function public.admin_delete_coach(p_coach uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare v_owner uuid;
begin
  if not public.is_platform_admin() then
    raise exception 'Not allowed';
  end if;
  select owner_id into v_owner from public.coaches where id = p_coach;
  if v_owner is null then
    raise exception 'Coach not found';
  end if;
  if exists (select 1 from public.platform_admins where user_id = v_owner) then
    raise exception 'Admin accounts cannot be deleted here';
  end if;
  delete from public.bookings where coach_id = p_coach;
  delete from auth.users where id = v_owner; -- cascades to the coach and their data
end;
$$;
revoke all on function public.admin_delete_coach(uuid) from public, anon;
grant execute on function public.admin_delete_coach(uuid) to authenticated;
