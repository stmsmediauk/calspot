import { redirect } from "next/navigation";

/** Legacy booking links lead to the same single-page profile. */
export default async function BookingPage({
  searchParams,
}: {
  searchParams: Promise<{ lesson?: string | string[] }>;
}) {
  const selected = (await searchParams).lesson;
  const query =
    typeof selected === "string"
      ? `?lesson=${encodeURIComponent(selected)}`
      : "";
  redirect(`/kelly-jane${query}#book`);
}
