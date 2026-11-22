import type { Metadata } from "next";
import { Landing } from "@/components/landing/landing";

const title = "Calspot · Less admin. More court time.";
const description =
  "Your own booking page in minutes. Players pick a time, you tap approve, and the chat carries on in WhatsApp. £29 a month, with a 14-day free trial.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/" },
  openGraph: { title, description, type: "website", url: "/" },
  twitter: { card: "summary_large_image", title, description },
};

export default function Home() {
  return <Landing />;
}
