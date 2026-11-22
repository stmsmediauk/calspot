"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { LogoutButton } from "../auth/logout-button";
import { Logo } from "../logo";
import styles from "./platform-admin.module.css";

type CoachRow = {
  id: string;
  slug: string;
  name: string | null;
  title: string | null;
  owner_email: string;
  published: boolean;
  created_at: string;
  clubs: number;
  lessons: number;
  bookings_total: number;
  bookings_pending: number;
  last_request_at: string | null;
};

const date = (value: string | null) =>
  value
    ? new Date(value).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "—";

/** Platform-owner view: every coach, with counts only and never player details. */
export function PlatformAdmin() {
  const router = useRouter();
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const [rows, setRows] = useState<CoachRow[]>([]);
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let live = true;
    (async () => {
      const supabase = createClient();
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) return router.replace("/login");
      const admin = await supabase.rpc("is_platform_admin");
      if (admin.data !== true) return router.replace("/dashboard");
      const { data, error } = await supabase.rpc("admin_coaches");
      if (!live) return;
      if (error) {
        setMessage(error.message);
        return setState("error");
      }
      setRows((data ?? []) as CoachRow[]);
      setState("ready");
    })();
    return () => {
      live = false;
    };
  }, [router]);

  const setPublished = async (row: CoachRow, published: boolean) => {
    setMessage("");
    const { error } = await createClient().rpc("admin_set_published", {
      p_coach: row.id,
      p_published: published,
    });
    if (error) return setMessage(error.message);
    setRows((list) =>
      list.map((r) => (r.id === row.id ? { ...r, published } : r)),
    );
  };

  const remove = async (row: CoachRow) => {
    setMessage("");
    const typed = window.prompt(
      `Delete ${row.name || row.slug} permanently? This removes their page, lessons, availability, all booking requests and their login. It cannot be undone.\n\nType the page address (${row.slug}) to confirm.`,
    );
    if (typed === null) return;
    if (typed.trim() !== row.slug)
      return setMessage("The address didn’t match, so nothing was deleted.");
    const { error } = await createClient().rpc("admin_delete_coach", {
      p_coach: row.id,
    });
    if (error)
      return setMessage(
        /function|schema cache/i.test(error.message)
          ? "Delete isn’t set up in the database yet. Run supabase/admin_delete_coach.sql in the Supabase SQL editor."
          : error.message,
      );
    setRows((list) => list.filter((r) => r.id !== row.id));
  };

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q
      ? rows.filter((r) =>
          [r.name, r.slug, r.owner_email, r.title].some((v) =>
            v?.toLowerCase().includes(q),
          ),
        )
      : rows;
  }, [rows, query]);
  const totals = useMemo(
    () => ({
      coaches: rows.length,
      published: rows.filter((r) => r.published).length,
      pending: rows.reduce((n, r) => n + Number(r.bookings_pending), 0),
      bookings: rows.reduce((n, r) => n + Number(r.bookings_total), 0),
    }),
    [rows],
  );

  if (state === "loading")
    return (
      <p role="status" className={styles.wait}>
        Loading…
      </p>
    );
  return (
    <div className={styles.page}>
      <header className={styles.top}>
        <Logo compact />
        <span className={styles.tag}>Platform admin</span>
        <Link href="/dashboard">My dashboard</Link>
        <LogoutButton className={styles.logout} />
      </header>
      <section className={styles.body}>
        <h1>Coaches</h1>
        {state === "error" && (
          <p className={styles.error} role="alert">
            Couldn’t load coaches: {message}
          </p>
        )}
        <dl className={styles.stats}>
          <div>
            <dt>Coaches</dt>
            <dd>{totals.coaches}</dd>
          </div>
          <div>
            <dt>Published</dt>
            <dd>{totals.published}</dd>
          </div>
          <div>
            <dt>Requests waiting</dt>
            <dd>{totals.pending}</dd>
          </div>
          <div>
            <dt>All requests</dt>
            <dd>{totals.bookings}</dd>
          </div>
        </dl>
        <label className={styles.search}>
          <span>Search coaches</span>
          <input
            type="search"
            value={query}
            placeholder="Name, page address or email"
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        {message && state === "ready" && (
          <p className={styles.error} role="alert">
            {message}
          </p>
        )}
        {shown.length === 0 ? (
          <p className={styles.empty}>
            {rows.length ? "No coaches match that search." : "No coaches have signed up yet."}
          </p>
        ) : (
          <ul className={styles.list}>
            {shown.map((r) => (
              <li key={r.id}>
                <div className={styles.who}>
                  <strong>{r.name || "Unnamed coach"}</strong>
                  <span>{r.title}</span>
                  <small>
                    /{r.slug} · {r.owner_email}
                  </small>
                </div>
                <dl className={styles.counts}>
                  <div>
                    <dt>Joined</dt>
                    <dd>{date(r.created_at)}</dd>
                  </div>
                  <div>
                    <dt>Clubs · lessons</dt>
                    <dd>
                      {r.clubs} · {r.lessons}
                    </dd>
                  </div>
                  <div>
                    <dt>Requests</dt>
                    <dd>
                      {r.bookings_total}
                      {Number(r.bookings_pending) > 0 &&
                        ` (${r.bookings_pending} waiting)`}
                    </dd>
                  </div>
                  <div>
                    <dt>Last request</dt>
                    <dd>{date(r.last_request_at)}</dd>
                  </div>
                </dl>
                <div className={styles.actions}>
                <button
                  type="button"
                  className={r.published ? styles.on : styles.off}
                  aria-pressed={r.published}
                  onClick={() => setPublished(r, !r.published)}
                >
                  {r.published ? "Published · Unpublish" : "Private · Publish"}
                </button>
                <button
                  type="button"
                  className={styles.delete}
                  onClick={() => remove(r)}
                >
                  Delete
                </button>
                </div>
              </li>
            ))}
          </ul>
        )}
        <p className={styles.note}>
          Counts only. Player names, emails and messages stay private to each
          coach.
        </p>
      </section>
    </div>
  );
}
