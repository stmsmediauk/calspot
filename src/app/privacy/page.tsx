import type { Metadata } from "next";
import { CalspotLegal, privacy } from "@/components/legal/calspot-legal";

export const metadata: Metadata = {
  title: "Privacy notice · Calspot",
  description: "How Calspot handles coaches’ and players’ personal data.",
  alternates: { canonical: "/privacy" },
};
export default function Page() {
  return <CalspotLegal title="Privacy notice" sections={privacy} />;
}
