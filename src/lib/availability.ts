import type { Booking, Exception, Lesson, Rule } from "./mock-data";

/** Weekday for a YYYY-MM-DD key, 0 = Sunday, independent of the viewer's timezone. */
export function weekdayOf(key: string) {
  return new Date(`${key}T12:00:00Z`).getUTCDay();
}

type Input = {
  date: string;
  rules: Rule[];
  exceptions: Exception[];
  bookings: Booking[];
  lessons: Lesson[];
  lesson: Lesson;
  /** A club id, or "any" to include every club. */
  clubId: string;
};

const isLive = (b: Booking) =>
  b.status === "pending" || b.status === "confirmed";

/**
 * Spaces already taken in one session: pending and confirmed requests for the
 * same lesson and start time on a date. A club of "any" matches every club.
 */
export function spacesTaken(
  bookings: Booking[],
  lessonId: string,
  clubId: string,
  date: string,
  hour: number,
) {
  return bookings
    .filter(
      (b) =>
        isLive(b) &&
        b.date === date &&
        b.lessonId === lessonId &&
        b.hour === hour &&
        (clubId === "any" || b.clubId === clubId),
    )
    .reduce((sum, b) => sum + (b.spaces ?? 1), 0);
}

const overlaps = (aStart: number, aEnd: number, bStart: number, bEnd: number) =>
  aStart < bEnd && bStart < aEnd;

/**
 * Bookable start times (decimal hours) for a lesson on a date. Starts step by
 * the lesson length inside each availability window. Blocked exceptions and
 * pending or confirmed bookings (any club, since the coach cannot be in two
 * places) remove overlapping starts. Players can share a group session: a
 * start with the same lesson and time stays open until its spaces are used.
 * Illustrative scheduling, not the production slot generator (the database
 * makes the final decision when a request is sent).
 */
export function startTimes({
  date,
  rules,
  exceptions,
  bookings,
  lessons,
  lesson,
  clubId,
}: Input): number[] {
  const length = lesson.duration / 60;
  const matchesLesson = (id: string) => id === "all" || id === lesson.id;
  const matchesClub = (id: string) => clubId === "any" || id === clubId;
  const windows = [
    ...rules
      .filter(
        (r) =>
          r.day === weekdayOf(date) &&
          date >= r.effectiveStart &&
          date <= r.effectiveEnd &&
          matchesLesson(r.lessonId) &&
          matchesClub(r.clubId),
      )
      .map((r) => ({ start: r.start, end: r.end })),
    ...exceptions
      .filter(
        (e) =>
          e.kind === "extra" &&
          e.date === date &&
          matchesLesson(e.lessonId) &&
          matchesClub(e.clubId),
      )
      .map((e) => ({ start: e.start, end: e.end })),
  ];
  const blocked = exceptions.filter(
    (e) => e.kind === "blocked" && e.date === date,
  );
  const capacity = lesson.capacity ?? 1;
  const taken = bookings
    .filter((b) => b.date === date && isLive(b))
    .map((b) => ({
      booking: b,
      start: b.hour,
      end:
        b.hour +
        (b.minutes ??
          lessons.find((l) => l.id === b.lessonId)?.duration ??
          60) / 60,
    }));
  const starts = new Set<number>();
  for (const w of windows)
    for (let s = w.start; s + length <= w.end + 1e-9; s += length) {
      const end = s + length;
      if (blocked.some((e) => overlaps(s, end, e.start, e.end))) continue;
      if (
        taken.some((t) => {
          if (!overlaps(s, end, t.start, t.end)) return false;
          // The same session with spaces left is still open to join.
          const sameSession =
            capacity > 1 &&
            t.booking.lessonId === lesson.id &&
            t.start === s &&
            (clubId === "any" || t.booking.clubId === clubId);
          return !(
            sameSession &&
            spacesTaken(bookings, lesson.id, clubId, date, s) < capacity
          );
        })
      )
        continue;
      starts.add(s);
    }
  return [...starts].sort((a, b) => a - b);
}
