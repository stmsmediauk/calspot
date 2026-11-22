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
      const coach = await loadPublicCoach(supabase, slug);
      if (!coach) return null;
      // A coach whose trial has ended is paused. Ignore a missing function so
      // pages keep working until the trial SQL has been run.
      const { data: live, error } = await supabase.rpc("coach_is_live", {
        p_slug: slug,
      });
      if (!error && live === false) return null;
      return coach.workspace;
    } catch {
      return null;
    }
  },
);
