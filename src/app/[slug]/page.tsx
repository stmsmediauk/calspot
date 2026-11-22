import type { Metadata } from "next";
import { CoachBookingPage } from "@/components/coach-site/coach-booking-page";
import { siteUrl } from "@/lib/site";
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
  const where = profile.location ? ` in ${profile.location}` : "";
  const title = `${profile.name} · ${profile.title}${where}`;
  const description =
    profile.tagline.trim() ||
    firstSentence(profile.introduction) ||
    `Request a lesson with ${profile.name}.`;
  const url = `/${(await params).slug}`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: "profile",
      siteName: "Calspot",
      locale: "en_GB",
    },
    twitter: { card: "summary_large_image", title, description },
    robots: { index: true, follow: true },
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
  const slug = (await params).slug;
  const base = siteUrl();
  const lessons = tenant?.lessons.filter((l) => l.active) ?? [];
  const structured = profile && {
    "@context": "https://schema.org",
    "@type": "Person",
    name: profile.name,
    jobTitle: profile.title,
    description: profile.introduction,
    url: `${base}/${slug}`,
    ...(profile.photograph?.startsWith("http")
      ? { image: profile.photograph }
      : {}),
    ...(profile.location
      ? { workLocation: { "@type": "Place", name: profile.location } }
      : {}),
    ...(profile.instagram
      ? { sameAs: [`https://www.instagram.com/${profile.instagram}/`] }
      : {}),
    ...(lessons.length
      ? {
          makesOffer: lessons.map((l) => ({
            "@type": "Offer",
            priceCurrency: "GBP",
            price: l.price,
            itemOffered: {
              "@type": "Service",
              name: l.name,
              description: l.description,
              provider: { "@type": "Person", name: profile.name },
            },
          })),
        }
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
