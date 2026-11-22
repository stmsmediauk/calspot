"use client";
import { Check, TriangleAlert } from "lucide-react";
import { useCoachWorkspace } from "@/lib/coach-workspace";
import * as mock from "@/lib/mock-data";
import type { Booking } from "@/lib/mock-data";
import { Badge } from "../ui";
import { useAdmin } from "./context";

export function RequestCard({ b }: { b: Booking }) {
  const { clubs, lessons, bookings } = useCoachWorkspace();
  const { decide, openModal } = useAdmin();
  const length = (id: string) =>
    (lessons.find((l) => l.id === id)?.duration ?? 60) / 60;
  const clash =
    b.status === "pending"
      ? bookings.find(
          (o) =>
            o.id !== b.id &&
            o.status === "confirmed" &&
            o.date === b.date &&
            b.hour < o.hour + length(o.lessonId) &&
            o.hour < b.hour + length(b.lessonId),
        )
      : undefined;
  return (
    <article className="request-card">
      <div className="person-avatar">
        {b.player
          .split(" ")
          .map((s) => s[0])
          .slice(0, 2)
          .join("")}
      </div>
      <div className="grow">
        <div className="row between">
          <h3>{b.player}</h3>
          <Badge tone={b.status}>{b.status}</Badge>
        </div>
        <p>
          {lessons.find((l) => l.id === b.lessonId)?.name} ·{" "}
          {mock.formatDate(b.date)} at {mock.time(b.hour)}
        </p>
        <p>
          {clubs.find((c) => c.id === b.clubId)?.name ?? "Unknown club"}
          {b.requestedAt && b.status === "pending" && (
            <span className="muted">
              {" "}
              · Requested {mock.daysAgo(b.requestedAt)}
            </span>
          )}
        </p>
        <p className="message">“{b.message}”</p>
        {clash && (
          <p className="clash" role="note">
            <TriangleAlert size={15} aria-hidden="true" />
            Overlaps {clash.player} at {mock.time(clash.hour)}. Approving would
            double-book you.
          </p>
        )}
        {b.status === "pending" && (
          <div className="row">
            <button
              className="button small"
              onClick={() => decide(b.id, "confirmed")}
            >
              <Check size={14} aria-hidden="true" /> Approve
            </button>
            <button
              className="button secondary small"
              onClick={() => decide(b.id, "declined")}
            >
              Decline
            </button>
            <button
              className="text-button"
              onClick={() => openModal({ kind: "booking", id: b.id })}
            >
              View details
            </button>
          </div>
        )}
      </div>
    </article>
  );
}
