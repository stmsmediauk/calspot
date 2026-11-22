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

const overlaps = (aStart: number, aEnd: number, bStart: number, bEnd: number) =>
  aStart < bEnd && bStart < aEnd;

/**
 * Bookable start times (decimal hours) for a lesson on a date. Starts step by
 * the lesson length inside each availability window. Blocked exceptions and
 * pending or confirmed bookings (any club, since the coach cannot be in two
 * places) remove overlapping starts. Illustrative scheduling for the
 * prototype, not the production slot generator.
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
  const taken = bookings
    .filter(
      (b) =>
        b.date === date && (b.status === "pending" || b.status === "confirmed"),
    )
    .map((b) => ({
      start: b.hour,
      end: b.hour + (lessons.find((l) => l.id === b.lessonId)?.duration ?? 60) / 60,
    }));
  const starts = new Set<number>();
  for (const w of windows)
    for (let s = w.start; s + length <= w.end + 1e-9; s += length) {
      const end = s + length;
      if (blocked.some((e) => overlaps(s, end, e.start, e.end))) continue;
      if (taken.some((t) => overlaps(s, end, t.start, t.end))) continue;
      starts.add(s);
    }
  return [...starts].sort((a, b) => a - b);
}
