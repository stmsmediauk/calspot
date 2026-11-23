import type { Metadata } from "next";
import { Landing } from "@/components/landing/landing";
import { FOUNDING_PLACES, FOUNDING_PRICE } from "@/lib/offer";
import { getFoundingOfferActive } from "@/lib/settings";

const title = "Calspot · Less admin. More court time.";
const base =
  "Your own booking page in minutes. Players pick a time, you tap approve, and the chat carries on in WhatsApp.";

/** Re-checks the founding offer setting at most once a minute (and straight away when the admin switches it). */
export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const founding = await getFoundingOfferActive();
  const description = founding
    ? `${base} Founding price of £${FOUNDING_PRICE} a month for the first ${FOUNDING_PLACES} coaches, with a 14-day free trial.`
    : `${base} £29 a month, with a 14-day free trial.`;
  return {
    title,
    description,
    alternates: { canonical: "/" },
    openGraph: { title, description, type: "website", url: "/" },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function Home() {
  return <Landing founding={await getFoundingOfferActive()} />;
}
