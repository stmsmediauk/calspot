import { notFound } from "next/navigation";
import { PublicSite } from "@/components/coach-site/site-context";
import { getTenantWorkspace } from "@/lib/tenant";

export default async function CoachSiteLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const workspace = await getTenantWorkspace(slug);
  if (!workspace) notFound();
  return (
    <PublicSite slug={slug} workspace={workspace}>
      {children}
    </PublicSite>
  );
}
