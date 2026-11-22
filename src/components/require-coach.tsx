"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { startCoachSession, useCoachSession } from "@/lib/coach-workspace";

function Waiting() {
  return (
    <p role="status" style={{ padding: 32, color: "var(--muted)" }}>
      Loading…
    </p>
  );
}

/** Dashboard pages: needs a signed-in coach. Others are sent to log in or finish setup. */
export function RequireCoach({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const status = useCoachSession();
  useEffect(() => {
    startCoachSession();
    if (status === "signed-out") router.replace("/login");
    if (status === "no-coach") {
      // Platform admins have no coach page; send them to their own screen.
      void createClient()
        .rpc("is_platform_admin")
        .then(({ data }) => router.replace(data === true ? "/admin" : "/onboarding"));
    }
  }, [status, router]);
  return status === "ready" ? <>{children}</> : <Waiting />;
}

/** Onboarding: needs an account that has not built a page yet. */
export function RequireAccount({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const status = useCoachSession();
  useEffect(() => {
    startCoachSession();
    if (status === "signed-out") router.replace("/login");
    if (status === "ready") router.replace("/dashboard");
    if (status === "no-coach") {
      void createClient()
        .rpc("is_platform_admin")
        .then(({ data }) => data === true && router.replace("/admin"));
    }
  }, [status, router]);
  return status === "no-coach" ? <>{children}</> : <Waiting />;
}
