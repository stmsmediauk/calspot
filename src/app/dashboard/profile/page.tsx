import { ProfileEditor } from "@/components/profile/profile-editor";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string | string[] }>;
}) {
  const tab = (await searchParams).tab;
  return <ProfileEditor initialTab={typeof tab === "string" ? tab : undefined} />;
}
