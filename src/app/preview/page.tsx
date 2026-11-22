"use client";
import { useEffect, useState } from "react";
import { CoachBookingPage } from "@/components/coach-site/coach-booking-page";
import {
  CoachWorkspacePreview,
  parseWorkspace,
  type CoachWorkspace,
} from "@/lib/coach-workspace";

/**
 * Embedded by the dashboard's live preview. Receives the unsaved draft from
 * its parent window (same origin only) and renders the public page from it.
 */
export default function PreviewPage() {
  const [workspace, setWorkspace] = useState<CoachWorkspace | null>(null);
  useEffect(() => {
    const listen = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      const data = event.data;
      if (data?.type === "calspot:workspace" && typeof data.raw === "string") {
        const parsed = parseWorkspace(data.raw);
        if (parsed) setWorkspace(parsed);
      }
    };
    window.addEventListener("message", listen);
    window.parent.postMessage({ type: "calspot:ready" }, window.location.origin);
    return () => window.removeEventListener("message", listen);
  }, []);
  return (
    <CoachWorkspacePreview value={workspace}>
      <CoachBookingPage embed />
    </CoachWorkspacePreview>
  );
}
