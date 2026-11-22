"use client";
import { createContext, useContext } from "react";
import { CoachWorkspacePreview, type CoachWorkspace } from "@/lib/coach-workspace";

type Site = {
  /** Public address of this coach's page, e.g. /your-name. "#" inside the dashboard preview. */
  basePath: string;
  slug: string | null;
  /** True on a real published page; false in the dashboard preview, where nothing is sent. */
  live: boolean;
};
const SiteContext = createContext<Site>({ basePath: "#", slug: null, live: false });
export const useSite = () => useContext(SiteContext);

/** Renders a published coach's page from server-loaded data. */
export function PublicSite({
  slug,
  workspace,
  children,
}: {
  slug: string;
  workspace: CoachWorkspace;
  children: React.ReactNode;
}) {
  return (
    <SiteContext.Provider value={{ basePath: `/${slug}`, slug, live: true }}>
      <CoachWorkspacePreview value={workspace}>{children}</CoachWorkspacePreview>
    </SiteContext.Provider>
  );
}
