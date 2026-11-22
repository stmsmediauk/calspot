"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Logo } from "../logo";
import styles from "./auth.module.css";

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const signup = mode === "signup";

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (signup && password.length < 8)
      return setError("Use a password of at least 8 characters.");
    setBusy(true);
    const supabase = createClient();
    if (signup) {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: { emailRedirectTo: `${location.origin}/auth/callback` },
      });
      setBusy(false);
      if (error) return setError(error.message);
      if (data.session) router.replace("/onboarding");
      else setSent(true);
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      setBusy(false);
      if (error)
        return setError(
          error.message === "Invalid login credentials"
            ? "That email and password don’t match."
            : error.message,
        );
      router.replace("/dashboard");
    }
  };

  return (
    <div className={styles.page}>
      <header className={styles.top}>
        <Logo />
      </header>
      <section className={styles.card}>
        {sent ? (
          <>
            <h1>Check your email</h1>
            <p className={styles.lead}>
              We sent a confirmation link to <strong>{email}</strong>. Open it
              to finish creating your account, then you can build your page.
            </p>
          </>
        ) : (
          <form onSubmit={submit} noValidate>
            <h1>{signup ? "Create your account" : "Welcome back"}</h1>
            <p className={styles.lead}>
              {signup
                ? "Start with your email and a password. Next you’ll build your coaching page."
                : "Log in to manage your requests and page."}
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
            <label>
              Password
              <input
                type="password"
                value={password}
                required
                minLength={signup ? 8 : undefined}
                autoComplete={signup ? "new-password" : "current-password"}
                onChange={(e) => setPassword(e.target.value)}
              />
              {signup && <small>At least 8 characters.</small>}
            </label>
            {!signup && (
              <p className={styles.forgot}>
                <Link href="/forgot-password">Forgot your password?</Link>
              </p>
            )}
            {error && (
              <p className={styles.error} role="alert">
                {error}
              </p>
            )}
            <button type="submit" className={styles.primary} disabled={busy}>
              {busy ? "Please wait…" : signup ? "Create account" : "Log in"}
            </button>
            <p className={styles.switch}>
              {signup ? (
                <>
                  Already have an account? <Link href="/login">Log in</Link>
                </>
              ) : (
                <>
                  New to Calspot? <Link href="/signup">Create an account</Link>
                </>
              )}
            </p>
          </form>
        )}
      </section>
    </div>
  );
}
