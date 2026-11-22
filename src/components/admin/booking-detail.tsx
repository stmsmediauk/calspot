"use client";
import { useCoachWorkspace } from "@/lib/coach-workspace";
import { RequestDetail } from "./request-detail";

export function BookingDetail({ id }: { id: string }) {
  const { bookings } = useCoachWorkspace();
  const b = bookings.find((x) => x.id === id);
  if (!b) return <p>This request is no longer available.</p>;
  return <RequestDetail b={b} />;
}
