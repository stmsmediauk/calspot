-- Calspot base database setup.
--
-- A snapshot of the live database taken on 24 Nov 2026, written down after the
-- fact: the tables, indexes, access rules (RLS), the image bucket and a few core
-- functions were originally created by hand in the Supabase dashboard.
--
-- To build a fresh database, run the files in this order:
--   1. schema.sql            (this file)
--   2. group_sessions.sql    booked_times(), request_booking() with spaces
--   3. spam_limits.sql
--   4. admin_tools.sql, trial.sql, site_settings.sql
--   5. calendar_feed.sql, playtomic_courts.sql, admin_support_view.sql,
--      admin_delete_coach.sql
--   6. repeat_lessons.sql    request_booking() with series, request_booking_series()
--   7. lock_down.sql         closes the public booking functions (needs the
--                            service key set on the server first)
--   8. demo_coach.sql        optional demo data
-- Then, in the Supabase dashboard: Authentication > turn on leaked-password
-- protection, and add yourself to platform_admins.
--
-- Not included: the data itself, and the auth.users table (Supabase manages it).
-- When you change the database, add a new .sql file here rather than editing
-- the live database by hand, so this folder stays the source of truth.

-- ---------------------------------------------------------------- tables

create table if not exists public.coaches (
  id uuid not null default gen_random_uuid(),
  owner_id uuid not null,
  slug text not null,
  published boolean not null default false,
  profile jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  suspended boolean not null default false,
  billing_status text not null default 'trial',
  trial_ends_at timestamptz default (now() + interval '14 days'),
  constraint coaches_pkey primary key (id),
  constraint coaches_owner_id_key unique (owner_id),
  constraint coaches_slug_key unique (slug),
  constraint coaches_owner_id_fkey foreign key (owner_id) references auth.users(id) on delete cascade,
  constraint coaches_billing_status_check check (billing_status = any (array['trial','paid','free','overdue'])),
  constraint coaches_slug_check check (slug ~ '^[a-z0-9][a-z0-9-]{1,38}[a-z0-9]$'),
  constraint coaches_slug_not_reserved check (slug <> all (array[
    'dashboard','signup','login','logout','onboarding','auth','api','preview','privacy','terms',
    'admin','app','www','calspot','support','help','about','pricing','contact','settings','static','assets',
    'forgot-password','reset-password','favicon','robots','sitemap',
    'examples','coach','brand','logos','landing','platform','blog','docs','status']))
);

create table if not exists public.clubs (
  id uuid not null default gen_random_uuid(),
  coach_id uuid not null,
  name text not null,
  address text not null default '',
  notes text not null default '',
  active boolean not null default true,
  "position" integer not null default 0,
  created_at timestamptz not null default now(),
  playtomic_url text,
  constraint clubs_pkey primary key (id),
  constraint clubs_coach_id_fkey foreign key (coach_id) references public.coaches(id) on delete cascade,
  constraint clubs_name_check check (char_length(name) >= 1 and char_length(name) <= 120),
  constraint clubs_address_check check (char_length(address) <= 300),
  constraint clubs_notes_check check (char_length(notes) <= 500),
  constraint clubs_playtomic_url_check check (playtomic_url is null or char_length(playtomic_url) <= 300)
);

create table if not exists public.lessons (
  id uuid not null default gen_random_uuid(),
  coach_id uuid not null,
  name text not null,
  duration integer not null,
  price numeric(8,2) not null,
  description text not null default '',
  active boolean not null default true,
  "position" integer not null default 0,
  created_at timestamptz not null default now(),
  capacity integer not null default 1,
  constraint lessons_pkey primary key (id),
  constraint lessons_coach_id_fkey foreign key (coach_id) references public.coaches(id) on delete cascade,
  constraint lessons_name_check check (char_length(name) >= 1 and char_length(name) <= 120),
  constraint lessons_description_check check (char_length(description) <= 500),
  constraint lessons_duration_check check (duration >= 15 and duration <= 480),
  constraint lessons_price_check check (price >= 0),
  constraint lessons_capacity_check check (capacity >= 1 and capacity <= 40)
);

create table if not exists public.availability_rules (
  id uuid not null default gen_random_uuid(),
  coach_id uuid not null,
  club_id uuid not null,
  lesson_id uuid,
  day smallint not null,
  start_hour numeric(4,2) not null,
  end_hour numeric(4,2) not null,
  effective_start date not null,
  effective_end date not null,
  constraint availability_rules_pkey primary key (id),
  constraint availability_rules_coach_id_fkey foreign key (coach_id) references public.coaches(id) on delete cascade,
  constraint availability_rules_club_id_fkey foreign key (club_id) references public.clubs(id) on delete cascade,
  constraint availability_rules_lesson_id_fkey foreign key (lesson_id) references public.lessons(id) on delete cascade,
  constraint availability_rules_day_check check (day >= 0 and day <= 6),
  constraint availability_rules_start_hour_check check (start_hour >= 0 and start_hour < 24),
  constraint availability_rules_check check (end_hour > start_hour and end_hour <= 24),
  constraint availability_rules_check1 check (effective_end >= effective_start)
);

