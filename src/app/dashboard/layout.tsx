import type { Metadata } from "next";
import { RequireCoach } from "@/components/require-coach";
import { AdminShell } from "@/components/admin/shell";

export const metadata: Metadata = {
  title: "Calspot · Coach dashboard",
  robots: { index: false, follow: false },
  // Lets a coach add the dashboard to their iPhone or Android home screen as an app.
  appleWebApp: { capable: true, title: "Calspot" },
};
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RequireCoach>
      <AdminShell>{children}</AdminShell>
    </RequireCoach>
  );
}
