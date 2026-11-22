"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Logo } from "../logo";
import styles from "./auth.module.css";

function Frame({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.page}>
      <header className={styles.top}>
        <Logo />
      </header>
      <section className={styles.card}>{children}</section>
    </div>
  );
}

/** Step 1: ask for an email and send the reset link. */
export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    const { error } = await createClient().auth.resetPasswordForEmail(
      email.trim(),
      { redirectTo: `${location.origin}/auth/callback?next=/reset-password` },
    );
    setBusy(false);
    if (error) return setError(error.message);
    setSent(true);
  };

  return (
    <Frame>
      {sent ? (
        <>
          <h1>Check your email</h1>
          <p className={styles.lead}>
            If <strong>{email}</strong> has a Calspot account, we’ve sent a link
            to choose a new password. It can take a minute to arrive.
          </p>
          <p className={styles.switch}>
            <Link href="/login">Back to log in</Link>
          </p>
        </>
      ) : (
        <form onSubmit={submit} noValidate>
          <h1>Reset your password</h1>
          <p className={styles.lead}>
            Enter your email and we’ll send you a link to choose a new one.
          </p>
          <label>
            Email
            <input
              type="email"
              value={email}
              required
              autoComplete="email"
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          {error && (
            <p className={styles.error} role="alert">
              {error}
            </p>
          )}
          <button type="submit" className={styles.primary} disabled={busy || !email.trim()}>
            {busy ? "Sending…" : "Send reset link"}
          </button>
          <p className={styles.switch}>
            <Link href="/login">Back to log in</Link>
          </p>
        </form>
      )}
    </Frame>
  );
}

/** Step 2: the emailed link signs the user in briefly; here they choose a new password. */
export function ResetPasswordForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password.length < 8)
      return setError("Use a password of at least 8 characters.");
    setBusy(true);
    const supabase = createClient();
    const { data } = await supabase.auth.getUser();
    if (!data.user) {
      setBusy(false);
      return setError(
        "This link has expired. Request a new one from the log in page.",
      );
    }
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) return setError(error.message);
    router.replace("/dashboard");
  };

  return (
    <Frame>
      <form onSubmit={submit} noValidate>
        <h1>Choose a new password</h1>
        <p className={styles.lead}>You’ll be logged in once it’s saved.</p>
        <label>
          New password
          <input
            type="password"
            value={password}
            required
            minLength={8}
            autoComplete="new-password"
            onChange={(e) => setPassword(e.target.value)}
          />
          <small>At least 8 characters.</small>
        </label>
        {error && (
          <p className={styles.error} role="alert">
            {error}{" "}
            {error.includes("expired") && <Link href="/forgot-password">Get a new link</Link>}
          </p>
        )}
        <button type="submit" className={styles.primary} disabled={busy}>
          {busy ? "Saving…" : "Save password"}
        </button>
      </form>
    </Frame>
  );
}
