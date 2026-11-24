"use client";
import { useState } from "react";
import { Plus, X } from "lucide-react";
import { updateCoachWorkspace, useCoachWorkspace } from "@/lib/coach-workspace";
import * as mock from "@/lib/mock-data";
import { clearRange, windowsOn, type DayWindow } from "@/lib/week-edit";
import { useAdmin } from "./context";
import { MonthGrid, MonthNav, MonthTitle } from "./month-grid";

const toHour = (value: string) => {
  const [h, m] = value.split(":").map(Number);
  return h + (m || 0) / 60;
};

const presets = [
  { label: "Morning", start: "09:00", end: "12:00" },
  { label: "Afternoon", start: "12:00", end: "17:00" },
  { label: "Evening", start: "17:00", end: "21:00" },
];

export function DayPanel({ date }: { date: string }) {
  const { rules, exceptions, clubs, lessons } = useCoachWorkspace();
  const { notify } = useAdmin();
  const [start, setStart] = useState("17:00");
  const [end, setEnd] = useState("21:00");
  const activeClubs = clubs.filter((c) => c.active);
  const activeLessons = lessons.filter((l) => l.active);
  const [clubId, setClubId] = useState(activeClubs[0]?.id ?? "");
  const [lessonId, setLessonId] = useState("all");
  const [error, setError] = useState("");
  const [copying, setCopying] = useState(false);
  const [targets, setTargets] = useState<string[]>([]);
  const [copyMonth, setCopyMonth] = useState(date);
  const windows = windowsOn(rules, exceptions, date);
  const club = (id: string) => clubs.find((c) => c.id === id)?.name ?? "";
  const today = mock.today();

  const remove = (w: DayWindow) =>
    updateCoachWorkspace((c) =>
      w.source === "rule"
        ? { ...c, rules: clearRange(c.rules, date, date, w.id) }
        : { ...c, exceptions: c.exceptions.filter((x) => x.id !== w.id) },
    );

  const add = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clubId) {
      setError("Add a club first, under Clubs.");
      return;
    }
    if (toHour(end) <= toHour(start)) {
      setError("The end time must be after the start time.");
      return;
    }
    setError("");
    updateCoachWorkspace((c) => ({
      ...c,
      exceptions: [
        ...c.exceptions,
        {
          id: crypto.randomUUID(),
          date,
          kind: "extra",
          clubId,
          lessonId,
          start: toHour(start),
          end: toHour(end),
        },
      ],
    }));
  };

  const copy = () => {
    const source = windows.filter((w) => w.source !== "blocked");
    updateCoachWorkspace((c) => {
      const added = targets.flatMap((target) =>
        source
          .filter(
            (w) =>
              !windowsOn(c.rules, c.exceptions, target).some(
                (x) =>
                  x.source !== "blocked" &&
                  x.start === w.start &&
                  x.end === w.end &&
                  x.clubId === w.clubId &&
                  x.lessonId === w.lessonId,
              ),
          )
          .map((w) => ({
            id: crypto.randomUUID(),
            date: target,
            kind: "extra" as const,
            clubId: w.clubId,
            lessonId: w.lessonId,
            start: w.start,
            end: w.end,
          })),
      );
      return { ...c, exceptions: [...c.exceptions, ...added] };
    });
    notify(
      `Copied to ${targets.length} ${targets.length === 1 ? "date" : "dates"}.`,
    );
    setTargets([]);
    setCopying(false);
  };

  return (
    <div className="cal-panel">
      <h2>{mock.formatDate(date)}</h2>
      <div className="day-slots">
        {windows.length === 0 && (
          <span className="muted">
            No times, so players can’t book this day.
          </span>
        )}
        {windows.map((w) => (
          <span className="slot-chip" key={`${w.source}-${w.id}`}>
            <span className="slot-body">
              <strong>
                {w.start === 0 && w.end === 24
                  ? "All day"
                  : `${mock.time(w.start)}–${mock.time(w.end)}`}
              </strong>
              <small>
                {w.source === "blocked"
                  ? "Blocked"
                  : [
                      activeClubs.length > 1 ? club(w.clubId) : "",
                      activeLessons.length > 1
                        ? mock.lessonName(lessons, w.lessonId)
                        : "",
                    ]
                      .filter(Boolean)
                      .join(" · ") || "Open for booking"}
              </small>
            </span>
            <button
              type="button"
              className="chip-remove"
              aria-label={`Remove ${mock.time(w.start)} to ${mock.time(w.end)}`}
              onClick={() => remove(w)}
            >
              <X size={14} aria-hidden="true" />
            </button>
          </span>
        ))}
      </div>
      <form onSubmit={add} className="week-add">
        <strong>Add a time</strong>
        <div className="cal-presets">
          {presets.map((p) => (
            <button
              type="button"
              key={p.label}
              onClick={() => {
                setStart(p.start);
                setEnd(p.end);
              }}
            >
              {p.label}
            </button>
          ))}
        </div>
        <div className="form-columns">
          <label>
            From
            <input
              type="time"
              value={start}
              onChange={(e) => setStart(e.target.value)}
              required
            />
          </label>
          <label>
            Until
            <input
              type="time"
              value={end}
              onChange={(e) => setEnd(e.target.value)}
              required
            />
          </label>
        </div>
        {activeClubs.length > 1 && (
          <label>
            Club
            <select value={clubId} onChange={(e) => setClubId(e.target.value)}>
              {activeClubs.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
        )}
        {activeLessons.length > 1 && (
          <label>
            Lesson
            <select
              value={lessonId}
              onChange={(e) => setLessonId(e.target.value)}
            >
              <option value="all">All lessons</option>
              {activeLessons.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </select>
          </label>
        )}
        {error && (
          <p role="alert" className="form-error">
            {error}
          </p>
        )}
        <button className="button" type="submit">
          <Plus size={16} aria-hidden="true" /> Add time
        </button>
      </form>
      {windows.some((w) => w.source !== "blocked") && (
        <div>
          <button
            type="button"
            className="button secondary"
            onClick={() => setCopying((v) => !v)}
          >
            Copy these times to other dates
          </button>
          {copying && (
            <div className="week-add" style={{ marginTop: 12 }}>
              <div className="cal-head" style={{ padding: 0 }}>
                <strong>
                  <MonthTitle month={copyMonth} />
                </strong>
                <span style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
                  <MonthNav month={copyMonth} setMonth={setCopyMonth} />
                </span>
              </div>
              <MonthGrid
                month={copyMonth}
                mini
                cell={(d, inMonth) => (
                  <button
                    type="button"
                    className={`cal-cell ${inMonth ? "" : "is-out"} ${d < today || d === date ? "is-past" : ""} ${targets.includes(d) ? "is-picked" : ""}`}
                    disabled={d < today || d === date}
                    aria-pressed={targets.includes(d)}
                    aria-label={mock.formatDate(d)}
                    onClick={() =>
                      setTargets((t) =>
                        t.includes(d) ? t.filter((x) => x !== d) : [...t, d],
                      )
                    }
                  >
                    {Number(d.slice(8))}
                  </button>
                )}
              />
              <button
                type="button"
                className="button"
                disabled={targets.length === 0}
                onClick={copy}
              >
                Copy to {targets.length || "…"}{" "}
                {targets.length === 1 ? "date" : "dates"}
              </button>
              <p className="footnote">
                Adds to any times those dates already have.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
