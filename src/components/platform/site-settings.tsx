"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  FOUNDING_PLACES,
  FOUNDING_PRICE,
  STANDARD_PRICE,
} from "@/lib/offer";
import styles from "./platform-admin.module.css";

const KEY = "founding_offer_active";

const controls = [
  "The lime banner above the header",
  "The “Founding coach offer” badge on the pricing card",
  `The £${FOUNDING_PRICE} price with £${STANDARD_PRICE} struck through, and the lock-in line`,
  "The founding wording in the hero and closing small print",
  "The “What’s the founding price?” FAQ",
];

const when = (iso: string | null) =>
  iso
    ? new Intl.DateTimeFormat("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date(iso))
    : null;

/** Site-wide switches. Currently just the founding coach offer on the landing page. */
export function SiteSettings() {
  const [active, setActive] = useState<boolean | null>(null);
  const [updated, setUpdated] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ text: string; error: boolean } | null>(
    null,
  );

  useEffect(() => {
    createClient()
      .from("site_settings")
      .select("value, updated_at")
      .eq("key", KEY)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error)
          setMessage({
            text: "Site settings aren’t set up yet. Run supabase/site_settings.sql in the Supabase SQL editor.",
            error: true,
          });
        else {
          setActive(data ? data.value === true : true);
          setUpdated(data?.updated_at ?? null);
        }
      });
  }, []);

  const toggle = async () => {
    if (active === null || busy) return;
    setBusy(true);
    setMessage(null);
    const next = !active;
    const { error } = await createClient().rpc("admin_set_setting", {
      p_key: KEY,
      p_value: next,
    });
    if (error) {
      setMessage({ text: error.message, error: true });
      setBusy(false);
      return;
    }
    setActive(next);
    setUpdated(new Date().toISOString());
    const refresh = await fetch("/api/revalidate-home", { method: "POST" });
    setMessage({
      text: refresh.ok
        ? `Founding offer switched ${next ? "on" : "off"}. The landing page is updated.`
        : `Founding offer switched ${next ? "on" : "off"}. The landing page will catch up within a minute.`,
      error: false,
    });
    setBusy(false);
  };

  const on = active !== false;
  return (
    <>
      <h1>Site settings</h1>
      <p className={styles.settingsIntro}>
        Switches that change the public landing page. Changes show straight
        away, and within a minute at the latest.
      </p>

      <section className={styles.setting} aria-labelledby="founding-h">
        <div className={styles.settingHead}>
          <div>
            <div className={styles.settingTitle}>
              <h2 id="founding-h">Founding coach offer</h2>
              {active !== null && (
                <span className={on ? styles.statusOn : styles.statusOff}>
                  {on ? "On" : "Off"}
                </span>
              )}
            </div>
            <p>
              £{FOUNDING_PRICE} a month, locked in, for the first{" "}
              {FOUNDING_PLACES} coaches. Switch it off when the places are
              gone and the page goes back to the standard £{STANDARD_PRICE}.
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={on}
            aria-labelledby="founding-h"
            className={styles.switch}
            disabled={active === null || busy}
            onClick={toggle}
          >
            <span className={styles.knob} />
          </button>
        </div>

        <div className={styles.settingBody}>
          <div>
            <h3>This switch controls</h3>
            <ul className={styles.controls}>
              {controls.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3>What visitors see now</h3>
            <div className={styles.preview} aria-hidden="true">
              {on ? (
                <div className={styles.previewBanner}>
                  Founding coaches: £{FOUNDING_PRICE}/month, locked in. Only{" "}
                  {FOUNDING_PLACES} places.
                </div>
              ) : (
                <div className={styles.previewNoBanner}>No banner</div>
              )}
              <div className={styles.previewPrice}>
                {on && (
                  <span className={styles.previewBadge}>
                    Founding coach offer
                  </span>
                )}
                <p className={styles.previewAmount}>
                  £{on ? FOUNDING_PRICE : STANDARD_PRICE}
                  <small>a month</small>
                  {on && <del>£{STANDARD_PRICE}</del>}
                </p>
                <p className={styles.previewButton}>
                  {on ? "Claim founding price" : "Start my free trial"}
                </p>
              </div>
            </div>
            <p className={styles.previewNote}>
              A simplified preview of the banner and pricing card.
            </p>
          </div>
        </div>

        <div className={styles.settingFoot}>
          <span>
            {when(updated)
              ? `Last changed ${when(updated)}`
              : "Not changed yet. Using the default (on)."}
          </span>
          <a href="/" target="_blank" rel="noreferrer">
            View the landing page ↗
          </a>
        </div>
      </section>

      {message && (
        <p
          className={styles.settingMessage}
          data-error={message.error}
          role="status"
        >
          {message.text}
        </p>
      )}
    </>
  );
}
