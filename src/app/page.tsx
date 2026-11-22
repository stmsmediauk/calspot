import type { Metadata } from "next";
import { Landing } from "@/components/landing/landing";

const description =
  "Your coaching. All in one spot. A personal booking page for coaches: players request a time, you approve it, and the conversation carries on in WhatsApp. £29.99 a month.";

export const metadata: Metadata = {
  title: "Calspot · Your coaching. All in one spot.",
  description,
  openGraph: {
    title: "Calspot · Your coaching. All in one spot.",
    description,
    type: "website",
  },
};

export default function Home() {
  return <Landing />;
}
