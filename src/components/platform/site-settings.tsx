"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import styles from "./platform-admin.module.css";

const KEY = "founding_offer_active";

/** Site-wide switches. Currently just the founding coach offer on the landing page. */
export function SiteSettings() {
  const [active, setActive] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    createClient()
      .from("site_settings")
      .select("value")
      .eq("key", KEY)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error)
          setMessage(
            "Site settings aren’t set up yet. Run supabase/site_settings.sql in the Supabase SQL editor.",
          );
        else setActive(data ? data.value === true : true);
      });
  }, []);

  const toggle = async () => {
    if (active === null) return;
    setBusy(true);
    setMessage("");
    const next = !active;
    const { error } = await createClient().rpc("admin_set_setting", {
      p_key: KEY,
      p_value: next,
    });
    if (error) {
      setMessage(error.message);
      setBusy(false);
      return;
    }
    setActive(next);
    const refresh = await fetch("/api/revalidate-home", { method: "POST" });
    setMessage(
      refresh.ok
        ? `Founding offer ${next ? "on" : "off"}. The landing page is updated.`
        : `Founding offer ${next ? "on" : "off"}. The landing page will catch up within a minute.`,
    );
    setBusy(false);
  };

  return (
    <>
      <h1>Site settings</h1>
      <p>
        Controls the landing page. Changes show within a minute, usually
        straight away.
      </p>
      <div className={styles.plan}>
        <label>
          <input
            type="checkbox"
            checked={active === true}
            disabled={active === null || busy}
            onChange={toggle}
          />{" "}
          Show the founding coach offer
        </label>
        <p>
          Turns the lime banner, the founding badge and price, the lock-in line,
          the founding wording in the small print and the founding FAQ on or off
          together. When it&apos;s off, the page shows the standard £29 price.
        </p>
      </div>
      {message && (
        <p className={styles.error} role="status">
          {message}
        </p>
      )}
    </>
  );
}
