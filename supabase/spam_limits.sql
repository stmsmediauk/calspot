-- Run once in the Supabase SQL editor (safe to run again).
-- Database-level limits on booking requests, in case someone bypasses the form:
--   no more than 30 requests an hour to one coach,
--   no more than 5 a day from one email address,
--   no more than 5 a day from one phone number.
create or replace function public.bookings_rate_limit()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if (select count(*) from public.bookings
        where coach_id = new.coach_id and requested_at > now() - interval '1 hour') >= 30 then
    raise exception 'Too many requests just now. Please try again later.';
  end if;
  if new.email is not null and new.email <> '' and
     (select count(*) from public.bookings
        where lower(email) = lower(new.email) and requested_at > now() - interval '24 hours') >= 5 then
    raise exception 'Too many requests from this email today. Please try again tomorrow.';
  end if;
  if new.phone is not null and new.phone <> '' and
     (select count(*) from public.bookings
        where phone = new.phone and requested_at > now() - interval '24 hours') >= 5 then
    raise exception 'Too many requests from this number today. Please try again tomorrow.';
  end if;
  return new;
end;
$$;
drop trigger if exists bookings_rate_limit on public.bookings;
create trigger bookings_rate_limit before insert on public.bookings
  for each row execute function public.bookings_rate_limit();
