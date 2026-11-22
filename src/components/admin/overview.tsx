"use client";
import Link from "next/link";
import { useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  Circle,
  CircleCheck,
  Copy,
  ExternalLink,
  Inbox,
  MessageCircle,
} from "lucide-react";
import {
  setCoachPublished,
  useAccount,
  useCoachWorkspace,
} from "@/lib/coach-workspace";
import { matchingLook } from "@/lib/coach-theme";
import * as mock from "@/lib/mock-data";
import { Badge, Empty } from "../ui";
import { useAdmin } from "./context";
import { PageHeader } from "./page-header";
import { RequestCard } from "./request-card";
import { whatsappLink } from "./whatsapp-drafts";

export function OverviewPage() {
  const { profile, clubs, lessons, bookings, rules } = useCoachWorkspace();
  const { openModal, notify } = useAdmin();
  const [copied, setCopied] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const { slug, published, plan } = useAccount();
  const paused = plan !== null && !plan.active;
  const pending = bookings.filter((b) => b.status === "pending");
  const confirmed = bookings
    .filter((b) => b.status === "confirmed")
    .sort((a, b) => a.date.localeCompare(b.date) || a.hour - b.hour);
  const weekStart = mock.thisWeekStart();
  const weekEnd = mock.dateKey(
    new Date(mock.parseDate(weekStart).getTime() + 6 * 864e5),
  );
  const thisWeek = confirmed.filter(
    (b) => b.date >= weekStart && b.date <= weekEnd,
  ).length;
  const look = matchingLook(profile.appearance);
  const workspace = useCoachWorkspace();
  const tomorrowDate = mock.parseDate(mock.today());
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  const tomorrowKey = mock.dateKey(tomorrowDate);
  const tomorrow = confirmed.filter((b) => b.date === tomorrowKey);
  const checklist = [
    {
      done: !!profile.photograph,
      label: "Add your photograph",
      href: "/dashboard/profile",
    },
    {
      done: clubs.some((c) => c.active),
      label: "Add a club",
      href: "/dashboard/clubs",
    },
    {
      done: lessons.some((l) => l.active),
      label: "Add a lesson",
      href: "/dashboard/lessons",
    },
    {
      done: rules.length > 0,
      label: "Set your weekly availability",
      href: "/dashboard/availability",
    },
    {
      done: !!profile.tagline || profile.highlights.length > 0,
      label: "Add a tagline or highlights",
      href: "/dashboard/profile?tab=appearance",
    },
  ];
  const ready =
    clubs.some((c) => c.active) &&
    lessons.some((l) => l.active) &&
    rules.length > 0;
  const togglePublish = async () => {
    setPublishing(true);
    try {
      await setCoachPublished(!published);
      notify(
        published
          ? "Your page is private again."
          : "Your page is live. Copy the link and share it with players.",
      );
    } catch (error) {
      notify(error instanceof Error ? error.message : "Couldn’t update your page.");
    }
    setPublishing(false);
  };
  const remaining = checklist.filter((c) => !c.done);
  const copy = async () => {
    const url = `${window.location.origin}/${slug}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      notify(`Your page link is ${url}`);
    }
  };
  return (
    <>
      <PageHeader
        title="Overview"
        description="What needs you today, and how your page looks to players."
      />
      <div className="overview-cards">
        <section
          className={`panel attention ${pending.length ? "has-work" : ""}`}
        >
          <Inbox aria-hidden="true" />
          <div>
            <h2>
              {pending.length
                ? `${pending.length} request${pending.length > 1 ? "s" : ""} to review`
                : "You’re all caught up"}
            </h2>
            <p>
              {pending.length
                ? "Players are waiting to hear from you."
                : "New requests will appear here."}
            </p>
          </div>
          {pending.length > 0 && (
            <Link className="button" href="/dashboard/requests">
              Review requests <ArrowRight size={15} aria-hidden="true" />
            </Link>
          )}
        </section>
        <section className="panel metric">
          <span>Confirmed this week</span>
          <strong>{thisWeek}</strong>
          <small>sessions</small>
        </section>
        <section className="panel page-card">
          <span>Your booking page</span>
          <strong>/{slug}</strong>
          <small>
            {look ? `${look.name} look` : "Custom look"}
            {paused
              ? " · Paused, your trial has ended"
              : published
                ? " · Live"
                : " · Private, only you can see it"}
          </small>
          <div className="row">
            {published ? (
              <>
                <Link className="button small" href={`/${slug}`}>
                  <ExternalLink size={14} aria-hidden="true" /> View
                </Link>
                <button className="button secondary small" onClick={copy}>
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  {copied ? "Copied" : "Copy link"}
                </button>
              </>
            ) : null}
            <button
              className={published ? "button secondary small" : "button small"}
              disabled={publishing || (!published && (!ready || paused))}
              onClick={togglePublish}
            >
              {publishing
                ? "Saving…"
                : published
                  ? "Unpublish"
                  : "Publish my page"}
            </button>
            <Link
              className="text-button"
              href="/dashboard/profile?tab=appearance"
            >
              Edit look
            </Link>
          </div>
        </section>
      </div>
      {tomorrow.length > 0 && (
        <section className="panel tomorrow" aria-label="Tomorrow">
          <div className="section-heading">
            <h2>Tomorrow · {mock.formatDate(tomorrowKey)}</h2>
            <span className="muted">
              Remind players on WhatsApp. You send each message yourself.
            </span>
          </div>
          {tomorrow.map((b) => {
            const href = whatsappLink(workspace, b, "reminder");
            return (
              <div className="reminder-row" key={b.id}>
                <span className="reminder-time">{mock.time(b.hour)}</span>
                <div className="grow">
                  <strong>{b.player}</strong>
                  <small>
                    {lessons.find((l) => l.id === b.lessonId)?.name} ·{" "}
                    {clubs.find((c) => c.id === b.clubId)?.name}
                  </small>
                </div>
                {href ? (
                  <a
                    className="button small"
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <MessageCircle size={14} aria-hidden="true" /> Send reminder
                    <span className="sr-only">
                      {" "}
                      to {b.player} (opens WhatsApp)
                    </span>
                  </a>
                ) : (
                  <span className="muted">No phone number</span>
                )}
              </div>
            );
          })}
        </section>
      )}
      {remaining.length > 0 && (
        <section className="panel checklist">
          <div className="section-heading">
            <h2>Finish setting up</h2>
            <span className="muted">
              {checklist.length - remaining.length} of {checklist.length} done
            </span>
          </div>
          <ul>
            {checklist.map((item) => (
              <li key={item.label} className={item.done ? "done" : ""}>
                {item.done ? (
                  <CircleCheck size={18} aria-hidden="true" />
                ) : (
                  <Circle size={18} aria-hidden="true" />
                )}
                {item.done ? (
                  item.label
                ) : (
                  <Link href={item.href}>{item.label}</Link>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}
      <div className="overview-grid">
        <section className="panel">
          <div className="section-heading">
            <h2>Upcoming sessions</h2>
            <Link className="text-button" href="/dashboard/calendar">
              View calendar <ArrowUpRight size={15} aria-hidden="true" />
            </Link>
          </div>
          {confirmed.length ? (
            confirmed.map((b) => (
              <button
                key={b.id}
                className="session-row"
                onClick={() => openModal({ kind: "booking", id: b.id })}
              >
                <div className="date-tile">
                  {mock.parseDate(b.date).getDate()}
                  <span>
                    {mock
                      .parseDate(b.date)
                      .toLocaleDateString("en-GB", { month: "short" })
                      .toUpperCase()}
                  </span>
                </div>
                <div className="grow">
                  <h3>{b.player}</h3>
                  <p>
                    {lessons.find((l) => l.id === b.lessonId)?.name} ·{" "}
                    {clubs.find((c) => c.id === b.clubId)?.name}
                  </p>
                </div>
                <span>{mock.time(b.hour)}</span>
                <ArrowRight size={16} aria-hidden="true" />
              </button>
            ))
          ) : (
            <Empty>No confirmed sessions yet.</Empty>
          )}
        </section>
        <section className="panel">
          <div className="section-heading">
            <h2>Booking requests</h2>
            <Badge tone="pending">{pending.length} pending</Badge>
          </div>
          {pending.length ? (
            pending.slice(0, 2).map((b) => <RequestCard b={b} key={b.id} />)
          ) : (
            <Empty>You’re all caught up.</Empty>
          )}
        </section>
      </div>
    </>
  );
}
