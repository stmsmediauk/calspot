"use client";

import { MessageCircle } from "lucide-react";
import { hasWhatsApp, useCoachWorkspace } from "@/lib/coach-workspace";
import { waLink } from "@/lib/whatsapp";
import styles from "./site.module.css";

/**
 * Opens the coach's WhatsApp with a prefilled message. Shown only when the
 * coach has supplied a valid number. WhatsApp opens in the visitor's own app,
 * and nothing is sent until they press Send.
 */
export function WhatsAppButton({
  message: suppliedMessage,
  label = "Message on WhatsApp",
  variant = "ghost",
}: {
  message?: string;
  label?: string;
  variant?: "ghost" | "solid";
}) {
  const { profile } = useCoachWorkspace();
  const shortName = profile.name.split(" ")[0];
  const message =
    suppliedMessage ??
    `Hi ${shortName}, I’m interested in coaching. Could you help me choose a session?`;
  if (!hasWhatsApp(profile.whatsapp)) return null;
  const href = waLink(profile.whatsapp, message);
  if (!href) return null;
  return (
    <a
      className={`${styles.whatsappButton} ${variant === "solid" ? styles.whatsappSolid : ""}`}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
    >
      <MessageCircle size={18} aria-hidden="true" />
      {label}
      <span className={styles.srOnly}> (opens WhatsApp in a new tab)</span>
    </a>
  );
}
