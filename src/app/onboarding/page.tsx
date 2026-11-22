import type { Metadata } from "next";
import { RequireAccount } from "@/components/require-coach";
import { SignupWizard } from "@/components/signup/signup-wizard";

export const metadata: Metadata = {
  title: "Calspot · Build your coaching page",
  robots: { index: false, follow: false },
};
export default function OnboardingPage() {
  return (
    <RequireAccount>
      <SignupWizard />
    </RequireAccount>
  );
}
