import type { Metadata } from "next";
import { CoachBookingPage } from "@/components/coach-site/coach-booking-page";
import { getTenantWorkspace } from "@/lib/tenant";

const firstSentence = (text: string) =>
  text.match(/^.*?[.!?](\s|$)/)?.[0].trim() ?? text.slice(0, 160);

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const tenant = await getTenantWorkspace((await params).slug);
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
      images: profile.photograph
        ? [{ url: profile.photograph, alt: profile.name }]
        : undefined,
    },
    // Not searchable yet; switch this on when pages are ready for discovery.
    robots: { index: false, follow: false },
  };
}

export default async function CoachHome({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ lesson?: string | string[] }>;
}) {
  const tenant = await getTenantWorkspace((await params).slug);
  const selected = (await searchParams).lesson;
  const profile = tenant?.profile;
  const structured = profile && {
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
      {structured && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structured).replace(/</g, "\\u003c"),
          }}
        />
      )}
      <CoachBookingPage
        initialLesson={typeof selected === "string" ? selected : undefined}
      />
    </>
  );
}
