"use client";
import { ChevronLeft, ChevronRight } from "lucide-react";
import * as mock from "@/lib/mock-data";
import { zoneName } from "@/lib/dates";
import { platform } from "@/lib/platform";
import { Badge } from "./ui";
import type { Booking, Club, Lesson, Rule, Exception } from "@/lib/mock-data";
type CalendarProps = {
  week: string;
  view: string;
  dates: Date[];
  filter: string;
  clubs: Club[];
  visible: Booking[];
  rules: Rule[];
  exceptions: Exception[];
  shift: (direction: number) => void;
  setWeek: (week: string) => void;
  setView: (view: string) => void;
  setFilter: (filter: string) => void;
  lesson: (id: string) => Lesson | undefined;
  club: (id: string) => string;
  onSelect: (id: string) => void;
};
export function CalendarPanel({
  week,
  view,
  dates,
  filter,
  clubs,
  visible,
  rules,
  exceptions,
  shift,
  setWeek,
  setView,
  setFilter,
  lesson,
  club,
  onSelect,
}: CalendarProps) {
  return (
    <section className="calendar panel">
      <div className="calendar-toolbar">
        <div className="row">
          <h2>
            {view === "Month"
              ? mock.parseDate(week).toLocaleDateString("en-GB", {
                  month: "long",
                  year: "numeric",
                })
              : `${dates[0].getDate()}–${dates[6].getDate()} ${dates[6].toLocaleDateString("en-GB", { month: "long", year: "numeric" })}`}
          </h2>
          <div className="row gap-0">
            <button
              className="icon-button"
              aria-label="Previous period"
              onClick={() => shift(-1)}
            >
              <ChevronLeft size={17} />
            </button>
            <button
              className="icon-button"
              aria-label="Next period"
              onClick={() => shift(1)}
            >
              <ChevronRight size={17} />
            </button>
          </div>
          <button
            className="button secondary small"
            onClick={() => setWeek(mock.thisWeekStart())}
          >
            This week
          </button>
        </div>
        <div className="row">
          <select
            aria-label="Filter calendar by club"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All clubs</option>
            {clubs.map((c) => (
              <option value={c.id} key={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <div className="segmented">
            {["Agenda", "Week", "Month"].map((v) => (
              <button
                key={v}
                aria-pressed={view === v}
                className={view === v ? "selected" : ""}
                onClick={() => setView(v)}
              >
                {v}
              </button>
            ))}
          </div>
        </div>
      </div>
      {view === "Agenda" ? (
        <div className="agenda">
          {dates.map((d) => {
            const key = mock.dateKey(d);
            const bs = visible
              .filter((b) => b.date === key)
              .sort((a, b) => a.hour - b.hour);
            return (
              <section className="agenda-day" key={key}>
                <h3>
                  {d.toLocaleDateString("en-GB", {
                    weekday: "long",
                    day: "numeric",
                    month: "short",
                  })}
                </h3>
                {bs.length ? (
                  bs.map((b) => (
                    <button
                      key={b.id}
                      className={`agenda-item ${b.status}`}
                      onClick={() => onSelect(b.id)}
                    >
                      <span className="agenda-time">
                        {mock.time(b.hour)}
                        <small>
                          {mock.time(
                            b.hour + (lesson(b.lessonId)?.duration ?? 60) / 60,
                          )}
                        </small>
                      </span>
                      <span className="grow">
                        <strong>{b.player}</strong>
                        <small>
                          {lesson(b.lessonId)?.name} · {club(b.clubId)}
                        </small>
                      </span>
                      <Badge tone={b.status}>{b.status}</Badge>
                    </button>
                  ))
                ) : (
                  <p className="agenda-empty">No sessions</p>
                )}
              </section>
            );
          })}
        </div>
      ) : view === "Week" ? (
        <div className="calendar-scroll">
          <div className="week-grid">
            <div className="time-heading">{zoneName(dates[0])}</div>
            {dates.map((d) => (
              <div
                className={`day-heading ${d.getDay() === 1 ? "highlight" : ""}`}
                key={mock.dateKey(d)}
              >
                <span>
                  {d.toLocaleDateString("en-GB", {
                    weekday: "short",
                  })}
                </span>
                <strong>{d.getDate()}</strong>
              </div>
            ))}
            {Array.from({ length: 10 }, (_, i) => i + 8).map((hour) => (
              <div className="calendar-row" key={hour}>
                <div className="time-label">{mock.time(hour)}</div>
                {dates.map((d) => {
                  const key = mock.dateKey(d);
                  const blocked = exceptions.some(
                    (e) =>
                      e.kind === "blocked" &&
                      e.date === key &&
                      hour >= e.start &&
                      hour < e.end,
                  );
                  const rule = rules.find(
                    (r) =>
                      r.day === d.getDay() &&
                      key >= r.effectiveStart &&
                      key <= r.effectiveEnd &&
                      hour >= r.start &&
                      hour < r.end &&
                      (filter === "all" || r.clubId === filter),
                  );
                  const extra = exceptions.find(
                    (e) =>
                      e.kind === "extra" &&
                      e.date === key &&
                      hour >= e.start &&
                      hour < e.end &&
                      (filter === "all" || e.clubId === filter),
                  );
                  const bs = visible.filter(
                    (b) => b.date === key && b.hour === hour,
                  );
                  return (
                    <div
                      key={key}
                      className={`calendar-cell ${!blocked && (rule || extra) ? "available" : ""} ${blocked ? "blocked" : ""}`}
                    >
                      {bs.map((b) => (
                        <button
                          className={`event ${b.status}`}
                          key={b.id}
                          onClick={() => onSelect(b.id)}
                        >
                          <span>
                            {mock.time(b.hour)} –{" "}
                            {mock.time(
                              b.hour +
                                (lesson(b.lessonId)?.duration ?? 60) / 60,
                            )}
                          </span>
                          <strong>{b.player}</strong>
                          <span>{lesson(b.lessonId)?.name}</span>
                          <small>{club(b.clubId)}</small>
                        </button>
                      ))}
                      {!bs.length &&
                        hour === 9 &&
                        (rule || extra) &&
                        !blocked && (
                          <span className="available-label">Available</span>
                        )}
                      {blocked && (
                        <span className="available-label">Blocked</span>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="month-grid">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
            <div className="month-heading" key={d}>
              {d}
            </div>
          ))}
          {(() => {
            const start = mock.parseDate(week);
            start.setDate(1);
            start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
            return Array.from({ length: 42 }, (_, i) => {
              const d = new Date(start);
              d.setDate(d.getDate() + i);
              return (
                <div
                  className={`month-day ${d.getMonth() !== mock.parseDate(week).getMonth() ? "muted" : ""}`}
                  key={i}
                >
                  <span>{d.getDate()}</span>
                  {visible
                    .filter((b) => b.date === mock.dateKey(d))
                    .map((b) => (
                      <button
                        key={b.id}
                        className={`month-event ${b.status}`}
                        onClick={() => onSelect(b.id)}
                      >
                        {mock.time(b.hour)} {b.player}
                      </button>
                    ))}
                </div>
              );
            });
          })()}
        </div>
      )}
      <footer className="calendar-footer">
        <div className="row legend">
          <span>
            <i className="green" />
            Confirmed
          </span>
          <span>
            <i className="amber" />
            Pending request
          </span>
          <span>
            <i className="grey" />
            Available
          </span>
        </div>
        <span>
          {platform.timeZone}
        </span>
      </footer>
    </section>
  );
}
