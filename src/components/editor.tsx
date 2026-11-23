"use client";
import { useState } from "react";
import * as mock from "@/lib/mock-data";
import type { Club, Lesson, Rule } from "@/lib/mock-data";
export function Editor({
  kind,
  item,
  defaults,
  clubs,
  lessons,
  onSave,
  onCancel,
}: {
  kind: string;
  item?: Club | Lesson | Rule;
  /** Pre-filled values for a new record. */
  defaults?: Record<string, unknown>;
  clubs: Club[];
  lessons: Lesson[];
  onSave: (value: Record<string, unknown>) => void;
  onCancel: () => void;
}) {
  const [error, setError] = useState("");
  const values = { ...defaults, ...(item ?? {}) } as Record<string, unknown>;
  const field = (
    name: string,
    label: string,
    type = "text",
    fallback: string | number = "",
  ) => (
    <label>
      {label}
      <input
        name={name}
        type={type}
        defaultValue={String(values[name] ?? fallback)}
        required={name !== "notes" && name !== "description"}
        min={type === "number" ? (name === "capacity" ? 1 : 0) : undefined}
        max={name === "capacity" ? 40 : undefined}
        step={
          name === "price" ? "0.01" : name === "duration" ? "30" : undefined
        }
        maxLength={type === "text" ? 200 : undefined}
      />
    </label>
  );
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const data = Object.fromEntries(new FormData(e.currentTarget));
        if (kind === "club" || kind === "lesson") {
          if (!String(data.name).trim()) {
            setError("Please enter a name.");
            return;
          }
          onSave({
            ...data,
            active: values.active ?? true,
            ...(kind === "lesson"
              ? {
                  duration: Number(data.duration),
                  price: Number(data.price),
                  capacity: Math.min(
                    40,
                    Math.max(1, Math.round(Number(data.capacity)) || 1),
                  ),
                }
              : {}),
          });
          return;
        }
        const start =
            Number(String(data.start).split(":")[0]) +
            Number(String(data.start).split(":")[1]) / 60,
          end =
            Number(String(data.end).split(":")[0]) +
            Number(String(data.end).split(":")[1]) / 60;
        if (end <= start) {
          setError("End time must be after the start time.");
          return;
        }
        if (kind === "rule" && data.effectiveEnd < data.effectiveStart) {
          setError("Effective end must be on or after the start date.");
          return;
        }
        onSave({ ...data, start, end, day: Number(data.day) });
      }}
    >
      {kind === "club" ? (
        <>
          {field("name", "Club name")}
          {field("address", "Address")}
          {field("notes", "Venue notes")}
        </>
      ) : kind === "lesson" ? (
        <>
          {field("name", "Lesson name")}
          {field("description", "Description")}
          <label>
            Duration
            <select
              aria-label="Duration"
              name="duration"
              defaultValue={String(values.duration ?? 60)}
            >
              <option value="60">60 minutes</option>
              <option value="90">90 minutes</option>
              <option value="120">120 minutes</option>
            </select>
          </label>
          {field("capacity", "Players per session", "number", 1)}
          <p className="footnote">
            1 for a private lesson, 2 for a duo, 4 for a small group, 12 for an
            americano. Players book spaces, and the session closes when it is
            full.
          </p>
          {field("price", "Indicative price per person (£)", "number", 65)}
          <p className="footnote">
            For information only. No payments are collected.
          </p>
        </>
      ) : (
        <>
          {kind === "rule" ? (
            <label>
              Day
              <select
                aria-label="Day"
                name="day"
                defaultValue={String(values.day ?? 1)}
              >
                {[
                  "Sunday",
                  "Monday",
                  "Tuesday",
                  "Wednesday",
                  "Thursday",
                  "Friday",
                  "Saturday",
                ].map((d, i) => (
                  <option key={d} value={i}>
                    {d}
                  </option>
                ))}
              </select>
            </label>
          ) : (
            <>
              {field("date", "Date", "date", "2026-11-23")}
              <label>
                Exception type
                <select aria-label="Exception type" name="kind">
                  <option value="blocked">
                    Block time / holiday (all clubs)
                  </option>
                  <option value="extra">Extra availability</option>
                </select>
              </label>
            </>
          )}
          <label>
            Club
            <select
              aria-label="Club"
              name="clubId"
              defaultValue={String(
                values.clubId ?? clubs.find((c) => c.active)?.id,
              )}
              required
            >
              {clubs
                .filter((c) => c.active || c.id === values.clubId)
                .map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
            </select>
          </label>
          <label>
            Lesson
            <select
              aria-label="Lesson"
              name="lessonId"
              defaultValue={String(values.lessonId ?? "all")}
              required
            >
              <option value="all">All lessons</option>
              {lessons
                .filter((l) => l.active || l.id === values.lessonId)
                .map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                  </option>
                ))}
            </select>
          </label>
          <div className="form-columns">
            {field(
              "start",
              "Start time",
              "time",
              mock.time(Number(values.start ?? 9)),
            )}
            {field(
              "end",
              "End time",
              "time",
              mock.time(Number(values.end ?? 15)),
            )}
          </div>
          {kind === "rule" && (
            <div className="form-columns">
              {field("effectiveStart", "Effective from", "date", "2026-11-23")}
              {field("effectiveEnd", "Effective until", "date", "2027-03-31")}
            </div>
          )}
          <p className="footnote">
            Local times in Europe/London. Existing bookings stay in your
            calendar.
          </p>
        </>
      )}
      {error && (
        <p role="alert" className="form-error">
          {error}
        </p>
      )}
      <div className="form-actions">
        <button type="button" className="button secondary" onClick={onCancel}>
          Cancel
        </button>
        <button className="button" type="submit">
          Save {kind === "rule" || kind === "exception" ? "availability" : kind}
        </button>
      </div>
    </form>
  );
}
