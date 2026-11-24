-- Demo coach for showing Calspot to prospective coaches. Run once in the Supabase
-- SQL editor (safe to run again).
--
-- Setup, once:
--   1. Supabase > Authentication > Users > Add user > Create new user.
--      Use an email you control, set a password, tick "Auto confirm user".
--      (For example demo@calspot.co.uk. It is only used to log in to the dashboard.)
--   2. Run this whole file.
--   3. Run:  select public.seed_demo_coach('demo@calspot.co.uk');
--      (use the email from step 1)
--
-- The demo page is then live at /demo and the dashboard opens when you log in as
-- that user. Everything is fictional. The plan is Free, so it never pauses.
--
-- Reset before each demo: run the same select again. It deletes the demo coach's
-- clubs, lessons, availability and requests and re-creates them, with dates counted
-- from today so the calendar always looks current.
--
-- Safety: only the SQL editor (postgres) can run this. The browser cannot call it.

create or replace function public.seed_demo_coach(p_email text)
returns text
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_owner uuid;
  v_coach uuid;
  v_brixton uuid := gen_random_uuid();
  v_clapham uuid := gen_random_uuid();
  v_one uuid := gen_random_uuid();
  v_duo uuid := gen_random_uuid();
  v_group uuid := gen_random_uuid();
  v_dow int := extract(dow from current_date)::int;
  -- The next date (1 to 7 days ahead) that falls on the given weekday, 0 = Sunday.
  d_mon date; d_tue date; d_wed date; d_sat date;
