"use client";
import { useState } from "react";
import Link from "next/link";
import {
  CalendarDays,
  LayoutDashboard,
  Clock3,
  MapPin,
  Layers3,
  Inbox,
  ChevronRight,
  Plus,
  ArrowUpRight,
  Menu,
  X,
  Check,
  ArrowRight,
  SlidersHorizontal,
  CircleHelp,
} from "lucide-react";
import * as mock from "@/lib/mock-data";
import type { Club, Lesson, Booking, Rule, Exception } from "@/lib/mock-data";
import { Badge, Modal, Empty } from "./ui";
import { Editor } from "./editor";
import { Logo } from "./logo";
import { CalendarPanel } from "./calendar-panel";
const nav = [
  { name: "Overview", icon: LayoutDashboard },
  { name: "Calendar", icon: CalendarDays },
  { name: "Availability", icon: Clock3 },
  { name: "Clubs", icon: MapPin },
  { name: "Lessons", icon: Layers3 },
  { name: "Requests", icon: Inbox },
];
export function Dashboard() {
  const [page, setPage] = useState("Calendar"),
    [mobile, setMobile] = useState(false),
    [clubs, setClubs] = useState(mock.clubs),
    [lessons, setLessons] = useState(mock.lessons),
    [bookings, setBookings] = useState(mock.bookings),
    [rules, setRules] = useState(mock.rules),
    [exceptions, setExceptions] = useState<Exception[]>([]),
    [week, setWeek] = useState("2026-11-23"),
    [view, setView] = useState("Week"),
    [filter, setFilter] = useState("all"),
    [notice, setNotice] = useState(""),
    [modal, setModal] = useState<{ kind: string; id?: string } | null>(null);
  const pending = bookings.filter((b) => b.status === "pending");
  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = mock.parseDate(week);
    d.setDate(d.getDate() + i);
    return d;
  });
  const go = (name: string) => {
    setPage(name);
    setMobile(false);
  };
  const club = (id: string) =>
    clubs.find((c) => c.id === id)?.name ?? "Unknown club";
  const lesson = (id: string) => lessons.find((l) => l.id === id);
  const decide = (id: string, status: Booking["status"]) => {
    setBookings((bs) => bs.map((b) => (b.id === id ? { ...b, status } : b)));
    setNotice(`Demo request ${status}. No email was sent.`);
    setModal(null);
  };
  const shift = (direction: number) => {
    const d = mock.parseDate(week);
    if (view === "Month") {
      d.setDate(1);
      d.setMonth(d.getMonth() + direction);
    } else d.setDate(d.getDate() + direction * 7);
    setWeek(mock.dateKey(d));
  };
  const visible = bookings.filter(
    (b) =>
      b.status !== "declined" &&
      b.status !== "cancelled" &&
      (filter === "all" || b.clubId === filter),
  );
  const requestCard = (b: Booking) => (
    <article className="request-card" key={b.id}>
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
          {lesson(b.lessonId)?.name} · {mock.formatDate(b.date)} at{" "}
          {mock.time(b.hour)}
        </p>
        <p>{club(b.clubId)}</p>
        <p className="message">“{b.message}”</p>
        <div className="row">
          <button
            className="button small"
            onClick={() => decide(b.id, "confirmed")}
          >
            <Check size={14} /> Approve
          </button>
          <button
            className="button secondary small"
            onClick={() => decide(b.id, "declined")}
          >
            Decline
          </button>
          <button
            className="text-button"
            onClick={() => setModal({ kind: "booking", id: b.id })}
          >
            View details
          </button>
        </div>
      </div>
    </article>
  );
  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobile ? "open" : ""}`}>
        <div className="brand">
          <Logo />
          <button
            className="mobile-only icon-button"
            aria-label="Close navigation"
            onClick={() => setMobile(false)}
          >
            <X size={20} />
          </button>
        </div>
        <div className="workspace">
          <div className="coach-mark">{mock.coachProfile.initials}</div>
          <div>
            <strong>{mock.coachProfile.name}</strong>
            <span>{mock.coachProfile.workspaceLabel}</span>
          </div>
          <Badge>Demo</Badge>
        </div>
        <div className="nav-label">WORKSPACE</div>
        <nav aria-label="Main navigation">
          {nav.map(({ name, icon: Icon }) => (
            <button
              key={name}
              className={page === name ? "active" : ""}
              aria-current={page === name ? "page" : undefined}
              onClick={() => go(name)}
            >
              <Icon size={18} />
              {name}
              {name === "Requests" && pending.length > 0 && (
                <span className="count">{pending.length}</span>
              )}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="help-card">
            <CircleHelp size={18} />
            <strong>A little less admin.</strong>
            <p>A little more time on court.</p>
            <span>Your coaching. All in one spot.</span>
          </div>
          <div className="profile">
            <div className="person-avatar dark">
              {mock.coachProfile.initials}
            </div>
            <div>
              <strong>{mock.coachProfile.name}</strong>
              <span>First pilot coach</span>
            </div>
          </div>
        </div>
      </aside>
      {mobile && (
        <button
          className="nav-overlay"
          aria-label="Close navigation"
          onClick={() => setMobile(false)}
        />
      )}
      <main>
        <div className="topbar">
          <div className="row">
            <button
              className="mobile-only icon-button"
              aria-label="Open navigation"
              onClick={() => setMobile(true)}
            >
              <Menu size={21} />
            </button>
            <Link href="/kelly-jane" className="public-site-link">
              View coach site
            </Link>
            <ChevronRight size={13} />
            <strong>{page}</strong>
          </div>
          <span className="demo-indicator">
            <i /> Mock data · Local preview
          </span>
        </div>
        <div className="content">
          <header className="page-header">
            <div>
              <div className="eyebrow">Your workspace</div>
              <h1>{page === "Overview" ? "A good week starts here." : page}</h1>
              <p>
                {
                  (
                    {
                      Calendar: "A little clarity for your week on court.",
                      Availability: "Make space for your next great session.",
                      Clubs: "The places you bring your coaching to life.",
                      Lessons: "Thoughtful sessions. Better players.",
                      Requests: "Your next sessions start with a request.",
                      Overview:
                        "Your sessions, requests and schedule, all in one spot.",
                    } as Record<string, string>
                  )[page]
                }
              </p>
            </div>
            {page !== "Requests" && (
              <button
                className="button"
                onClick={() => {
                  if (page === "Calendar" || page === "Overview")
                    go("Availability");
                  else
                    setModal({
                      kind:
                        page === "Clubs"
                          ? "club"
                          : page === "Lessons"
                            ? "lesson"
                            : "rule",
                    });
                }}
              >
                {page === "Calendar" || page === "Overview" ? (
                  <SlidersHorizontal size={16} />
                ) : (
                  <Plus size={16} />
                )}{" "}
                {page === "Calendar" || page === "Overview"
                  ? "Manage availability"
                  : page === "Clubs"
                    ? "Add club"
                    : page === "Lessons"
                      ? "Add lesson"
                      : "Add availability"}
              </button>
            )}
          </header>
          <div className="demo-banner">
            <span>
              <strong>You’re in the demo workspace.</strong> Explore freely —
              changes reset when you refresh.
            </span>
            <Badge>Phase 1</Badge>
          </div>
          {notice && (
            <div className="notice" role="status">
              {notice}
              <button
                className="icon-button"
                aria-label="Dismiss notification"
                onClick={() => setNotice("")}
              >
                <X size={16} />
              </button>
            </div>
          )}
          {(page === "Calendar" || page === "Overview") && (
            <>
              <div className="stats">
                <div>
                  <span>Sessions this week</span>
                  <strong>
                    {
                      visible.filter(
                        (b) =>
                          dates.some((d) => mock.dateKey(d) === b.date) &&
                          b.status === "confirmed",
                      ).length
                    }
                    <small>confirmed sessions</small>
                  </strong>
                  <CalendarDays />
                </div>
                <div>
                  <span>Awaiting your approval</span>
                  <strong>
                    {pending.length}
                    <small>booking requests</small>
                  </strong>
                  <Inbox />
                </div>
                <div>
                  <span>Your coaching spaces</span>
                  <strong>
                    {clubs.filter((c) => c.active).length}
                    <small>active clubs</small>
                  </strong>
                  <MapPin />
                </div>
              </div>
            </>
          )}
          {page === "Overview" && (
            <div className="overview-grid">
              <section className="panel">
                <div className="section-heading">
                  <h2>Upcoming sessions</h2>
                  <button
                    className="text-button"
                    onClick={() => go("Calendar")}
                  >
                    View calendar <ArrowUpRight size={15} />
                  </button>
                </div>
                {bookings
                  .filter((b) => b.status === "confirmed")
                  .sort(
                    (a, b) => a.date.localeCompare(b.date) || a.hour - b.hour,
                  )
                  .map((b) => (
                    <button
                      key={b.id}
                      className="session-row"
                      onClick={() => setModal({ kind: "booking", id: b.id })}
                    >
                      <div className="date-tile">
                        {mock.parseDate(b.date).getDate()}
                        <span>NOV</span>
                      </div>
                      <div className="grow">
                        <h3>{b.player}</h3>
                        <p>
                          {lesson(b.lessonId)?.name} · {club(b.clubId)}
                        </p>
                      </div>
                      <span>{mock.time(b.hour)}</span>
                      <ArrowRight size={16} />
                    </button>
                  ))}
              </section>
              <section className="panel">
                <div className="section-heading">
                  <h2>Booking requests</h2>
                  <Badge tone="pending">{pending.length} pending</Badge>
                </div>
                {pending.length ? (
                  pending.slice(0, 2).map(requestCard)
                ) : (
                  <Empty>You’re all caught up.</Empty>
                )}
              </section>
            </div>
          )}
          {page === "Calendar" && (
            <>
              <CalendarPanel
                week={week}
                view={view}
                dates={dates}
                filter={filter}
                clubs={clubs}
                visible={visible}
                rules={rules}
                exceptions={exceptions}
                shift={shift}
                setWeek={setWeek}
                setView={(value) => {
                  setView(value);
                  if (value === "Week") {
                    const monday = mock.parseDate(week);
                    monday.setDate(
                      monday.getDate() - ((monday.getDay() + 6) % 7),
                    );
                    setWeek(mock.dateKey(monday));
                  }
                }}
                setFilter={setFilter}
                lesson={lesson}
                club={club}
                onSelect={(id) => setModal({ kind: "booking", id })}
              />

              <div className="calendar-note">
                <Clock3 size={16} />
                <span>
                  Requests need your approval. Court availability must be
                  arranged separately.
                </span>
                <button className="text-button" onClick={() => go("Requests")}>
                  Review requests <ArrowRight size={15} />
                </button>
              </div>
            </>
          )}
          {page === "Requests" && (
            <>
              <div className="section-heading">
                <h2>
                  Waiting for you{" "}
                  <span className="muted">{pending.length}</span>
                </h2>
                <span className="muted">
                  No notifications are sent in this demo
                </span>
              </div>
              <div className="request-list">
                {pending.length ? (
                  pending.map(requestCard)
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
                      onClick={() => setModal({ kind: "booking", id: b.id })}
                    >
                      <div className="grow">
                        <h3>{b.player}</h3>
                        <p>
                          {mock.formatDate(b.date)} · {mock.time(b.hour)} ·{" "}
                          {club(b.clubId)}
                        </p>
                      </div>
                      <Badge tone={b.status}>{b.status}</Badge>
                    </button>
                  ))}
              </section>
            </>
          )}
          {(page === "Clubs" || page === "Lessons") && (
            <div className="cards-grid">
              {(page === "Clubs" ? clubs : lessons).map((item) => (
                <article className="entity-card panel" key={item.id}>
                  <div className="row between">
                    <div className="entity-icon">
                      {page === "Clubs" ? (
                        <MapPin size={23} />
                      ) : (
                        <Layers3 size={23} />
                      )}
                    </div>
                    <Badge tone={item.active ? "confirmed" : "neutral"}>
                      {item.active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <h2>{item.name}</h2>
                  {"address" in item ? (
                    <>
                      <p>{item.address}</p>
                      <div className="entity-detail">
                        {item.notes || "No venue notes yet."}
                      </div>
                    </>
                  ) : (
                    <>
                      <p>{item.description}</p>
                      <div className="lesson-meta">
                        <span>
                          <Clock3 size={16} />
                          {item.duration} minutes
                        </span>
                        <strong>
                          £{item.price}
                          <small> indicative</small>
                        </strong>
                      </div>
                    </>
                  )}
                  <div className="entity-footer">
                    <button
                      className="button secondary small"
                      onClick={() =>
                        setModal({
                          kind: page === "Clubs" ? "club" : "lesson",
                          id: item.id,
                        })
                      }
                    >
                      Edit {page === "Clubs" ? "club" : "lesson"}
                    </button>
                    <button
                      className="text-button"
                      onClick={() => {
                        if (page === "Clubs")
                          setClubs((cs) =>
                            cs.map((c) =>
                              c.id === item.id
                                ? { ...c, active: !c.active }
                                : c,
                            ),
                          );
                        else
                          setLessons((ls) =>
                            ls.map((l) =>
                              l.id === item.id
                                ? { ...l, active: !l.active }
                                : l,
                            ),
                          );
                      }}
                    >
                      {item.active ? "Deactivate" : "Activate"}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
          {page === "Availability" && (
            <>
              <div className="section-heading">
                <div>
                  <h2>Your regular week</h2>
                  <p>Recurring local times · Europe/London</p>
                </div>
                <Badge>60 / 90 minute lessons</Badge>
              </div>
              <section className="panel">
                {rules.length ? (
                  rules.map((r) => (
                    <div className="availability-row" key={r.id}>
                      <div className="day-dot">
                        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"][r.day]}
                      </div>
                      <div className="grow">
                        <h3>
                          {
                            [
                              "Sunday",
                              "Monday",
                              "Tuesday",
                              "Wednesday",
                              "Thursday",
                              "Friday",
                              "Saturday",
                            ][r.day]
                          }{" "}
                          <span className="muted">
                            {mock.time(r.start)}–{mock.time(r.end)}
                          </span>
                        </h3>
                        <p>
                          {club(r.clubId)} · {lesson(r.lessonId)?.name}
                        </p>
                        <small>
                          {mock.formatDate(r.effectiveStart)} –{" "}
                          {mock.formatDate(r.effectiveEnd)}
                        </small>
                      </div>
                      <button
                        className="button secondary small"
                        onClick={() => setModal({ kind: "rule", id: r.id })}
                      >
                        Edit
                      </button>
                      <button
                        className="icon-button"
                        aria-label="Remove recurring availability"
                        onClick={() =>
                          setRules((rs) => rs.filter((x) => x.id !== r.id))
                        }
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))
                ) : (
                  <Empty>Add your first recurring availability.</Empty>
                )}
              </section>
              <div className="section-heading section-space">
                <div>
                  <h2>Make an exception</h2>
                  <p>A day off, a holiday or a little extra time on court.</p>
                </div>
                <button
                  className="button secondary"
                  onClick={() => setModal({ kind: "exception" })}
                >
                  <Plus size={16} /> Add exception
                </button>
              </div>
              <section className="panel">
                {exceptions.length ? (
                  exceptions.map((e) => (
                    <div className="availability-row" key={e.id}>
                      <Clock3 size={20} />
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
                          setExceptions((xs) => xs.filter((x) => x.id !== e.id))
                        }
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))
                ) : (
                  <Empty>
                    No exceptions yet. Your regular week is looking clear.
                  </Empty>
                )}
              </section>
              <p className="footnote">
                Changing availability keeps existing bookings intact. Booking
                window: 30 days · Minimum notice: 24 hours (preview defaults).
              </p>
            </>
          )}
          <footer className="page-footer">
            <span>Less admin. More time on court.</span>
            <Logo compact />
          </footer>
        </div>
      </main>
      {modal && (
        <Modal
          title={
            modal.kind === "booking"
              ? "Session details"
              : `${modal.id ? "Edit" : "Add"} ${modal.kind === "rule" ? "recurring availability" : modal.kind === "exception" ? "availability exception" : modal.kind}`
          }
          onClose={() => setModal(null)}
        >
          {modal.kind === "booking" ? (
            (() => {
              const b = bookings.find((b) => b.id === modal.id)!;
              return (
                <div className="booking-detail">
                  <Badge tone={b.status}>{b.status}</Badge>
                  <h2>{b.player}</h2>
                  <p>{b.email}</p>
                  <dl>
                    <dt>Lesson</dt>
                    <dd>
                      {lesson(b.lessonId)?.name} ·{" "}
                      {lesson(b.lessonId)?.duration} min
                    </dd>
                    <dt>When</dt>
                    <dd>
                      {mock.formatDate(b.date)} at {mock.time(b.hour)} GMT
                    </dd>
                    <dt>Club</dt>
                    <dd>{club(b.clubId)}</dd>
                    <dt>Player’s note</dt>
                    <dd>{b.message}</dd>
                  </dl>
                  <p className="footnote">
                    Mock request. Coach approval confirms the lesson only; court
                    availability must be verified separately.
                  </p>
                  {b.status === "pending" && (
                    <div className="row">
                      <button
                        className="button"
                        onClick={() => decide(b.id, "confirmed")}
                      >
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
            })()
          ) : (
            <Editor
              kind={modal.kind}
              item={
                modal.kind === "club"
                  ? clubs.find((c) => c.id === modal.id)
                  : modal.kind === "lesson"
                    ? lessons.find((l) => l.id === modal.id)
                    : rules.find((r) => r.id === modal.id)
              }
              clubs={clubs}
              lessons={lessons}
              onSave={(value) => {
                const id = modal.id ?? crypto.randomUUID();
                if (modal.kind === "club")
                  setClubs((xs) =>
                    modal.id
                      ? xs.map((x) =>
                          x.id === id ? ({ ...value, id } as Club) : x,
                        )
                      : [...xs, { ...value, id } as Club],
                  );
                if (modal.kind === "lesson")
                  setLessons((xs) =>
                    modal.id
                      ? xs.map((x) =>
                          x.id === id ? ({ ...value, id } as Lesson) : x,
                        )
                      : [...xs, { ...value, id } as Lesson],
                  );
                if (modal.kind === "rule")
                  setRules((xs) =>
                    modal.id
                      ? xs.map((x) =>
                          x.id === id ? ({ ...value, id } as Rule) : x,
                        )
                      : [...xs, { ...value, id } as Rule],
                  );
                if (modal.kind === "exception")
                  setExceptions((xs) => [...xs, { ...value, id } as Exception]);
                setModal(null);
                setNotice(
                  "Saved to this demo session. Changes reset on refresh.",
                );
              }}
              onCancel={() => setModal(null)}
            />
          )}
        </Modal>
      )}
    </div>
  );
}
