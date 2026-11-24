"use client";
import { Fragment, useState } from "react";
import { startTimes } from "@/lib/availability";
import { updateCoachWorkspace, useCoachWorkspace } from "@/lib/coach-workspace";
import * as mock from "@/lib/mock-data";
import { platform } from "@/lib/platform";
import { useMediaQuery } from "@/lib/use-media";
import { addDays, windowsOn } from "@/lib/week-edit";
import { Empty, Modal } from "../ui";
import { useAdmin } from "./context";
import { DayPanel } from "./day-panel";
import { MonthGrid, MonthNav, MonthTitle, monthDates } from "./month-grid";
import { PageHeader } from "./page-header";

const dayNames = [
  { day: 1, name: "Mon" },
  { day: 2, name: "Tue" },
  { day: 3, name: "Wed" },
  { day: 4, name: "Thu" },
  { day: 5, name: "Fri" },
  { day: 6, name: "Sat" },
  { day: 0, name: "Sun" },
];

/** Fills several weeks at once from one pattern, for coaches who have one. */
function TypicalWeek() {
  const { clubs, lessons } = useCoachWorkspace();
  const { notify } = useAdmin();
  const activeClubs = clubs.filter((c) => c.active);
  const [days, setDays] = useState<number[]>([1, 3]);
  const [from, setFrom] = useState(mock.today());
  const [weeks, setWeeks] = useState(4);
  const [start, setStart] = useState("17:00");
  const [end, setEnd] = useState("21:00");
  const [clubId, setClubId] = useState(activeClubs[0]?.id ?? "");
  const [error, setError] = useState("");
  const hour = (v: string) => {
    const [h, m] = v.split(":").map(Number);
    return h + (m || 0) / 60;
  };
  return (
    <details className="cal-details">
      <summary>Fill several weeks at once</summary>
      <form
        className="week-add"
        style={{ marginTop: 8 }}
        onSubmit={(e) => {
          e.preventDefault();
          if (!clubId) return setError("Add a club first, under Clubs.");
          if (!days.length) return setError("Choose at least one day.");
          if (hour(end) <= hour(start))
            return setError("The end time must be after the start time.");
          setError("");
          const today = mock.today();
          const dates = Array.from({ length: weeks * 7 }, (_, i) =>
            addDays(from, i),
          ).filter(
            (d) =>
              d >= today &&
              days.includes(new Date(`${d}T12:00:00Z`).getUTCDay()),
          );
          updateCoachWorkspace((c) => ({
            ...c,
            exceptions: [
              ...c.exceptions,
              ...dates
                .filter(
                  (d) =>
                    !windowsOn(c.rules, c.exceptions, d).some(
                      (w) =>
                        w.source !== "blocked" &&
                        w.start === hour(start) &&
                        w.end === hour(end) &&
                        w.clubId === clubId,
                    ),
                )
                .map((date) => ({
                  id: crypto.randomUUID(),
                  date,
                  kind: "extra" as const,
                  clubId,
                  lessonId: "all",
                  start: hour(start),
                  end: hour(end),
                })),
            ],
          }));
          notify(
            `Added times on ${dates.length} ${dates.length === 1 ? "date" : "dates"}. You can still change any date.`,
          );
        }}
      >
        <p className="footnote">
          Pick the days and times, and we add them to each date. Every date
          stays editable.
        </p>
        <div className="cal-days">
          {dayNames.map(({ day, name }) => (
            <label key={day}>
              <input
                type="checkbox"
                checked={days.includes(day)}
                onChange={(e) =>
                  setDays((d) =>
                    e.target.checked ? [...d, day] : d.filter((x) => x !== day),
                  )
                }
              />
              {name}
            </label>
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
        <div className="form-columns">
          <label>
            Starting
            <input
              type="date"
              value={from}
              min={mock.today()}
              onChange={(e) => setFrom(e.target.value)}
              required
            />
          </label>
          <label>
            For
            <select
              value={weeks}
              onChange={(e) => setWeeks(Number(e.target.value))}
            >
              {[1, 2, 3, 4, 6, 8, 12].map((n) => (
                <option key={n} value={n}>
                  {n} {n === 1 ? "week" : "weeks"}
                </option>
              ))}
            </select>
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
        {error && (
          <p role="alert" className="form-error">
            {error}
          </p>
        )}
        <button className="button" type="submit">
          Add to calendar
        </button>
      </form>
    </details>
  );
}

function PlayerPreview({ date }: { date: string }) {
  const { rules, exceptions, lessons, bookings } = useCoachWorkspace();
  const [lessonId, setLessonId] = useState("");
  const active = lessons.filter((l) => l.active);
  const lesson = active.find((l) => l.id === lessonId) ?? active[0];
  const monday = addDays(
    date,
    -((new Date(`${date}T12:00:00Z`).getUTCDay() + 6) % 7),
  );
  if (!lesson) return <Empty>Turn on a lesson to preview your times.</Empty>;
  return (
    <div style={{ padding: "8px 22px 20px" }}>
      {active.length > 1 && (
        <label className="preview-select">
          Lesson
          <select
            value={lesson.id}
            onChange={(e) => setLessonId(e.target.value)}
          >
            {active.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name} · {l.duration} min
              </option>
            ))}
          </select>
        </label>
      )}
      {Array.from({ length: 7 }, (_, i) => addDays(monday, i)).map((d) => {
        const times = startTimes({
          date: d,
          rules,
          exceptions,
          bookings,
          lessons,
          lesson,
          clubId: "any",
        });
        return (
          <div className="player-day" key={d}>
            <strong>{mock.formatDate(d)}</strong>
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
    </div>
  );
}

export function AvailabilityPage() {
  const { rules, exceptions } = useCoachWorkspace();
  const narrow = useMediaQuery("(max-width: 760px)");
  const today = mock.today();
  const [month, setMonth] = useState(`${today.slice(0, 7)}-01`);
  const [selected, setSelected] = useState(today);
  const [sheet, setSheet] = useState(false);
  const [preview, setPreview] = useState(false);

  const cell = (date: string, inMonth: boolean) => {
    const windows = windowsOn(rules, exceptions, date);
    const open = windows.filter((w) => w.source !== "blocked");
    const blocked = windows.some((w) => w.source === "blocked");
    const past = date < today;
    const label = open
      .map((w) => `${mock.time(w.start)} to ${mock.time(w.end)}`)
      .join(", ");
    return (
      <button
        type="button"
        className={`month-day ${inMonth ? "" : "muted"} ${date === selected ? "selected" : ""} ${date === today ? "today" : ""}`}
        disabled={past}
        aria-pressed={date === selected}
        aria-label={`${mock.formatDate(date)}${label ? `, ${label}` : ", no times"}${blocked ? ", blocked" : ""}`}
        onClick={() => {
          setSelected(date);
          if (narrow) setSheet(true);
        }}
      >
        <span className="day-num">
          {narrow ? mock.formatDate(date) : Number(date.slice(8))}
        </span>
        {open.slice(0, narrow ? 3 : 2).map((w) => (
          <span className="month-event open" key={`${w.source}-${w.id}`}>
            {mock.time(w.start)}–{mock.time(w.end)}
          </span>
        ))}
        {open.length > (narrow ? 3 : 2) && (
          <span className="more-times">
            +{open.length - (narrow ? 3 : 2)} more
          </span>
        )}
        {blocked && <span className="month-event blocked">Blocked</span>}
      </button>
    );
  };

  return (
    <>
      <PageHeader
        title="Availability"
        description="Pick a date and add the times you can coach. Players only see times you have added."
        action={
          <button
            className="button secondary"
            onClick={() => setPreview((v) => !v)}
            aria-expanded={preview}
          >
            {preview ? "Hide" : "See"} what players see
          </button>
        }
      />
      <div className="availability-layout">
        <section className="calendar panel" aria-label="Calendar">
          <div className="calendar-toolbar">
            <div className="row">
              <h2>
                <MonthTitle month={month} />
              </h2>
              <div className="row gap-0">
                <MonthNav month={month} setMonth={setMonth} />
              </div>
              <button
                type="button"
                className="button secondary small"
                onClick={() => {
                  setMonth(`${today.slice(0, 7)}-01`);
                  setSelected(today);
                }}
              >
                Today
              </button>
            </div>
          </div>
          {narrow ? (
            <div className="month-list">
              {monthDates(month)
                .filter(
                  (d) => d.slice(0, 7) === month.slice(0, 7) && d >= today,
                )
                .map((d) => (
                  <Fragment key={d}>{cell(d, true)}</Fragment>
                ))}
            </div>
          ) : (
            <MonthGrid month={month} cell={cell} />
          )}
          <footer className="calendar-footer">
            <div className="row legend">
              <span>
                <i className="grey" />
                Times you’re available
              </span>
            </div>
            <span>{platform.timeZone}</span>
          </footer>
          <TypicalWeek />
        </section>
        {!narrow && (
          <aside className="panel" aria-label="Times for the selected date">
            <DayPanel key={selected} date={selected} />
          </aside>
        )}
      </div>
      {preview && (
        <section className="panel player-view" aria-label="What players see">
          <div className="section-heading">
            <div>
              <h2>What players see</h2>
              <p>
                Start times on your page for the week of{" "}
                {mock.formatDate(selected)}.
              </p>
            </div>
          </div>
          <PlayerPreview date={selected} />
        </section>
      )}
      {narrow && sheet && (
        <Modal title="Times for this date" onClose={() => setSheet(false)}>
          <DayPanel key={selected} date={selected} />
        </Modal>
      )}
    </>
  );
}
