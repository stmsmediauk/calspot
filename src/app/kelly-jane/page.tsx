import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CoachBookingPage } from "@/components/coach-site/coach-booking-page";
import { getTenantWorkspace, pilotSlug } from "@/lib/tenant";

const firstSentence = (text: string) =>
  text.match(/^.*?[.!?](\s|$)/)?.[0].trim() ?? text.slice(0, 160);

export function generateMetadata(): Metadata {
  const tenant = getTenantWorkspace(pilotSlug);
  if (!tenant) return {};
  const { profile } = tenant;
  const title = `${profile.name} · ${profile.title}`;
  const description = firstSentence(profile.introduction);
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "profile",
      images:
        profile.photograph && profile.photograph.startsWith("/")
          ? [{ url: profile.photograph, alt: profile.name }]
          : undefined,
    },
    // Keep prototype pages out of search results until publishing exists.
    robots: { index: false, follow: false },
  };
}

export default async function CoachHome({
  searchParams,
}: {
  searchParams: Promise<{ lesson?: string | string[] }>;
}) {
  const tenant = getTenantWorkspace(pilotSlug);
  if (!tenant) notFound();
  const selected = (await searchParams).lesson;
  const { profile } = tenant;
  const structured = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: profile.name,
    jobTitle: profile.title,
    description: profile.introduction,
    ...(profile.instagram
      ? { sameAs: [`https://www.instagram.com/${profile.instagram}/`] }
      : {}),
  };
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structured) }}
      />
      <CoachBookingPage
        initialLesson={typeof selected === "string" ? selected : undefined}
      />
    </>
  );
}