create table if not exists public.availability_exceptions (
  id uuid not null default gen_random_uuid(),
  coach_id uuid not null,
  club_id uuid,
  lesson_id uuid,
  date date not null,
  kind text not null,
  start_hour numeric(4,2) not null,
  end_hour numeric(4,2) not null,
  constraint availability_exceptions_pkey primary key (id),
  constraint availability_exceptions_coach_id_fkey foreign key (coach_id) references public.coaches(id) on delete cascade,
  constraint availability_exceptions_club_id_fkey foreign key (club_id) references public.clubs(id) on delete cascade,
  constraint availability_exceptions_lesson_id_fkey foreign key (lesson_id) references public.lessons(id) on delete cascade,
  constraint availability_exceptions_kind_check check (kind = any (array['blocked','extra'])),
  constraint availability_exceptions_start_hour_check check (start_hour >= 0 and start_hour < 24),
  constraint availability_exceptions_check check (end_hour > start_hour and end_hour <= 24)
);

create table if not exists public.bookings (
  id uuid not null default gen_random_uuid(),
  coach_id uuid not null,
  club_id uuid not null,
  lesson_id uuid not null,
  player_name text not null,
  email text not null,
  phone text not null default '',
  date date not null,
  hour numeric(4,2) not null,
  status text not null default 'pending',
  message text not null default '',
  reply text not null default '',
  suggested_date date,
  suggested_hour numeric(4,2),
  requested_at timestamptz not null default now(),
  spaces integer not null default 1,
  court_booked boolean not null default false,
  series_id uuid,
  constraint bookings_pkey primary key (id),
  constraint bookings_coach_id_fkey foreign key (coach_id) references public.coaches(id) on delete cascade,
  constraint bookings_club_id_fkey foreign key (club_id) references public.clubs(id) on delete restrict,
  constraint bookings_lesson_id_fkey foreign key (lesson_id) references public.lessons(id) on delete restrict,
  constraint bookings_player_name_check check (char_length(player_name) >= 1 and char_length(player_name) <= 120),
  constraint bookings_email_check check (char_length(email) >= 3 and char_length(email) <= 254 and email like '%_@_%'),
  constraint bookings_phone_check check (char_length(phone) <= 30),
  constraint bookings_hour_check check (hour >= 0 and hour < 24),
  constraint bookings_status_check check (status = any (array['pending','confirmed','declined','cancelled'])),
  constraint bookings_message_check check (char_length(message) <= 1000),
  constraint bookings_reply_check check (char_length(reply) <= 1000),
  constraint bookings_spaces_check check (spaces >= 1 and spaces <= 40)
);

create table if not exists public.platform_admins (
  user_id uuid not null,
  created_at timestamptz not null default now(),
  constraint platform_admins_pkey primary key (user_id),
  constraint platform_admins_user_id_fkey foreign key (user_id) references auth.users(id) on delete cascade
);

-- site_settings and coach_calendar_tokens are created by site_settings.sql and
-- calendar_feed.sql.

-- ---------------------------------------------------------------- indexes

create index if not exists bookings_club_id_idx on public.bookings using btree (club_id);
create index if not exists bookings_coach_date_idx on public.bookings using btree (coach_id, date);
create index if not exists bookings_lesson_id_idx on public.bookings using btree (lesson_id);
create index if not exists clubs_coach_id_idx on public.clubs using btree (coach_id);
create index if not exists exceptions_club_id_idx on public.availability_exceptions using btree (club_id);
create index if not exists exceptions_coach_id_idx on public.availability_exceptions using btree (coach_id);
create index if not exists exceptions_lesson_id_idx on public.availability_exceptions using btree (lesson_id);
create index if not exists lessons_coach_id_idx on public.lessons using btree (coach_id);
create index if not exists rules_club_id_idx on public.availability_rules using btree (club_id);
create index if not exists rules_coach_id_idx on public.availability_rules using btree (coach_id);
create index if not exists rules_lesson_id_idx on public.availability_rules using btree (lesson_id);
-- bookings_series_idx is created by repeat_lessons.sql.

-- ---------------------------------------------------------------- functions

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
set search_path to ''
as $$
begin new.updated_at = now(); return new; end $$;

drop trigger if exists coaches_touch on public.coaches;
create trigger coaches_touch before update on public.coaches
  for each row execute function public.touch_updated_at();

create or replace function public.is_platform_admin()
returns boolean
language sql
stable
security definer
set search_path to ''
as $$
  select exists (select 1 from public.platform_admins where user_id = (select auth.uid()))
$$;

create or replace function public.admin_coaches()
returns table(id uuid, slug text, name text, title text, owner_email text, published boolean,
              created_at timestamptz, clubs bigint, lessons bigint, bookings_total bigint,
              bookings_pending bigint, last_request_at timestamptz)
