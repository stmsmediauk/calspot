import type { Metadata } from "next";
import { LegalPage } from "@/components/coach-site/legal-page";

export const metadata: Metadata = {
  title: "Privacy notice",
  robots: { index: false, follow: false },
};
export default function Page() {
  return <LegalPage kind="privacy" />;
}
