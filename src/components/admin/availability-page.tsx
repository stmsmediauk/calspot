"use client";
import { useState } from "react";
import { CalendarOff, Copy, Plus, X } from "lucide-react";
import { startTimes } from "@/lib/availability";
import { updateCoachWorkspace, useCoachWorkspace } from "@/lib/coach-workspace";
import * as mock from "@/lib/mock-data";
import { platform } from "@/lib/platform";
import { Empty } from "../ui";
import { useAdmin } from "./context";
import { PageHeader } from "./page-header";

/** Monday first. Values match Date.getDay() (0 = Sunday). */
const week = [
  { day: 1, name: "Monday" },
  { day: 2, name: "Tuesday" },
  { day: 3, name: "Wednesday" },
  { day: 4, name: "Thursday" },
  { day: 5, name: "Friday" },
  { day: 6, name: "Saturday" },
  { day: 0, name: "Sunday" },
];

function CopyDay({ from, name }: { from: number; name: string }) {
  const [open, setOpen] = useState(false);
  const [targets, setTargets] = useState<number[]>([]);
  const { notify } = useAdmin();
  return (
    <div className="copy-day">
      <button
        type="button"
        className="text-button"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        <Copy size={14} aria-hidden="true" /> Copy to…
      </button>
      {open && (
        <fieldset className="copy-menu">
          <legend>Copy {name}’s times to</legend>
          {week
            .filter((d) => d.day !== from)
            .map((d) => (
              <label key={d.day}>
                <input
                  type="checkbox"
                  checked={targets.includes(d.day)}
                  onChange={(e) =>
                    setTargets((t) =>
                      e.target.checked
                        ? [...t, d.day]
                        : t.filter((x) => x !== d.day),
                    )
                  }
                />
                {d.name}
              </label>
            ))}
          <p className="footnote">Replaces any times already on those days.</p>
          <button
            type="button"
            className="button small"
            disabled={targets.length === 0}
            onClick={() => {
              updateCoachWorkspace((c) => {
                const source = c.rules.filter((r) => r.day === from);
                return {
                  ...c,
                  rules: [
                    ...c.rules.filter((r) => !targets.includes(r.day)),
                    ...targets.flatMap((day) =>
                      source.map((r) => ({
                        ...r,
                        id: crypto.randomUUID(),
                        day,
                      })),
                    ),
                  ],
                };
              });
              notify(
                `Copied ${name}’s times to ${targets.length} other day${targets.length > 1 ? "s" : ""}.`,
              );
              setTargets([]);
              setOpen(false);
            }}
          >
            Copy times
          </button>
        </fieldset>
      )}
    </div>
  );
}

