import type { Metadata } from "next";
import { RequireCoach } from "@/components/require-coach";
import { AdminShell } from "@/components/admin/shell";

export const metadata: Metadata = {
  title: "Calspot · Coach dashboard",
  robots: { index: false, follow: false },
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
