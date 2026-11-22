import type { Metadata } from "next";
import { CoachBookingPage } from "@/components/coach-site/coach-booking-page";

/** Generic until tenant data comes from the database, so no coach's details are baked into the page. */
export const metadata: Metadata = {
  title: "Coach page · Calspot",
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
