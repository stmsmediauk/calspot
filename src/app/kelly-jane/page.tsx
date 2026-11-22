import type { Metadata } from "next";
import { CoachBookingPage } from "@/components/coach-site/coach-booking-page";

export const metadata: Metadata = {
  title: "Kelly-Jane Whalley · Personal coaching & session requests",
  description:
    "A single-page coaching profile and local booking-request preview for Kelly-Jane Whalley.",
  robots: { index: false, follow: false },
};
export default async function CoachHome({
  searchParams,
}: {
  searchParams: Promise<{ lesson?: string | string[] }>;
}) {
  const selected = (await searchParams).lesson;
  return (
    <CoachBookingPage
      initialLesson={typeof selected === "string" ? selected : undefined}
    />
  );
}
