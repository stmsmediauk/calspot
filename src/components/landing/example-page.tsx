"use client";
import { useEffect, useState } from "react";
import { CoachBookingPage } from "@/components/coach-site/coach-booking-page";
import { CoachWorkspacePreview } from "@/lib/coach-workspace";
import { getExample, withName } from "@/lib/example-coaches";

/**
 * An example coach page for the landing page's showcase. The parent window
 * (same origin only) sends the visitor's name, which replaces the placeholder.
 */
export function ExamplePage({ id }: { id: string }) {
  const example = getExample(id);
  const [name, setName] = useState("");
  useEffect(() => {
    const listen = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      const data = event.data;
      if (data?.type === "calspot:example-name" && typeof data.name === "string")
        setName(data.name);
    };
    window.addEventListener("message", listen);
    window.parent.postMessage(
      { type: "calspot:example-ready" },
      window.location.origin,
    );
    return () => window.removeEventListener("message", listen);
  }, []);
  if (!example) return null;
  return (
    <CoachWorkspacePreview value={withName(example.workspace, name)}>
      <CoachBookingPage />
    </CoachWorkspacePreview>
  );
}
