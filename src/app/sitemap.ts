import type { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";
import { siteUrl } from "@/lib/site";
import { DEMO_SLUG } from "@/lib/slug";

export const revalidate = 3600;

/** The landing page, Calspot's legal pages, and every published coach page. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const entries: MetadataRoute.Sitemap = [
    { url: base, changeFrequency: "monthly", priority: 1 },
    { url: `${base}/privacy`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${base}/terms`, changeFrequency: "yearly", priority: 0.2 },
  ];
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      { auth: { persistSession: false } },
    );
    // Live pages only: published, and not paused by an ended trial.
    let slugs: string[] = [];
    const live = await supabase.rpc("live_coach_slugs");
    if (!live.error) slugs = (live.data ?? []) as string[];
    else {
      const { data } = await supabase
        .from("coaches")
        .select("slug")
        .eq("published", true);
      slugs = (data ?? []).map((c) => c.slug);
    }
    for (const slug of slugs.filter((s) => s !== DEMO_SLUG))
      entries.push({
        url: `${base}/${slug}`,
        changeFrequency: "weekly",
        priority: 0.8,
      });
  } catch {
    // The static entries are still useful if the database is unreachable.
  }
  return entries;
}
