"use client";
import { useCoachWorkspace } from "@/lib/coach-workspace";
import * as mock from "@/lib/mock-data";
import { platform } from "@/lib/platform";
import { Badge, Empty } from "../ui";
import { useAdmin } from "./context";
import { PageHeader } from "./page-header";
import { RequestCard } from "./request-card";

export function RequestsPage() {
  const { bookings, clubs } = useCoachWorkspace();
  const { openModal } = useAdmin();
  const pending = bookings.filter((b) => b.status === "pending");
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
          <span className="muted">No emails are sent in this demo</span>
        )}
      </div>
      <div className="request-list">
        {pending.length ? (
          pending.map((b) => <RequestCard b={b} key={b.id} />)
        ) : (
          <Empty>All caught up. No pending requests.</Empty>
        )}
      </div>
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
                </p>
              </div>
              <Badge tone={b.status}>{b.status}</Badge>
            </button>
          ))}
      </section>
    </>
  );
}
