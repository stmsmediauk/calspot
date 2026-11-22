"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import styles from "./platform-admin.module.css";

type Support = {
  profile: {
    name: string | null;
    title: string | null;
    location: string | null;
    has_tagline: boolean;
    has_introduction: boolean;
    has_photo: boolean;
    has_whatsapp: boolean;
    palette: string | null;
    hero: string | null;
  };
  published: boolean;
  suspended: boolean;
  clubs: { id: string; name: string; address: string; active: boolean }[];
  lessons: {
    id: string;
    name: string;
    duration: number;
    price: number;
    active: boolean;
  }[];
  rules: {
    day: number;
    start: number;
    end: number;
    club_id: string;
    lesson_id: string;
    from: string | null;
    to: string | null;
  }[];
  extra_dates: number;
  blocked_dates: number;
  requests: Record<string, number>;
  oldest_pending: string | null;
};

const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const hour = (n: number) => {
  const h = Math.floor(n);
  const m = Math.round((n - h) * 60);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
};

/** Setup and request counts for one coach. Never includes player details. */
export function SupportView({ coachId }: { coachId: string }) {
  const [data, setData] = useState<Support | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    let live = true;
    createClient()
      .rpc("admin_coach_support", { p_coach: coachId })
      .then(({ data, error }) => {
        if (!live) return;
        if (error)
          setError(
            /function|schema cache/i.test(error.message)
              ? "Run supabase/admin_support_view.sql in the Supabase SQL editor to turn this on."
              : error.message,
          );
        else setData(data as Support);
      });
    return () => {
      live = false;
    };
  }, [coachId]);

  if (error)
    return (
      <p className={styles.error} role="alert">
        {error}
      </p>
    );
  if (!data) return <p className={styles.note}>Loading…</p>;

  const activeClubs = data.clubs.filter((c) => c.active);
  const activeLessons = data.lessons.filter((l) => l.active);
  const clubName = (id: string) =>
    data.clubs.find((c) => c.id === id)?.name ?? "Any club";
  const lessonName = (id: string) =>
    data.lessons.find((l) => l.id === id)?.name ?? "Any lesson";
  const checks: [string, boolean][] = [
    ["Has an active club", activeClubs.length > 0],
    ["Has an active lesson", activeLessons.length > 0],
    ["Has weekly availability", data.rules.length > 0],
    ["Has a photograph", data.profile.has_photo],
    ["Has an introduction", data.profile.has_introduction],
    ["Has a WhatsApp number", data.profile.has_whatsapp],
  ];
  const waiting = Number(data.requests.pending ?? 0);
  return (
    <div className={styles.support}>
      <section>
        <h3>Setup check</h3>
        <ul className={styles.checks}>
          {checks.map(([label, ok]) => (
            <li key={label} data-ok={ok}>
              <span aria-hidden="true">{ok ? "✓" : "✕"}</span> {label}
              <span className={styles.srOnly}>
                {ok ? " (done)" : " (missing)"}
              </span>
            </li>
          ))}
        </ul>
        <p className={styles.note}>
          {data.profile.location || "No location"} · look:{" "}
          {data.profile.palette ?? "—"} / {data.profile.hero ?? "—"}
        </p>
      </section>
      <section>
        <h3>Clubs and lessons</h3>
        <ul className={styles.plain}>
          {data.clubs.map((c) => (
            <li key={c.id}>
              {c.name || "Unnamed club"} {!c.active && <em>(off)</em>}
            </li>
          ))}
          {data.lessons.map((l) => (
            <li key={l.id}>
              {l.name} · {l.duration} min · £{l.price}{" "}
              {!l.active && <em>(off)</em>}
            </li>
          ))}
          {!data.clubs.length && !data.lessons.length && <li>None yet</li>}
        </ul>
      </section>
      <section>
        <h3>Weekly availability</h3>
        <ul className={styles.plain}>
          {data.rules.map((r, i) => (
            <li key={i}>
              {days[r.day]} {hour(r.start)}–{hour(r.end)} ·{" "}
              {clubName(r.club_id)} · {lessonName(r.lesson_id)}
            </li>
          ))}
          {!data.rules.length && <li>No weekly times set</li>}
        </ul>
        <p className={styles.note}>
          {data.extra_dates} extra date(s) · {data.blocked_dates} blocked
          date(s)
        </p>
      </section>
      <section>
        <h3>Requests</h3>
        <ul className={styles.plain}>
          {Object.entries(data.requests).map(([status, n]) => (
            <li key={status}>
              {status}: {n}
            </li>
          ))}
          {!Object.keys(data.requests).length && <li>None yet</li>}
        </ul>
        {waiting > 0 && data.oldest_pending && (
          <p className={styles.note}>
            Oldest waiting request:{" "}
            {Math.max(
              0,
              Math.floor(
                (new Date().getTime() -
                  new Date(data.oldest_pending).getTime()) /
                  86_400_000,
              ),
            )}{" "}
            day(s) ago
          </p>
        )}
      </section>
      <p className={styles.note}>
        Player names, emails, phone numbers and messages are never shown here.
      </p>
    </div>
  );
}
