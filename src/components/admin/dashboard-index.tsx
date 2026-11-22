"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCoachWorkspace } from "@/lib/coach-workspace";

/** Opens on Requests when something needs approving, otherwise the overview. */
export function DashboardIndex() {
  const router = useRouter();
  const { bookings } = useCoachWorkspace();
  const pending = bookings.some((b) => b.status === "pending");
  useEffect(() => {
    router.replace(pending ? "/dashboard/requests" : "/dashboard/overview");
  }, [pending, router]);
  return null;
}
