import type { Metadata } from "next";
import { PlatformAdmin } from "@/components/platform/platform-admin";

export const metadata: Metadata = {
  title: "Calspot · Platform admin",
  robots: { index: false, follow: false },
};
export default function AdminPage() {
  return <PlatformAdmin />;
}
