"use client";
import { useState } from "react";
import { CalendarSync as SyncIcon, Copy } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useAdmin } from "./context";

/**
 * Lets a coach subscribe to their confirmed sessions from their own calendar app.
 * The link holds a secret token: anyone who has it can see first names, lessons,
 * clubs and times, so it can be reset.
 */
export function CalendarSync() {
  const { notify } = useAdmin();
  const [token, setToken] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const load = async (reset: boolean) => {
    setBusy(true);
    setError("");
    const { data, error: failed } = await createClient().rpc(
      reset ? "reset_calendar_token" : "my_calendar_token",
    );
    setBusy(false);
    if (failed || typeof data !== "string") {
      setError("Couldn’t get your calendar link. Please try again in a moment.");
      return;
    }
    setToken(data);
    if (reset) notify("New link created. The old one has stopped working.");
  };
  const link = token ? `${window.location.origin}/api/calendar/${token}.ics` : "";
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      notify("Calendar link copied.");
    } catch {
      notify("Couldn’t copy automatically. Select the link and copy it.");
    }
  };

  return (
    <details
      className="panel calendar-sync"
      onToggle={(e) => {
        if ((e.currentTarget as HTMLDetailsElement).open && !token && !busy)
          void load(false);
      }}
    >
      <summary>
        <SyncIcon size={16} aria-hidden="true" /> Sync to your calendar
      </summary>
      <p>
        See your confirmed sessions in Apple Calendar, Google Calendar or
        Outlook. Only confirmed sessions appear, with first name, lesson, club
        and time. No emails, phone numbers or messages.
      </p>
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      {busy && !token && <p role="status">Getting your link…</p>}
      {token && (
        <>
          <label>
            Your private calendar link
            <input readOnly value={link} onFocus={(e) => e.currentTarget.select()} />
          </label>
          <div className="row">
            <button type="button" className="button secondary small" onClick={copy}>
              <Copy size={14} aria-hidden="true" /> Copy link
            </button>
            <a
              className="button secondary small"
              href={link.replace(/^https?:/, "webcal:")}
            >
              Add to Apple Calendar
            </a>
          </div>
          <ul className="footnote">
            <li>
              <strong>Google Calendar:</strong> Other calendars → + → From URL,
              then paste the link. Google can take several hours to show changes.
            </li>
            <li>
              <strong>Outlook:</strong> Add calendar → Subscribe from web.
            </li>
            <li>
              Treat the link like a password. If it is shared by mistake, make a
              new one and the old one stops working.
            </li>
          </ul>
          <button
            type="button"
            className="text-button"
            disabled={busy}
            onClick={() => {
              if (window.confirm("Make a new link? Calendars using the old one will stop updating."))
                void load(true);
            }}
          >
            Make a new link
          </button>
        </>
      )}
    </details>
  );
}
