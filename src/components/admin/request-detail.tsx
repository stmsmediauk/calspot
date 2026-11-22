"use client";
import { useCoachWorkspace } from "@/lib/coach-workspace";
import { zoneName } from "@/lib/dates";
import * as mock from "@/lib/mock-data";
import type { Booking } from "@/lib/mock-data";
import { platform } from "@/lib/platform";
import { Badge } from "../ui";
import { ReplyActions, WhatsAppFollowUps } from "./reply-actions";

export function RequestDetail({ b }: { b: Booking }) {
  const { clubs, lessons } = useCoachWorkspace();
  const lesson = lessons.find((l) => l.id === b.lessonId);
  return (
    <div className="booking-detail">
      <Badge tone={b.status}>{b.status}</Badge>
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
      <p className="footnote">
        {platform.demoMode ? "Mock request. " : ""}Approving confirms the lesson
        only. Court availability must be verified separately.
      </p>
      {b.status === "pending" ? (
        <ReplyActions key={b.id} b={b} />
      ) : (
        <WhatsAppFollowUps b={b} />
      )}
    </div>
  );
}
