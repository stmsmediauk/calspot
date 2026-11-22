import { redirect } from "next/navigation";
import { publicCoach } from "@/components/coach-site/content";

/** Keep earlier booking links working while the request flow lives on the mini-site. */
export default async function BookingPage({
  searchParams,
}: {
  searchParams: Promise<{ lesson?: string | string[] }>;
}) {
  const selected = (await searchParams).lesson;
  const query =
    typeof selected === "string" &&
    publicCoach.lessons.some((l) => l.id === selected)
      ? `?lesson=${selected}`
      : "";
  redirect(`/kelly-jane${query}#book`);
}
