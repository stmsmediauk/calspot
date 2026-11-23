"use client";
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import styles from "./install-tip.module.css";

const KEY = "calspot:install-tip-dismissed";

/**
 * A one-time tip on phones: add Calspot to the home screen so it opens like an
 * app. Hidden once dismissed, once installed, and on wider screens.
 */
export function InstallTip() {
  const [kind, setKind] = useState<"ios" | "android" | null>(null);

  useEffect(() => {
    try {
      if (localStorage.getItem(KEY)) return;
    } catch {
      /* private mode: just show it */
    }
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as Navigator & { standalone?: boolean }).standalone === true;
    if (standalone) return;
    const ua = navigator.userAgent;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- needs the browser, so it can't run during render
    setKind(/iPhone|iPad|iPod/.test(ua) ? "ios" : "android");
  }, []);

  if (!kind) return null;
  const dismiss = () => {
    try {
      localStorage.setItem(KEY, "1");
    } catch {
      /* ignore */
    }
    setKind(null);
  };
  return (
    <aside className={styles.tip} aria-label="Add Calspot to your home screen">
      <div>
        <strong>Add Calspot to your home screen</strong>
        <p>
          {kind === "ios"
            ? "In Safari, tap the Share button, then “Add to Home Screen”. It opens like an app, ready for new requests."
            : "In Chrome, tap the ⋮ menu, then “Add to Home screen” or “Install app”. It opens like an app, ready for new requests."}
        </p>
      </div>
      <button type="button" onClick={dismiss} aria-label="Dismiss this tip">
        <X size={18} aria-hidden="true" />
      </button>
    </aside>
  );
}