language plpgsql
stable
security definer
set search_path to ''
as $$
begin
  if not (select public.is_platform_admin()) then raise exception 'Not allowed'; end if;
  return query
  select c.id, c.slug, c.profile ->> 'name', c.profile ->> 'title', u.email::text, c.published, c.created_at,
    (select count(*) from public.clubs x where x.coach_id = c.id),
    (select count(*) from public.lessons x where x.coach_id = c.id),
    (select count(*) from public.bookings b where b.coach_id = c.id),
    (select count(*) from public.bookings b where b.coach_id = c.id and b.status = 'pending'),
    (select max(b.requested_at) from public.bookings b where b.coach_id = c.id)
  from public.coaches c
  join auth.users u on u.id = c.owner_id
  order by c.created_at desc;
end $$;

create or replace function public.admin_set_published(p_coach uuid, p_published boolean)
returns void
language plpgsql
security definer
set search_path to ''
as $$
begin
  if not (select public.is_platform_admin()) then raise exception 'Not allowed'; end if;
  update public.coaches set published = p_published where id = p_coach;
end $$;

-- Which slots are taken, for the public booking page (no player details).
create or replace function public.taken_slots(p_slug text)
returns table(date date, hour numeric, club_id uuid)
language sql
stable
security definer
set search_path to ''
as $$
  select b.date, b.hour, b.club_id
  from public.bookings b
  join public.coaches c on c.id = b.coach_id
  where c.slug = p_slug and c.published and b.status in ('pending', 'confirmed')
    and b.date >= current_date
$$;

-- slug_available() is defined in lock_down.sql.

-- ---------------------------------------------------------------- access rules

alter table public.coaches enable row level security;
alter table public.clubs enable row level security;
alter table public.lessons enable row level security;
alter table public.availability_rules enable row level security;
alter table public.availability_exceptions enable row level security;
alter table public.bookings enable row level security;
alter table public.platform_admins enable row level security;  -- no policies: only the database functions read it

-- Coaches manage their own rows.
create policy coaches_owner_all on public.coaches for all to authenticated
  using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()));
create policy clubs_owner_all on public.clubs for all to authenticated
  using (coach_id in (select id from public.coaches where owner_id = (select auth.uid())))
  with check (coach_id in (select id from public.coaches where owner_id = (select auth.uid())));
create policy lessons_owner_all on public.lessons for all to authenticated
  using (coach_id in (select id from public.coaches where owner_id = (select auth.uid())))
  with check (coach_id in (select id from public.coaches where owner_id = (select auth.uid())));
create policy availability_rules_owner_all on public.availability_rules for all to authenticated
  using (coach_id in (select id from public.coaches where owner_id = (select auth.uid())))
  with check (coach_id in (select id from public.coaches where owner_id = (select auth.uid())));
create policy availability_exceptions_owner_all on public.availability_exceptions for all to authenticated
  using (coach_id in (select id from public.coaches where owner_id = (select auth.uid())))
  with check (coach_id in (select id from public.coaches where owner_id = (select auth.uid())));
create policy bookings_owner_all on public.bookings for all to authenticated
  using (coach_id in (select id from public.coaches where owner_id = (select auth.uid())))
  with check (coach_id in (select id from public.coaches where owner_id = (select auth.uid())));

-- Visitors can read a page's content once it is published. Bookings are never public.
create policy coaches_public_read on public.coaches for select to anon, authenticated
  using (published);
create policy clubs_public_read on public.clubs for select to anon, authenticated
  using (coach_id in (select id from public.coaches where published));
create policy lessons_public_read on public.lessons for select to anon, authenticated
  using (coach_id in (select id from public.coaches where published));
create policy availability_rules_public_read on public.availability_rules for select to anon, authenticated
  using (coach_id in (select id from public.coaches where published));
create policy availability_exceptions_public_read on public.availability_exceptions for select to anon, authenticated
  using (coach_id in (select id from public.coaches where published));

-- ---------------------------------------------------------------- images

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('coach-media', 'coach-media', true, 5242880,
        array['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'])
on conflict (id) do nothing;

-- A coach can only add, change or remove files in their own folder (named by coach id).
create policy coach_media_write on storage.objects for insert to authenticated
  with check (bucket_id = 'coach-media' and (storage.foldername(name))[1] in
    (select id::text from public.coaches where owner_id = (select auth.uid())));
create policy coach_media_update on storage.objects for update to authenticated
  using (bucket_id = 'coach-media' and (storage.foldername(name))[1] in
    (select id::text from public.coaches where owner_id = (select auth.uid())));
create policy coach_media_delete on storage.objects for delete to authenticated
  using (bucket_id = 'coach-media' and (storage.foldername(name))[1] in
    (select id::text from public.coaches where owner_id = (select auth.uid())));
