import type { Metadata } from "next";
import { CalspotLegal, terms } from "@/components/legal/calspot-legal";

export const metadata: Metadata = {
  title: "Terms of use · Calspot",
  description: "The terms for using Calspot, the booking page for coaches.",
  alternates: { canonical: "/terms" },
};
export default function Page() {
  return <CalspotLegal title="Terms of use" sections={terms} />;
}
