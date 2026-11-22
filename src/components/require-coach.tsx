"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useHasCoach } from "@/lib/coach-workspace";

/** Sends a visitor with no coach set up to sign-up instead of showing sample data. */
export function RequireCoach({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const hasCoach = useHasCoach();
  useEffect(() => {
    if (hasCoach === false) router.replace("/signup");
  }, [hasCoach, router]);
  return hasCoach ? <>{children}</> : null;
}
