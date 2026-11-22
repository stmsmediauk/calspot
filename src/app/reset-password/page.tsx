import type { Metadata } from "next";
import { ResetPasswordForm } from "@/components/auth/password-forms";

export const metadata: Metadata = {
  title: "Calspot · Choose a new password",
  robots: { index: false, follow: false },
};
export default function ResetPasswordPage() {
  return <ResetPasswordForm />;
}
