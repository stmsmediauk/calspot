"use client";
import { useState } from "react";
import { useAccount } from "@/lib/coach-workspace";
import styles from "./trial-banner.module.css";

export const contactEmail = "contact@calspot.co.uk";

/** Where the coach is on their free trial, or a clear message once it has ended. */
export function TrialBanner() {
  const { plan } = useAccount();
  const [now] = useState(() => Date.now());
  if (!plan || plan.status === "paid" || plan.status === "free") return null;

  const mail = <a href={`mailto:${contactEmail}`}>{contactEmail}</a>;
  if (plan.suspended)
    return (
      <div className={`${styles.banner} ${styles.stop}`} role="alert">
        <strong>Your page has been suspended.</strong> Please contact {mail}.
      </div>
    );
  if (!plan.active)
    return (
      <div className={`${styles.banner} ${styles.stop}`} role="alert">
        <strong>
          {plan.status === "overdue"
            ? "Your account is overdue."
            : "Your free trial has ended."}
        </strong>{" "}
        Your page is paused and players can’t send requests. Everything you’ve
        set up is saved. Email {mail} to carry on.
      </div>
    );
  const end = plan.trialEndsAt ? new Date(plan.trialEndsAt) : null;
  if (!end) return null;
  const days = Math.max(1, Math.ceil((end.getTime() - now) / 86_400_000));
  const ends = end.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
  });
  return (
    <div
      className={`${styles.banner} ${days <= 3 ? styles.warn : ""}`}
      role="status"
    >
      <strong>
        Free trial · {days} {days === 1 ? "day" : "days"} left
      </strong>{" "}
      Ends {ends}. After that Calspot is £29 a month. Questions? {mail}
    </div>
  );
}
