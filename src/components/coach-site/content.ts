/** One shared page template. Profile, clubs, lessons and availability come from the local workspace. */
import { platform } from "@/lib/platform";
import { zoneName as zoneOf } from "@/lib/dates";
import { demoWeek, time } from "@/lib/mock-data";

export const publicCoach = {
  basePath: platform.publicBasePath,
  /** Mirrors the platform prototype switch (see src/lib/platform.ts). */
  demoMode: platform.demoMode,
  /** Monday of the first sample week, matching the dashboard's demo week. */
  weekStart: demoWeek,
  timeZone: platform.timeZone,
};
/** Number of weeks of availability shown in the request form. */
export const sampleWeeks = 2;
/** Formats decimal hours as HH:MM. */
export const formatHour = time;

/** Generic, platform-true answers shown when the FAQ is switched on. */
export const faqItems = [
  {
    question: "How does booking work?",
    answer:
      "You send a request with the time you would like. Your coach reviews it and replies to confirm. Nothing is booked until they approve it.",
  },
  {
    question: "Do I pay on this page?",
    answer:
      "No. This page does not take payment. Prices are a guide, and your coach will tell you how to pay.",
  },
  {
    question: "Who arranges the court?",
    answer:
      "A request does not reserve a court. Your coach will confirm court availability with you.",
  },
];

export function sampleDay(week: number, index: number) {
  const [y, m, d] = publicCoach.weekStart.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + week * 7 + index));
}
export function formatDay(
  date: Date,
  options: Intl.DateTimeFormatOptions,
): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "UTC",
    ...options,
  }).format(date);
}
/** Short zone name for a date, e.g. GMT in winter and BST in summer. */
export function zoneName(date: Date) {
  return zoneOf(date, publicCoach.timeZone);
}

/** Preserve the first prototype's shared lesson links. */
export function resolveLessonId(value?: string) {
  const aliases: Record<string, string> = {
    private: "l1",
    duo: "l2",
    group: "l3",
  };
  return value
    ? Object.hasOwn(aliases, value)
      ? aliases[value]
      : value
    : "l1";
}

/** Splits a name into a stacked lockup: first word, then the remainder. */
export function nameLines(name: string) {
  const [first, ...rest] = name.trim().split(/\s+/);
  return rest.length ? [first, rest.join(" ")] : [first];
}