export function AvailabilityPage() {
  const { rules, exceptions, clubs, lessons, bookings } = useCoachWorkspace();
  const { openModal } = useAdmin();
  const activeLessons = lessons.filter((l) => l.active);
  const [previewLesson, setPreviewLesson] = useState("");
  const lesson =
    activeLessons.find((l) => l.id === previewLesson) ?? activeLessons[0];
  const club = (id: string) =>
    clubs.find((c) => c.id === id)?.name ?? "Unknown club";
  const previewDays = Array.from({ length: 7 }, (_, i) => {
    const d = mock.parseDate(mock.demoWeek);
    d.setDate(d.getDate() + i);
    return d;
  });
  return (
    <>
      <PageHeader
        title="Availability"
        description="Set the times you coach each week. Players only see times you have open."
        action={
          <button
            className="button secondary"
            onClick={() => openModal({ kind: "exception" })}
          >
            <CalendarOff size={16} aria-hidden="true" /> Block a date
          </button>
        }
      />
      <div className="availability-layout">
        <section className="panel week-editor" aria-label="Your regular week">
          <div className="section-heading">
            <div>
              <h2>Your regular week</h2>
              <p>Local times · {platform.timeZone} · 60 or 90 minute lessons</p>
            </div>
          </div>
          {week.map(({ day, name }) => {
            const dayRules = rules
              .filter((r) => r.day === day)
              .sort((a, b) => a.start - b.start);
            return (
              <div className="day-row" key={day}>
                <h3>{name}</h3>
                <div className="day-slots">
                  {dayRules.length === 0 && (
                    <span className="muted">Day off</span>
                  )}
                  {dayRules.map((r) => (
                    <span className="slot-chip" key={r.id}>
                      <button
                        type="button"
                        onClick={() => openModal({ kind: "rule", id: r.id })}
                        aria-label={`Edit ${name} ${mock.time(r.start)} to ${mock.time(r.end)}`}
                      >
                        <strong>
                          {mock.time(r.start)}–{mock.time(r.end)}
                        </strong>
                        <small>
                          {club(r.clubId)} ·{" "}
                          {mock.lessonName(lessons, r.lessonId)}
                        </small>
                      </button>
                      <button
                        type="button"
                        className="chip-remove"
                        aria-label={`Remove ${name} ${mock.time(r.start)} to ${mock.time(r.end)}`}
                        onClick={() =>
                          updateCoachWorkspace((c) => ({
                            ...c,
                            rules: c.rules.filter((x) => x.id !== r.id),
                          }))
                        }
                      >
                        <X size={14} aria-hidden="true" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="day-actions">
                  <button
                    type="button"
                    className="text-button"
                    onClick={() =>
                      openModal({ kind: "rule", defaults: { day } })
                    }
                  >
                    <Plus size={14} aria-hidden="true" /> Add time
                  </button>
                  {dayRules.length > 0 && <CopyDay from={day} name={name} />}
                </div>
              </div>
            );
          })}
        </section>
        <aside className="panel player-view" aria-label="What players see">
          <div className="section-heading">
            <div>
              <h2>What players see</h2>
              <p>Start times on your page for the week shown.</p>
            </div>
          </div>
          {lesson ? (
            <>
              <label className="preview-select">
                Lesson
                <select
                  value={lesson.id}
                  onChange={(e) => setPreviewLesson(e.target.value)}
                >
                  {activeLessons.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.name} · {l.duration} min
                    </option>
                  ))}
                </select>
              </label>
              {previewDays.map((d) => {
                const key = mock.dateKey(d);
                const times = startTimes({
                  date: key,
                  rules,
                  exceptions,
                  bookings,
                  lessons,
                  lesson,
                  clubId: "any",
                });
                return (
                  <div className="player-day" key={key}>
                    <strong>
                      {d.toLocaleDateString("en-GB", {
                        weekday: "short",
                        day: "numeric",
                      })}
                    </strong>
                    {times.length ? (
                      <span>
                        {times.map((t) => (
                          <i key={t}>{mock.time(t)}</i>
                        ))}
                      </span>
                    ) : (
                      <em>No times</em>
                    )}
                  </div>
                );
              })}
            </>
          ) : (
            <Empty>Turn on a lesson to preview your times.</Empty>
          )}
        </aside>
      </div>
      <section className="panel exceptions">
        <div className="section-heading">
          <div>
            <h2>Days off and extra time</h2>
            <p>A holiday, a day off or a little extra time on court.</p>
          </div>
          <button
            className="button secondary"
            onClick={() => openModal({ kind: "exception" })}
          >
            <Plus size={16} aria-hidden="true" /> Add exception
          </button>
        </div>
        {exceptions.length ? (
          exceptions.map((e) => (
            <div className="availability-row" key={e.id}>
              <div className="grow">
                <h3>
                  {mock.formatDate(e.date)} · {mock.time(e.start)}–
                  {mock.time(e.end)}
                </h3>
                <p>
                  {e.kind === "blocked"
                    ? "Blocked across all clubs"
                    : `Extra availability · ${club(e.clubId)}`}
                </p>
              </div>
              <button
                className="icon-button"
                aria-label="Remove exception"
                onClick={() =>
                  updateCoachWorkspace((c) => ({
                    ...c,
                    exceptions: c.exceptions.filter((x) => x.id !== e.id),
                  }))
                }
              >
                <X size={16} aria-hidden="true" />
              </button>
            </div>
          ))
        ) : (
          <Empty>No exceptions. Your regular week applies every week.</Empty>
        )}
      </section>
      <p className="footnote">
        Changing availability keeps existing bookings intact. Times already
        booked or requested are hidden from players.
        {platform.demoMode &&
          " Booking window and minimum notice can’t be changed yet."}
      </p>
    </>
  );
}
