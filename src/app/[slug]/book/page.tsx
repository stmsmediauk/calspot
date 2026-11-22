import { redirect } from "next/navigation";

/** Legacy booking links lead to the same single-page profile. */
export default async function BookingPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ lesson?: string | string[] }>;
}) {
  const { slug } = await params;
  const selected = (await searchParams).lesson;
  const query =
    typeof selected === "string"
      ? `?lesson=${encodeURIComponent(selected)}`
      : "";
  redirect(`/${slug}${query}#book`);
}
