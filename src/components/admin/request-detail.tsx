"use client";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { updateCoachWorkspace, useCoachWorkspace } from "@/lib/coach-workspace";
import { playtomicUrl } from "@/lib/playtomic";
import { zoneName } from "@/lib/dates";
import * as mock from "@/lib/mock-data";
import type { Booking } from "@/lib/mock-data";
import { platform } from "@/lib/platform";
import { Badge } from "../ui";
import { ReplyActions, sessionSpaces, WhatsAppFollowUps } from "./reply-actions";
import { seriesLabel, SeriesPanel } from "./series";

export function RequestDetail({ b }: { b: Booking }) {
  const { clubs, lessons, bookings } = useCoachWorkspace();
  const lesson = lessons.find((l) => l.id === b.lessonId);
  const club = clubs.find((c) => c.id === b.clubId);
  const courtLink = playtomicUrl(club?.playtomicUrl ?? "");
  const open = b.status === "pending" || b.status === "confirmed";
  const setCourtBooked = (courtBooked: boolean) =>
    updateCoachWorkspace((current) => ({
      ...current,
      bookings: current.bookings.map((x) =>
        x.id === b.id ? { ...x, courtBooked } : x,
      ),
    }));
  return (
    <div className="booking-detail">
      <Badge tone={b.status}>{b.status}</Badge>{" "}
      {seriesLabel(bookings, b) && <Badge>{seriesLabel(bookings, b)}</Badge>}
      <h2>{b.player}</h2>
      <p>
        {b.email}
        {b.phone && ` · ${b.phone}`}
      </p>
      <dl>
        <dt>Lesson</dt>
        <dd>
          {lesson?.name} · {lesson?.duration} min
        </dd>
        <dt>When</dt>
        <dd>
          {mock.formatDate(b.date)} at {mock.time(b.hour)}{" "}
          {zoneName(mock.parseDate(b.date), platform.timeZone)}
        </dd>
        {lesson && lesson.capacity > 1 && (
          <>
            <dt>Spaces</dt>
            <dd>
              {b.spaces ?? 1} requested ·{" "}
              {sessionSpaces(bookings, b, ["confirmed"]) +
                (b.status === "confirmed" ? (b.spaces ?? 1) : 0)}{" "}
              of {lesson.capacity} confirmed
            </dd>
          </>
        )}
        <dt>Club</dt>
        <dd>{clubs.find((c) => c.id === b.clubId)?.name ?? "Unknown club"}</dd>
        <dt>Player’s note</dt>
        <dd>{b.message}</dd>
        {b.requestedAt && (
          <>
            <dt>Requested</dt>
            <dd>{mock.daysAgo(b.requestedAt)}</dd>
          </>
        )}
        {b.reply && (
          <>
            <dt>Your note</dt>
            <dd>{b.reply}</dd>
          </>
        )}
        {b.suggested && (
          <>
            <dt>You offered</dt>
            <dd>
              {mock.formatDate(b.suggested.date)} at{" "}
              {mock.time(b.suggested.hour)}
            </dd>
          </>
        )}
      </dl>
      <SeriesPanel b={b} />
      {open && (
        <div className="court-check">
          {courtLink ? (
            <a
              className="button secondary small"
              href={courtLink}
              target="_blank"
              rel="noopener noreferrer"
            >
              Check court on Playtomic{" "}
              <ExternalLink size={14} aria-hidden="true" />
            </a>
          ) : (
            <p className="footnote">
              Add this club’s Playtomic page in{" "}
              <Link href="/dashboard/clubs">Clubs</Link> to check courts in one
              tap.
            </p>
          )}
          <label className="check-line">
            <input
              type="checkbox"
              checked={b.courtBooked === true}
              onChange={(e) => setCourtBooked(e.target.checked)}
            />{" "}
            Court booked
          </label>
        </div>
      )}
      <p className="footnote">
        Approving confirms the lesson
        only. Court availability must be verified separately. “Court booked” is
        your own reminder; Calspot doesn’t check it with the club.
      </p>
      {b.status === "pending" ? (
        <ReplyActions key={b.id} b={b} />
      ) : (
        <WhatsAppFollowUps b={b} />
      )}
    </div>
  );
}
