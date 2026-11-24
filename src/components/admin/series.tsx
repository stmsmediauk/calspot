"use client";
import { useState } from "react";
import { MessageCircle, Repeat, TriangleAlert } from "lucide-react";
import { spacesTaken, startTimes } from "@/lib/availability";
import { updateCoachWorkspace, useCoachWorkspace } from "@/lib/coach-workspace";
import * as mock from "@/lib/mock-data";
import type { Booking } from "@/lib/mock-data";
import { Badge } from "../ui";
import { useAdmin } from "./context";
import { findClash } from "./reply-actions";
import { playerNumber, whatsappLink } from "./whatsapp-drafts";

/** The weeks of a repeat booking, earliest first. Empty for an ordinary booking. */
export function seriesMembers(bookings: Booking[], b: Booking): Booking[] {
  if (!b.seriesId) return [];
  return bookings
    .filter((x) => x.seriesId === b.seriesId)
    .sort((x, y) => x.date.localeCompare(y.date));
}

/** "Week 2 of 4", or null for an ordinary booking. */
export function seriesLabel(bookings: Booking[], b: Booking): string | null {
  const members = seriesMembers(bookings, b);
  if (members.length < 2) return null;
  return `Week ${members.findIndex((m) => m.id === b.id) + 1} of ${members.length}`;
}

const addDays = (date: string, days: number) => {
  const d = new Date(`${date}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
};

/** Repeat controls for a booking: approve or decline a whole series, or repeat a confirmed one. */
export function SeriesPanel({ b }: { b: Booking }) {
  const workspace = useCoachWorkspace();
  const { notify } = useAdmin();
  const { bookings, lessons } = workspace;
  const members = seriesMembers(bookings, b);
  const waiting = members.filter((m) => m.status === "pending");
  const [message, setMessage] = useState(true);
  const [extra, setExtra] = useState(3);
  const [problem, setProblem] = useState("");

  if (members.length > 1) {
    const clashes = waiting
      .map((m) => ({ m, clash: findClash(lessons, bookings, m) }))
      .filter((x) => x.clash);
    const list = waiting.map((m) => mock.formatDate(m.date)).join(", ");
    const first = b.player.split(" ")[0];
    const canMessage = !!playerNumber(waiting[0] ?? b);
    const decideAll = (status: "confirmed" | "declined") => {
      if (canMessage && message && waiting[0]) {
        const url = whatsappLink(
          workspace,
          waiting[0],
          status === "confirmed" ? "confirm" : "decline",
          `This covers ${waiting.length} weekly sessions: ${list}.`,
        );
        if (url) window.open(url, "_blank", "noopener,noreferrer");
      }
      const ids = new Set(waiting.map((m) => m.id));
      updateCoachWorkspace((current) => ({
        ...current,
        bookings: current.bookings.map((x) =>
          ids.has(x.id) ? { ...x, status } : x,
        ),
      }));
      notify(
        `${waiting.length} weekly sessions ${status}. No email is sent yet, so let ${first} know directly.`,
      );
    };
    return (
      <section className="series-panel" aria-label="Repeat booking">
        <h3>
          <Repeat size={15} aria-hidden="true" /> Weekly repeat ·{" "}
          {members.length} sessions
        </h3>
        <ul>
          {members.map((m) => (
            <li key={m.id}>
              <span>
                {mock.formatDate(m.date)} at {mock.time(m.hour)}
                {m.id === b.id && <em> (this one)</em>}
              </span>
              <Badge tone={m.status}>{m.status}</Badge>
            </li>
          ))}
        </ul>
        <p className="footnote">
          Each week is its own booking, so you can also approve, decline or
          cancel one week on its own.
        </p>
        {waiting.length > 0 && (
          <>
            {clashes.length > 0 && (
              <p className="clash" role="note">
                <TriangleAlert size={15} aria-hidden="true" />
                {clashes
                  .map(
                    ({ m, clash }) =>
                      `${mock.formatDate(m.date)} overlaps ${clash!.player}`,
                  )
                  .join(". ")}
                . Approve the other weeks one at a time.
              </p>
            )}
            {canMessage && (
              <label className="check-line">
                <input
                  type="checkbox"
                  checked={message}
                  onChange={(e) => setMessage(e.target.checked)}
                />
                <span>
                  <MessageCircle size={15} aria-hidden="true" /> Open WhatsApp
                  with one draft message covering all weeks
                </span>
              </label>
            )}
            <div className="row">
              <button
                className="button small"
                disabled={clashes.length > 0}
                onClick={() => decideAll("confirmed")}
              >
                Approve all {waiting.length} waiting weeks
              </button>
              <button
                className="button secondary small"
                onClick={() => decideAll("declined")}
              >
                Decline all {waiting.length}
              </button>
            </div>
          </>
        )}
      </section>
    );
  }

  // A confirmed one-off booking can be repeated by the coach, for up to 4 sessions.
  if (b.status !== "confirmed") return null;
  const lesson = lessons.find((l) => l.id === b.lessonId);
  if (!lesson) return null;
  const today = mock.today();
  const repeat = () => {
    setProblem("");
    const dates = Array.from({ length: extra }, (_, i) => addDays(b.date, 7 * (i + 1)));
    for (const [i, date] of dates.entries()) {
      const open =
        date > today &&
        startTimes({
          date,
          rules: workspace.rules,
          exceptions: workspace.exceptions,
          bookings,
          lessons,
          lesson,
          clubId: b.clubId,
        }).includes(b.hour) &&
        lesson.capacity - spacesTaken(bookings, lesson.id, b.clubId, date, b.hour) >=
          (b.spaces ?? 1);
      if (!open) {
        setProblem(
          `Week ${i + 2} (${mock.formatDate(date)}) isn’t free at ${mock.time(b.hour)}: it is outside your availability, blocked, or overlaps another session. Nothing was added.`,
        );
        return;
      }
    }
    const series = crypto.randomUUID();
    const added: Booking[] = dates.map((date) => ({
      ...b,
      id: crypto.randomUUID(),
      date,
      status: "confirmed",
      seriesId: series,
      courtBooked: false,
      reply: undefined,
      suggested: undefined,
      requestedAt: today,
    }));
    updateCoachWorkspace((current) => ({
      ...current,
      bookings: [
        ...current.bookings.map((x) =>
          x.id === b.id ? { ...x, seriesId: series } : x,
        ),
        ...added,
      ],
    }));
    notify(
      `Added ${added.length} weekly sessions for ${b.player.split(" ")[0]}, all confirmed. Remember to book each court.`,
    );
  };
  return (
    <section className="series-panel" aria-label="Repeat this session">
      <h3>
        <Repeat size={15} aria-hidden="true" /> Repeat weekly
      </h3>
      <div className="row">
        <label className="reply-field">
          Add
          <select value={extra} onChange={(e) => setExtra(Number(e.target.value))}>
            <option value={1}>1 more week</option>
            <option value={2}>2 more weeks</option>
            <option value={3}>3 more weeks (4 in total)</option>
          </select>
        </label>
        <button className="button secondary small" onClick={repeat}>
          Add confirmed weeks
        </button>
      </div>
      {problem && (
        <p className="clash" role="alert">
          <TriangleAlert size={15} aria-hidden="true" />
          {problem}
        </p>
      )}
      <p className="footnote">
        Same day, time, club and lesson. Every week must be inside your
        availability and free, or none are added. They are confirmed straight
        away; you still book each court yourself.
      </p>
    </section>
  );
}
