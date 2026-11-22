"use client";
import { useCoachWorkspace } from "@/lib/coach-workspace";
import { zoneName } from "@/lib/dates";
import * as mock from "@/lib/mock-data";
import { platform } from "@/lib/platform";
import { Badge } from "../ui";
import { useAdmin } from "./context";

export function BookingDetail({ id }: { id: string }) {
  const { bookings, clubs, lessons } = useCoachWorkspace();
  const { decide } = useAdmin();
  const b = bookings.find((x) => x.id === id);
  if (!b) return <p>This request is no longer available.</p>;
  const lesson = lessons.find((l) => l.id === b.lessonId);
  return (
    <div className="booking-detail">
      <Badge tone={b.status}>{b.status}</Badge>
      <h2>{b.player}</h2>
      <p>{b.email}</p>
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
        <dt>Club</dt>
        <dd>{clubs.find((c) => c.id === b.clubId)?.name ?? "Unknown club"}</dd>
        <dt>Player’s note</dt>
        <dd>{b.message}</dd>
      </dl>
      <p className="footnote">
        {platform.demoMode ? "Mock request. " : ""}Approving confirms the lesson
        only. Court availability must be verified separately.
      </p>
      {b.status === "pending" && (
        <div className="row">
          <button className="button" onClick={() => decide(b.id, "confirmed")}>
            Approve request
          </button>
          <button
            className="button secondary"
            onClick={() => decide(b.id, "declined")}
          >
            Decline
          </button>
        </div>
      )}
    </div>
  );
}
