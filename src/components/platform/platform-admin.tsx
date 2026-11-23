"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { LogoutButton } from "../auth/logout-button";
import { Logo } from "../logo";
import { SiteSettings } from "./site-settings";
import { SupportView } from "./support-view";
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
  suspended?: boolean;
  billing_status?: string;
  last_sign_in_at?: string | null;
  requests_24h?: number;
  trial_ends_at?: string | null;
};

type Filter =
  "all" | "never" | "suspended" | "busy" | "inactive" | "ending" | "expired";
type View =
  | { type: "overview" }
  | { type: "site" }
  | { type: "coaches"; filter: Filter }
  | { type: "coach"; id: string; back: Filter };
const filterLabels: Record<Filter, string> = {
  all: "All coaches",
  never: "Never published",
  suspended: "Suspended",
  busy: "Busy (spam check)",
  inactive: "Inactive 30 days",
  ending: "Trial ending (3 days)",
  expired: "Trial expired",
};
const plans = ["trial", "paid", "free", "overdue"];
const csvCell = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;

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
  const [view, setView] = useState<View>({ type: "overview" });
  const [tools, setTools] = useState(true);
  const [now] = useState(() => Date.now());
  const [nav, setNav] = useState(false);

  useEffect(() => {
    let live = true;
    (async () => {
      const supabase = createClient();
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) return router.replace("/login");
      const admin = await supabase.rpc("is_platform_admin");
      if (admin.data !== true) return router.replace("/dashboard");
      let { data, error } = await supabase.rpc("admin_coaches_v2");
      if (error) {
        setTools(false);
        ({ data, error } = await supabase.rpc("admin_coaches"));
      }
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

  const patch = (row: CoachRow, change: Partial<CoachRow>) =>
    setRows((list) =>
      list.map((r) => (r.id === row.id ? { ...r, ...change } : r)),
    );
  const suspend = async (row: CoachRow) => {
    setMessage("");
    const next = !row.suspended;
    if (
      next &&
      !window.confirm(
        `Suspend ${row.name || row.slug}? Their page goes offline and they can’t publish it again until you unsuspend.`,
      )
    )
      return;
    const { error } = await createClient().rpc("admin_set_suspended", {
      p_coach: row.id,
      p_suspended: next,
    });
    if (error) return setMessage(error.message);
    patch(row, { suspended: next, published: next ? false : row.published });
  };
  const setPlan = async (row: CoachRow, status: string) => {
    setMessage("");
    const { error } = await createClient().rpc("admin_set_billing", {
      p_coach: row.id,
      p_status: status,
    });
    if (error) return setMessage(error.message);
    patch(row, { billing_status: status });
  };
  const extend = async (row: CoachRow, days: number) => {
    setMessage("");
    const { data, error } = await createClient().rpc("admin_extend_trial", {
      p_coach: row.id,
      p_days: days,
    });
    if (error) return setMessage(error.message);
    patch(row, { billing_status: "trial", trial_ends_at: String(data) });
  };
  const clearPending = async (row: CoachRow) => {
    setMessage("");
    if (
      !window.confirm(
        `Delete the ${row.bookings_pending} waiting request(s) for ${row.name || row.slug}? Use this to clear spam. Confirmed requests are kept.`,
      )
    )
      return;
    const { error } = await createClient().rpc("admin_clear_pending", {
      p_coach: row.id,
    });
    if (error) return setMessage(error.message);
    patch(row, {
      bookings_total: Number(row.bookings_total) - Number(row.bookings_pending),
      bookings_pending: 0,
    });
  };
  const exportCsv = () => {
    const head = [
      "Name",
      "Title",
      "Page address",
      "Email",
      "Published",
      "Suspended",
      "Plan",
      "Joined",
      "Last sign in",
      "Clubs",
      "Lessons",
      "Requests",
      "Waiting",
      "Last request",
    ];
    const lines = [
      head,
      ...shown.map((r) => [
        r.name,
        r.title,
        r.slug,
        r.owner_email,
        r.published,
        r.suspended ?? "",
        r.billing_status ?? "",
        r.created_at,
        r.last_sign_in_at ?? "",
        r.clubs,
        r.lessons,
        r.bookings_total,
        r.bookings_pending,
        r.last_request_at ?? "",
      ]),
    ];
    const blob = new Blob(
      [lines.map((l) => l.map(csvCell).join(",")).join("\n")],
      { type: "text/csv" },
    );
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `calspot-coaches-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
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
    setView({ type: "coaches", filter: "all" });
  };

  const cutoff = now - 30 * 86_400_000;
  const trialLeft = (r: CoachRow) =>
    r.billing_status === "trial" && r.trial_ends_at
      ? new Date(r.trial_ends_at).getTime() - now
      : null;
  const matches = (r: CoachRow, f: Filter) =>
    f === "ending"
      ? (trialLeft(r) ?? -1) > 0 && (trialLeft(r) ?? 0) < 3 * 86_400_000
      : f === "expired"
        ? (trialLeft(r) ?? 1) <= 0 || r.billing_status === "overdue"
        : f === "never"
          ? !r.published && !r.suspended
          : f === "suspended"
            ? Boolean(r.suspended)
            : f === "busy"
              ? Number(r.requests_24h ?? 0) >= 10 ||
                Number(r.bookings_pending) >= 10
              : f === "inactive"
                ? !r.last_sign_in_at ||
                  new Date(r.last_sign_in_at).getTime() < cutoff
                : true;
  const counts: Record<Filter, number> = {
    all: rows.length,
    never: rows.filter((r) => matches(r, "never")).length,
    suspended: rows.filter((r) => matches(r, "suspended")).length,
    busy: rows.filter((r) => matches(r, "busy")).length,
    ending: rows.filter((r) => matches(r, "ending")).length,
    expired: rows.filter((r) => matches(r, "expired")).length,
    inactive: rows.filter((r) => matches(r, "inactive")).length,
  };
  const activeFilter: Filter =
    view.type === "coaches"
      ? view.filter
      : view.type === "coach"
        ? view.back
        : "all";
  const shown = (() => {
    const q = query.trim().toLowerCase();
    const list = rows.filter((r) => matches(r, activeFilter));
    return q
      ? list.filter((r) =>
          [r.name, r.slug, r.owner_email, r.title].some((v) =>
            v?.toLowerCase().includes(q),
          ),
        )
      : list;
  })();
  const totals = {
    coaches: rows.length,
    published: rows.filter((r) => r.published).length,
    pending: rows.reduce((n, r) => n + Number(r.bookings_pending), 0),
    bookings: rows.reduce((n, r) => n + Number(r.bookings_total), 0),
  };
  const current =
    view.type === "coach" ? rows.find((r) => r.id === view.id) : undefined;
  const status = (r: CoachRow) =>
    !r.suspended && ((trialLeft(r) ?? 1) <= 0 || r.billing_status === "overdue")
      ? { label: "Paused", cls: styles.badgeRed }
      : r.suspended
        ? { label: "Suspended", cls: styles.badgeRed }
        : r.published
          ? { label: "Live", cls: styles.badgeGreen }
          : { label: "Private", cls: styles.badgeGrey };
  const plan = (r: CoachRow) =>
    (r.billing_status ?? "trial")[0].toUpperCase() +
    (r.billing_status ?? "trial").slice(1);

  const navButton = (
    label: string,
    active: boolean,
    onClick: () => void,
    count?: number,
    sub = false,
  ) => (
    <button
      type="button"
      className={`${styles.navItem} ${sub ? styles.navSub : ""}`}
      aria-current={active ? "page" : undefined}
      onClick={() => {
        setNav(false);
        onClick();
      }}
    >
      <span>{label}</span>
      {count !== undefined && <em>{count}</em>}
    </button>
  );

  if (state === "loading")
    return (
      <p role="status" className={styles.wait}>
        Loading…
      </p>
    );
  return (
    <div className={styles.shell}>
      <div className={styles.sidebar}>
        <div className={styles.brand}>
          <Logo compact />
          <span className={styles.tag}>Admin</span>
        </div>
        <button
          type="button"
          className={styles.menuButton}
          aria-expanded={nav}
          onClick={() => setNav((v) => !v)}
        >
          Menu
        </button>
        <nav
          className={`${styles.nav} ${nav ? styles.navOpen : ""}`}
          aria-label="Admin"
        >
          {navButton("Overview", view.type === "overview", () =>
            setView({ type: "overview" }),
          )}
          {navButton(
            "Coaches",
            activeFilter === "all" &&
              view.type !== "overview" &&
              view.type !== "site",
            () => setView({ type: "coaches", filter: "all" }),
            counts.all,
          )}
          {tools && (
            <div
              className={styles.navGroup}
              role="group"
              aria-label="Needs attention"
            >
              <span>Needs attention</span>
              {(
                [
                  "expired",
                  "ending",
                  "never",
                  "busy",
                  "inactive",
                  "suspended",
                ] as Filter[]
              ).map((f) =>
                navButton(
                  filterLabels[f],
                  view.type !== "overview" &&
                    view.type !== "site" &&
                    activeFilter === f,
                  () => setView({ type: "coaches", filter: f }),
                  counts[f],
                  true,
                ),
              )}
            </div>
          )}
          {navButton("Site settings", view.type === "site", () =>
            setView({ type: "site" }),
          )}
          <div className={styles.navFoot}>
            <Link href="/dashboard">My dashboard</Link>
            <LogoutButton className={styles.logout} />
          </div>
        </nav>
      </div>
      <div className={styles.content}>
        {state === "error" && (
          <p className={styles.error} role="alert">
            Couldn’t load coaches: {message}
          </p>
        )}
        {!tools && state === "ready" && (
          <p className={styles.error} role="alert">
            Suspend, plans, activity and spam tools aren’t set up yet. Run
            supabase/admin_tools.sql in the Supabase SQL editor.
          </p>
        )}
        {message && state === "ready" && (
          <p className={styles.error} role="alert">
            {message}
          </p>
        )}

        {view.type === "site" && <SiteSettings />}

        {view.type === "overview" && (
          <>
            <h1>Overview</h1>
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
            {tools && (
              <>
                <h2 className={styles.h2}>Needs attention</h2>
                <ul className={styles.attention}>
                  {(
                    [
                      "expired",
                      "ending",
                      "never",
                      "busy",
                      "inactive",
                      "suspended",
                    ] as Filter[]
                  ).map((f) => (
                    <li key={f}>
                      <button
                        type="button"
                        onClick={() => setView({ type: "coaches", filter: f })}
                      >
                        <strong>{counts[f]}</strong>
                        <span>{filterLabels[f]}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </>
            )}
            <p className={styles.note}>
              Counts only. Player names, emails and messages stay private to
              each coach.
            </p>
          </>
        )}

        {view.type === "coaches" && (
          <>
            <h1>{filterLabels[view.filter]}</h1>
            <div className={styles.toolbar}>
              <label className={styles.search}>
                <span>Search coaches</span>
                <input
                  type="search"
                  value={query}
                  placeholder="Name, page address or email"
                  onChange={(e) => setQuery(e.target.value)}
                />
              </label>
              <button type="button" className={styles.view} onClick={exportCsv}>
                Export CSV
              </button>
            </div>
            {shown.length === 0 ? (
              <p className={styles.empty}>
                {rows.length
                  ? "No coaches match."
                  : "No coaches have signed up yet."}
              </p>
            ) : (
              <ul className={styles.list}>
                {shown.map((r) => (
                  <li key={r.id}>
                    <button
                      type="button"
                      className={styles.rowButton}
                      onClick={() =>
                        setView({ type: "coach", id: r.id, back: view.filter })
                      }
                    >
                      <span className={styles.who}>
                        <strong>{r.name || "Unnamed coach"}</strong>
                        <small>
                          /{r.slug} · {r.owner_email}
                        </small>
                      </span>
                      <span className={status(r).cls}>{status(r).label}</span>
                      {tools && (
                        <span className={styles.badgeGrey}>{plan(r)}</span>
                      )}
                      <span className={styles.rowMeta}>
                        {r.bookings_total} request
                        {Number(r.bookings_total) === 1 ? "" : "s"}
                        {Number(r.bookings_pending) > 0 &&
                          ` · ${r.bookings_pending} waiting`}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}

        {view.type === "coach" && !current && (
          <p className={styles.empty}>Coach not found.</p>
        )}
        {view.type === "coach" && current && (
          <>
            <button
              type="button"
              className={styles.back}
              onClick={() => setView({ type: "coaches", filter: view.back })}
            >
              ← {filterLabels[view.back]}
            </button>
            <h1>{current.name || "Unnamed coach"}</h1>
            <p className={styles.sub}>
              /{current.slug} · {current.owner_email}{" "}
              <span className={status(current).cls}>
                {status(current).label}
              </span>{" "}
              {tools && (
                <span className={styles.badgeGrey}>{plan(current)}</span>
              )}
            </p>
            <p className={styles.summary}>
              Joined {date(current.created_at)}
              {tools &&
                current.billing_status === "trial" &&
                ` · Trial ends ${date(current.trial_ends_at ?? null)}`}
              {tools && ` · Last seen ${date(current.last_sign_in_at ?? null)}`}
              {" · "}
              {current.bookings_total} request
              {Number(current.bookings_total) === 1 ? "" : "s"}
              {Number(current.bookings_pending) > 0 &&
                ` (${current.bookings_pending} waiting)`}
            </p>
            <div className={styles.actions}>
              {tools && (
                <label className={styles.plan}>
                  <span>Plan</span>
                  <select
                    value={current.billing_status ?? "trial"}
                    onChange={(e) => setPlan(current, e.target.value)}
                  >
                    {plans.map((p) => (
                      <option key={p} value={p}>
                        {p[0].toUpperCase() + p.slice(1)}
                      </option>
                    ))}
                  </select>
                </label>
              )}
              {current.published && (
                <Link
                  className={styles.view}
                  href={`/${current.slug}`}
                  target="_blank"
                >
                  View page
                </Link>
              )}
              <button
                type="button"
                className={styles.view}
                onClick={() => setPublished(current, !current.published)}
              >
                {current.published ? "Unpublish" : "Publish"}
              </button>
              {tools && (
                <button
                  type="button"
                  className={styles.view}
                  onClick={() => suspend(current)}
                >
                  {current.suspended ? "Unsuspend" : "Suspend"}
                </button>
              )}
              {tools && (
                <button
                  type="button"
                  className={styles.view}
                  onClick={() => extend(current, 14)}
                >
                  Extend trial 14 days
                </button>
              )}
              {tools && Number(current.bookings_pending) > 0 && (
                <button
                  type="button"
                  className={styles.view}
                  onClick={() => clearPending(current)}
                >
                  Clear waiting requests
                </button>
              )}
            </div>
            <SupportView coachId={current.id} />
            <div className={styles.danger}>
              <button
                type="button"
                className={styles.delete}
                onClick={() => remove(current)}
              >
                Delete this coach…
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
