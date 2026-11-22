"use client";
import { useState } from "react";
import { useCoachWorkspace } from "@/lib/coach-workspace";
import * as mock from "@/lib/mock-data";
import { platform } from "@/lib/platform";
import { useMediaQuery } from "@/lib/use-media";
import { Badge, Empty } from "../ui";
import { useAdmin } from "./context";
import { PageHeader } from "./page-header";
import { RequestCard } from "./request-card";
import { RequestDetail } from "./request-detail";
import { useClash } from "./reply-actions";

function Row({
  b,
  selected,
  onSelect,
}: {
  b: mock.Booking;
  selected: boolean;
  onSelect: () => void;
}) {
  const { lessons } = useCoachWorkspace();
  const clash = useClash(b);
  return (
    <button
      type="button"
      className={`inbox-row ${selected ? "selected" : ""}`}
      aria-pressed={selected}
      onClick={onSelect}
    >
      <span className="person-avatar">
        {b.player
          .split(" ")
          .map((s) => s[0])
          .slice(0, 2)
          .join("")}
      </span>
      <span className="grow">
        <strong>{b.player}</strong>
        <small>
          {lessons.find((l) => l.id === b.lessonId)?.name} ·{" "}
          {mock.formatDate(b.date)} · {mock.time(b.hour)}
        </small>
      </span>
      <span className="inbox-meta">
        {clash && <Badge tone="declined">Overlap</Badge>}
        {b.requestedAt && <small>{mock.daysAgo(b.requestedAt)}</small>}
      </span>
    </button>
  );
}

export function RequestsPage() {
  const { bookings, clubs } = useCoachWorkspace();
  const { openModal } = useAdmin();
  const split = useMediaQuery("(min-width: 1100px)");
  const [chosen, setChosen] = useState<string | null>(null);
  const pending = bookings.filter((b) => b.status === "pending");
  const selected = pending.find((b) => b.id === chosen) ?? pending[0];
  return (
    <>
      <PageHeader
        title="Requests"
        description="Approve or decline lesson requests. Approving confirms the lesson, not the court."
      />
      <div className="section-heading">
        <h2>
          Waiting for you <span className="muted">{pending.length}</span>
        </h2>
        {platform.demoMode && (
          <span className="muted">No emails are sent yet</span>
        )}
      </div>
      {pending.length === 0 ? (
        <Empty>All caught up. No pending requests.</Empty>
      ) : split ? (
        <div className="inbox">
          <div className="panel inbox-list">
            {pending.map((b) => (
              <Row
                key={b.id}
                b={b}
                selected={b.id === selected?.id}
                onSelect={() => setChosen(b.id)}
              />
            ))}
          </div>
          <section className="panel inbox-detail" aria-label="Request details">
            {selected && <RequestDetail b={selected} />}
          </section>
        </div>
      ) : (
        <div className="request-list">
          {pending.map((b) => (
            <RequestCard b={b} key={b.id} />
          ))}
        </div>
      )}
      <section className="panel history">
        <div className="section-heading">
          <h2>Booking history</h2>
        </div>
        {bookings
          .filter((b) => b.status !== "pending")
          .map((b) => (
            <button
              key={b.id}
              className="session-row"
              onClick={() => openModal({ kind: "booking", id: b.id })}
            >
              <div className="grow">
                <h3>{b.player}</h3>
                <p>
                  {mock.formatDate(b.date)} · {mock.time(b.hour)} ·{" "}
                  {clubs.find((c) => c.id === b.clubId)?.name}
                  {b.suggested &&
                    ` · Offered ${mock.formatDate(b.suggested.date)} ${mock.time(b.suggested.hour)}`}
                </p>
              </div>
              <Badge tone={b.status}>{b.status}</Badge>
            </button>
          ))}
      </section>
    </>
  );
}
