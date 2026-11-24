import { weekdayOf } from "./availability";
import type { Exception, Rule } from "./mock-data";

/** A YYYY-MM-DD key moved by a number of days, independent of timezone. */
export function addDays(key: string, days: number) {
  const d = new Date(`${key}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/** Rules that apply on a date. */
export const rulesOn = (rules: Rule[], date: string) =>
  rules.filter(
    (r) =>
      r.day === weekdayOf(date) &&
      date >= r.effectiveStart &&
      date <= r.effectiveEnd,
  );

/**
 * Takes a date range out of the rules, keeping the rest of each rule as it was.
 * A rule that spans the range is split in two, so this one week can differ
 * while the regular pattern carries on either side. Pass `only` to touch a
 * single rule.
 */
export function clearRange(
  rules: Rule[],
  from: string,
  to: string,
  only?: string,
): Rule[] {
  return rules.flatMap((r) => {
    if (
      (only && r.id !== only) ||
      r.effectiveStart > to ||
      r.effectiveEnd < from
    )
      return [r];
    const left =
      r.effectiveStart < from
        ? { ...r, effectiveEnd: addDays(from, -1) }
        : null;
    const right =
      r.effectiveEnd > to
        ? {
            ...r,
            id: left ? crypto.randomUUID() : r.id,
            effectiveStart: addDays(to, 1),
          }
        : null;
    return [left, right].filter((x): x is Rule => x !== null);
  });
}

type Window = Pick<Rule, "clubId" | "lessonId" | "start" | "end">;

/** Adds a time on one date, repeated on the same weekday for `weeks` weeks. */
export function addWindow(
  rules: Rule[],
  w: Window,
  date: string,
  weeks: number,
): Rule[] {
  return [
    ...rules,
    {
      ...w,
      id: crypto.randomUUID(),
      day: weekdayOf(date),
      effectiveStart: date,
      effectiveEnd: addDays(date, 7 * (Math.max(1, weeks) - 1)),
    },
  ];
}

/** One block of time on a date, from the regular rules or a one-off entry. */
export type DayWindow = {
  /** Where it comes from, which decides how it is removed. */
  source: "rule" | "extra" | "blocked";
  id: string;
  start: number;
  end: number;
  clubId: string;
  lessonId: string;
};

/** Everything set for a date, earliest first. */
export function windowsOn(
  rules: Rule[],
  exceptions: Exception[],
  date: string,
): DayWindow[] {
  return [
    ...rulesOn(rules, date).map((r) => ({ source: "rule" as const, ...r })),
    ...exceptions
      .filter((e) => e.date === date)
      .map((e) => ({
        source:
          e.kind === "blocked" ? ("blocked" as const) : ("extra" as const),
        ...e,
      })),
  ]
    .map((w) => ({
      source: w.source,
      id: w.id,
      start: w.start,
      end: w.end,
      clubId: w.clubId,
      lessonId: w.lessonId,
    }))
    .sort((a, b) => a.start - b.start);
}