begin
  select id into v_owner from auth.users where lower(email) = lower(p_email);
  if v_owner is null then
    raise exception 'No user with email %. Create it first in Authentication > Users.', p_email;
  end if;
  if exists (select 1 from public.platform_admins where user_id = v_owner) then
    raise exception 'That user is a platform admin. Use a separate demo login.';
  end if;
  if exists (select 1 from public.coaches where slug = 'demo' and owner_id <> v_owner) then
    raise exception 'The address "demo" belongs to another coach.';
  end if;

  d_mon := current_date + (((1 - v_dow + 6) % 7) + 1);
  d_tue := current_date + (((2 - v_dow + 6) % 7) + 1);
  d_wed := current_date + (((3 - v_dow + 6) % 7) + 1);
  d_sat := current_date + (((6 - v_dow + 6) % 7) + 1);

  -- Start clean: remove any earlier demo for this login.
  select id into v_coach from public.coaches where owner_id = v_owner;
  if v_coach is not null then
    delete from public.bookings where coach_id = v_coach;
    delete from public.availability_exceptions where coach_id = v_coach;
    delete from public.availability_rules where coach_id = v_coach;
    delete from public.lessons where coach_id = v_coach;
    delete from public.clubs where coach_id = v_coach;
    delete from public.coaches where id = v_coach;
  end if;

  insert into public.coaches (owner_id, slug, published, billing_status, trial_ends_at, profile)
  values (
    v_owner, 'demo', true, 'free', null,
    jsonb_build_object(
      'name', 'Maya Demo',
      'title', 'Padel coach',
      'tagline', 'Confidence first, technique second',
      'introduction', 'I help adult beginners and returning players fall in love with padel. My sessions are relaxed, practical and built around what you actually want to improve, whether that’s your first rally or your bandeja.',
      'experience', 'Level 2 padel coach with six years coaching adults and juniors across South London.',
      'location', 'South London',
      'highlights', jsonb_build_array(
        jsonb_build_object('value', '6 yrs', 'label', 'Coaching'),
        jsonb_build_object('value', '400+', 'label', 'Players coached'),
        jsonb_build_object('value', 'Level 2', 'label', 'Qualified')
      ),
      'testimonials', jsonb_build_array(
        jsonb_build_object(
          'quote', 'I’d never held a padel racket. Three sessions in, I was beating my partner. Maya makes it fun.',
          'attribution', 'Hannah, beginner'
        )
      ),
      'appearance', jsonb_build_object(
        'hero', 'editorial', 'palette', 'studio', 'accent', 'palette',
        'font', 'geist', 'corners', 'soft',
        'showHighlights', true, 'showTestimonials', true, 'showFaq', true,
        'poweredBy', false
      ),
      'photograph', '/examples/studio.jpg',
      'photoFocusX', 35,
      'photoFocusY', 30,
      'logo', null,
      'logoDark', null,
      -- A reserved Ofcom drama number, so no real person is ever contacted.
      'whatsapp', '+447700900123',
      'instagram', ''
    )
  )
  returning id into v_coach;

  insert into public.clubs (id, coach_id, name, address, notes, active, position) values
    (v_brixton, v_coach, 'Brixton Padel Club', '12 Railway Arches, London SW9', 'Indoor courts. Rackets available to borrow.', true, 0),
    (v_clapham, v_coach, 'Clapham Common Courts', 'Windmill Drive, London SW4', 'Outdoor courts, floodlit.', true, 1);

  insert into public.lessons (id, coach_id, name, duration, price, capacity, description, active, position) values
    (v_one,   v_coach, 'One-to-one lesson', 60, 55, 1, 'Fully tailored to you.', true, 0),
    (v_duo,   v_coach, 'Duo lesson',        60, 35, 2, 'Bring a friend and share the court.', true, 1),
    (v_group, v_coach, 'Beginner group',    90, 18, 4, 'Four players, all the basics.', true, 2);

  -- Weekly hours: Mon and Wed evenings in Brixton, Tue morning and Sat in Clapham.
  insert into public.availability_rules (coach_id, club_id, lesson_id, day, start_hour, end_hour, effective_start, effective_end) values
    (v_coach, v_brixton, null, 1, 17, 21, '2020-01-01', '2099-12-31'),
    (v_coach, v_brixton, null, 3, 17, 21, '2020-01-01', '2099-12-31'),
    (v_coach, v_clapham, null, 2,  9, 13, '2020-01-01', '2099-12-31'),
    (v_coach, v_clapham, null, 6,  9, 14, '2020-01-01', '2099-12-31');

  -- Requests in every state, using reserved Ofcom drama numbers and example.com emails.
  insert into public.bookings
    (coach_id, club_id, lesson_id, player_name, email, phone, date, hour, status, message, reply, suggested_date, suggested_hour, requested_at, spaces)
  values
    -- Waiting for a decision
    (v_coach, v_brixton, v_one,   'Hannah Price',  'hannah@example.com', '+447700900101', d_mon, 19,   'pending',   'Complete beginner, keen to learn the basics.', '', null, null, now() - interval '3 hours', 1),
    (v_coach, v_clapham, v_duo,   'Sam and Priya', 'sam@example.com',    '+447700900102', d_tue, 10,   'pending',   'We play tennis and want to try padel.',        '', null, null, now() - interval '1 day',   2),
    (v_coach, v_brixton, v_group, 'Daniel Okoye',  'daniel@example.com', '+447700900103', d_wed, 19,   'pending',   'Returning to the game after a break.',         '', null, null, now() - interval '2 days',  1),
    -- Confirmed: one tomorrow (shows in "Tomorrow" with a reminder), others this week and next
    (v_coach, v_brixton, v_one,   'Chloe Bennett', 'chloe@example.com',  '+447700900104', current_date + 1, 18, 'confirmed', 'Working on my bandeja.',                     'See you on court!', null, null, now() - interval '4 days', 1),
    (v_coach, v_clapham, v_group, 'Tom Walsh',     'tom@example.com',    '+447700900105', d_sat, 10,   'confirmed', 'Bringing my brother, first time playing.',     'Great, see you both there.', null, null, now() - interval '5 days', 2),
    (v_coach, v_clapham, v_group, 'Aisha Khan',    'aisha@example.com',  '+447700900106', d_sat, 10,   'confirmed', '',                                                 '', null, null, now() - interval '3 days', 1),
    (v_coach, v_brixton, v_duo,   'Ben and Lucy',  'ben@example.com',    '+447700900107', d_mon + 7, 19, 'confirmed', '',                                               '', null, null, now() - interval '2 days', 2),
    -- Declined, with another time offered
    (v_coach, v_brixton, v_one,   'Marcus Reid',   'marcus@example.com', '+447700900108', d_wed, 20,   'declined',  'Any chance of a late slot?',                   'Sorry, that one is taken. Could you do the Saturday morning instead?', d_sat, 9, now() - interval '6 days', 1);

  return 'Demo coach ready at /demo for ' || p_email;
end;
$$;

revoke all on function public.seed_demo_coach(text) from public, anon, authenticated;
