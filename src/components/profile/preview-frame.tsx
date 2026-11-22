"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import type { CoachWorkspace } from "@/lib/coach-workspace";

const DESKTOP_WIDTH = 1280;
const PHONE_WIDTH = 390;

/**
 * Renders the real public page in a same-origin iframe and streams the
 * unsaved draft to it with postMessage. The page keeps its own viewport, so
 * media queries and fluid type behave exactly as they will for players.
 */
function useDraftStream(
  workspace: CoachWorkspace,
  frame: React.RefObject<HTMLIFrameElement | null>,
) {
  const ready = useRef(false);
  const send = useCallback(() => {
    if (!ready.current) return;
    frame.current?.contentWindow?.postMessage(
      { type: "calspot:workspace", raw: JSON.stringify(workspace) },
      window.location.origin,
    );
  }, [workspace, frame]);
  useEffect(() => {
    const timer = setTimeout(send, 120);
    return () => clearTimeout(timer);
  }, [send]);
  useEffect(() => {
    const listen = (event: MessageEvent) => {
      if (
        event.origin !== window.location.origin ||
        event.source !== frame.current?.contentWindow ||
        event.data?.type !== "calspot:ready"
      )
        return;
      ready.current = true;
      send();
    };
    window.addEventListener("message", listen);
    return () => window.removeEventListener("message", listen);
  }, [send, frame]);
  return () => {
    ready.current = true;
    send();
  };
}

export function PreviewFrame({
  workspace,
  device,
}: {
  workspace: CoachWorkspace;
  device: "desktop" | "phone";
}) {
  const frame = useRef<HTMLIFrameElement>(null);
  const box = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(560);
  const onLoad = useDraftStream(workspace, frame);
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) =>
      setWidth(entry.contentRect.width),
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  const frameWidth = device === "desktop" ? DESKTOP_WIDTH : PHONE_WIDTH;
  const scale = Math.min(1, width / frameWidth);
  return (
    <div className="preview-box" ref={box}>
      <div
        className={`preview-device ${device}`}
        style={{ width: frameWidth * scale }}
      >
        <iframe
          ref={frame}
          title="Booking page preview"
          src="/preview"
          onLoad={onLoad}
          style={{
            width: frameWidth,
            height: `calc((100vh - 170px) / ${scale})`,
            transform: `scale(${scale})`,
          }}
        />
      </div>
    </div>
  );
}

/** Full-screen preview for narrow screens, at the device's real width. */
export function PreviewSheet({
  workspace,
  onClose,
}: {
  workspace: CoachWorkspace;
  onClose: () => void;
}) {
  const frame = useRef<HTMLIFrameElement>(null);
  const onLoad = useDraftStream(workspace, frame);
  useEffect(() => {
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = overflow;
    };
  }, []);
  return (
    <div
      className="preview-sheet"
      role="dialog"
      aria-modal="true"
      aria-label="Booking page preview"
      onKeyDown={(e) => e.key === "Escape" && onClose()}
    >
      <header>
        <strong>Preview</strong>
        <button
          type="button"
          className="icon-button"
          autoFocus
          aria-label="Close preview"
          onClick={onClose}
        >
          <X size={20} />
        </button>
      </header>
      <iframe ref={frame} title="Booking page preview" src="/preview" onLoad={onLoad} />
    </div>
  );
}
