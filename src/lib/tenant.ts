import { cache } from "react";
import { createClient } from "@supabase/supabase-js";
import { loadPublicCoach } from "./workspace-db";
import type { CoachWorkspace } from "./workspace-model";

/**
 * Server-side lookup of a published coach's page data. Uses the public
 * (anonymous) key, so row-level security decides what is visible: only
 * published coaches, their active clubs and lessons, and availability.
 */
export const getTenantWorkspace = cache(
  async (slug: string): Promise<CoachWorkspace | null> => {
    if (!/^[a-z0-9][a-z0-9-]{1,38}[a-z0-9]$/.test(slug)) return null;
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      { auth: { persistSession: false } },
    );
    try {
      return (await loadPublicCoach(supabase, slug))?.workspace ?? null;
    } catch {
      return null;
    }
  },
);
