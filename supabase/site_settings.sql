-- Run once in the Supabase SQL editor (safe to run again).
-- Run AFTER admin_tools.sql. Adds site-wide settings that platform admins can change from /admin.
--
-- Anyone can read settings (the landing page needs them). Only platform admins can change them,
-- and only through admin_set_setting().

create table if not exists public.site_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);
alter table public.site_settings enable row level security;

drop policy if exists "Anyone can read site settings" on public.site_settings;
create policy "Anyone can read site settings" on public.site_settings
  for select using (true);
grant select on public.site_settings to anon, authenticated;

create or replace function public.admin_set_setting(p_key text, p_value jsonb)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.is_platform_admin() then raise exception 'Not allowed'; end if;
  insert into public.site_settings (key, value, updated_at)
    values (p_key, p_value, now())
    on conflict (key) do update set value = excluded.value, updated_at = now();
end $$;

-- The founding coach offer starts switched on.
insert into public.site_settings (key, value) values ('founding_offer_active', 'true'::jsonb)
  on conflict (key) do nothing;
