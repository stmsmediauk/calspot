import { platform } from "./platform";
import { defaultWorkspace, type CoachWorkspace } from "./workspace-model";

/**
 * Server-side lookup of a coach's published data. This is the seam where
 * Supabase will plug in (resolve the tenant from the hostname, then read its
 * profile, clubs and lessons). For now only the pilot coach exists, so it
 * returns the bundled demo workspace. Edits made in the dashboard live in the
 * browser tab's session storage and are not visible to the server.
 */
export function getTenantWorkspace(slug: string): CoachWorkspace | null {
  return `/${slug}` === platform.publicBasePath ? defaultWorkspace : null;
}
export const pilotSlug = platform.publicBasePath.slice(1);
