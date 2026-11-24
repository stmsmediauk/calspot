"use client";
import type { ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import * as mock from "@/lib/mock-data";
import { addDays } from "@/lib/week-edit";

const firstOf = (key: string) => `${key.slice(0, 7)}-01`;

/** First of the month before or after the given month key (any date in it). */
export const shiftMonth = (key: string, by: number) => {
  const d = new Date(`${firstOf(key)}T12:00:00Z`);
  d.setUTCMonth(d.getUTCMonth() + by);
  return d.toISOString().slice(0, 10);
};

/** Every date shown for a month, padded to whole Monday-first weeks. */
export function monthDates(key: string) {
  const first = firstOf(key);
  const lead = (new Date(`${first}T12:00:00Z`).getUTCDay() + 6) % 7;
  const next = shiftMonth(first, 1);
  const days = Math.round(
    (Date.parse(`${next}T12:00:00Z`) - Date.parse(`${first}T12:00:00Z`)) /
      86400000,
  );
  const total = Math.ceil((lead + days) / 7) * 7;
  return Array.from({ length: total }, (_, i) => addDays(first, i - lead));
}

export function MonthTitle({ month }: { month: string }) {
  return (
    <>
      {mock
        .parseDate(month)
        .toLocaleDateString("en-GB", { month: "long", year: "numeric" })}
    </>
  );
}

export function MonthNav({
  month,
  setMonth,
}: {
  month: string;
  setMonth: (key: string) => void;
}) {
  const thisMonth = firstOf(mock.today());
  return (
    <>
      <button
        type="button"
        className="icon-button"
        aria-label="Previous month"
        disabled={firstOf(month) <= thisMonth}
        onClick={() => setMonth(shiftMonth(month, -1))}
      >
        <ChevronLeft size={18} aria-hidden="true" />
      </button>
      <button
        type="button"
        className="icon-button"
        aria-label="Next month"
        onClick={() => setMonth(shiftMonth(month, 1))}
      >
        <ChevronRight size={18} aria-hidden="true" />
      </button>
    </>
  );
}

/** A month of dates. The caller draws each cell. */
export function MonthGrid({
  month,
  mini,
  cell,
}: {
  month: string;
  mini?: boolean;
  cell: (date: string, inMonth: boolean) => ReactNode;
}) {
  return (
    <div className={`cal-grid${mini ? " mini" : ""}`}>
      {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
        <span className="cal-dow" key={d}>
          {d}
        </span>
      ))}
      {monthDates(month).map((date) => (
        <div key={date}>
          {cell(date, date.slice(0, 7) === month.slice(0, 7))}
        </div>
      ))}
    </div>
  );
}
