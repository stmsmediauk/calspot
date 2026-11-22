import { RequireCoach } from "@/components/require-coach";

export default function CoachSiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <RequireCoach>{children}</RequireCoach>;
}
