-- Checks for repeat_lessons.sql. Run it in the Supabase SQL editor AFTER the migration.
-- It needs the demo coach (supabase/demo_coach.sql) and ends with an error on purpose:
-- the error aborts the transaction, so NOTHING is saved. Read the message, which starts
-- "TEST RESULT:". Every check should say ok / refused as described below.
--
--   1 ok rows=4 distinct_series=1        a 4-week series is created and shares one series id
--   2 refused ... (week 3, ...) rows_left=0   one bad week cancels the whole series
--   3 ok rows=2                          a series counts as ONE waiting request
--   3b limit still applies: ...several requests waiting...   3 separate waiting requests still block
--   4 old-style ok=true series_id_null=true   calls without the new arguments still work
--   5 request_booking overloads=1        only one request_booking function exists

begin;
do $test$
declare
  r text := ''; v_ids uuid[]; v_coach uuid; v_one uuid; v_brix uuid;
  d_mon date; d_wed date; n int; v_old uuid;
begin
  perform public.seed_demo_coach('demo@calspot.co.uk');
  select id into v_coach from public.coaches where slug = 'demo';
  select id into v_one from public.lessons where coach_id = v_coach and name = 'One-to-one lesson';
  select id into v_brix from public.clubs where coach_id = v_coach and name = 'Brixton Padel Club';
  d_mon := current_date + (((1 - extract(dow from current_date)::int + 6) % 7) + 1);
  d_wed := current_date + (((3 - extract(dow from current_date)::int + 6) % 7) + 1);

  v_ids := public.request_booking_series('demo', v_brix, v_one, d_wed + 14, 17, 'Test Player', 'series1@example.com', '+447700900199', 'test', 1, 4);
  select count(distinct series_id) into n from public.bookings where id = any(v_ids);
  r := r || format('[1 ok rows=%s distinct_series=%s dates=%s] ', array_length(v_ids, 1), n,
    (select string_agg(date::text, ',' order by date) from public.bookings where id = any(v_ids)));

  insert into public.bookings (coach_id, club_id, lesson_id, player_name, email, date, hour, status)
    values (v_coach, v_brix, v_one, 'Blocker', 'blocker@example.com', d_wed + 70, 17, 'confirmed');
  begin
    perform public.request_booking_series('demo', v_brix, v_one, d_wed + 56, 17, 'Test Two', 'series2@example.com', '', '', 1, 4);
    r := r || '[2 UNEXPECTED success] ';
  exception when others then
    select count(*) into n from public.bookings where lower(email) = 'series2@example.com';
    r := r || format('[2 refused: %s ; rows_left=%s] ', sqlerrm, n);
  end;

  insert into public.bookings (coach_id, club_id, lesson_id, player_name, email, date, hour, status, requested_at)
    values (v_coach, v_brix, v_one, 'P Three', 'series3@example.com', d_mon + 91, 17, 'pending', now() - interval '3 days'),
           (v_coach, v_brix, v_one, 'P Three', 'series3@example.com', d_mon + 98, 17, 'pending', now() - interval '3 days');
  begin
    v_ids := public.request_booking_series('demo', v_brix, v_one, d_mon + 21, 17, 'P Three', 'series3@example.com', '', '', 1, 2);
    r := r || format('[3 ok rows=%s] ', array_length(v_ids, 1));
  exception when others then
    r := r || format('[3 FAILED: %s] ', sqlerrm);
  end;

  insert into public.bookings (coach_id, club_id, lesson_id, player_name, email, date, hour, status, requested_at)
    values (v_coach, v_brix, v_one, 'P Four', 'series4@example.com', d_mon + 105, 17, 'pending', now() - interval '3 days'),
           (v_coach, v_brix, v_one, 'P Four', 'series4@example.com', d_mon + 105, 19, 'pending', now() - interval '3 days'),
           (v_coach, v_brix, v_one, 'P Four', 'series4@example.com', d_mon + 112, 17, 'pending', now() - interval '3 days');
  begin
    perform public.request_booking('demo', v_brix, v_one, d_mon + 28, 17, 'P Four', 'series4@example.com', '', '');
    r := r || '[3b UNEXPECTED success] ';
  exception when others then
    r := r || format('[3b limit still applies: %s] ', sqlerrm);
  end;

  v_old := public.request_booking('demo', v_brix, v_one, d_mon + 35, 17, 'Old Style', 'old@example.com', '', '');
  r := r || format('[4 old-style ok=%s series_id_null=%s] ', v_old is not null,
    (select series_id is null from public.bookings where id = v_old));

  select count(*) into n from pg_proc where proname = 'request_booking' and pronamespace = 'public'::regnamespace;
  r := r || format('[5 request_booking overloads=%s] ', n);

  raise exception 'TEST RESULT: %', r;
end
$test$;
rollback;
