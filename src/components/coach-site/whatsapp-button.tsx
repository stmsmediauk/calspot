"use client";

import { useRef, useState } from "react";
import { MessageCircle, X, Copy, Check } from "lucide-react";
import { hasWhatsApp, useCoachWorkspace } from "@/lib/coach-workspace";
import styles from "./site.module.css";

/** Only configured coach numbers can display this local, unsent message preview. */
export function WhatsAppButton({
  message: suppliedMessage,
  label = "Ask on WhatsApp",
}: {
  message?: string;
  label?: string;
}) {
  const { profile } = useCoachWorkspace();
  const shortName = profile.name.split(" ")[0];
  const message =
    suppliedMessage ??
    `Hi ${shortName}, I’m interested in coaching. Could you help me choose a session?`;
  const dialog = useRef<HTMLDialogElement>(null);
  const draft = useRef<HTMLTextAreaElement>(null);
  const [copyStatus, setCopyStatus] = useState("");

  if (!hasWhatsApp(profile.whatsapp)) return null;
  return (
    <>
      <button
        type="button"
        className={styles.whatsappButton}
        onClick={() => {
          setCopyStatus("");
          dialog.current?.showModal();
        }}
      >
        <MessageCircle size={18} aria-hidden="true" />
        {label}
      </button>
      <dialog
        ref={dialog}
        className={styles.whatsappDialog}
        aria-label="WhatsApp message preview"
        onClick={(event) => {
          if (event.target === event.currentTarget) {
            const rect = event.currentTarget.getBoundingClientRect();
            if (
              event.clientX < rect.left ||
              event.clientX > rect.right ||
              event.clientY < rect.top ||
              event.clientY > rect.bottom
            )
              dialog.current?.close();
          }
        }}
      >
        <div className={styles.dialogHeader}>
          <span className={styles.whatsappIcon}>
            <MessageCircle size={23} />
          </span>
          <form method="dialog">
            <button type="submit" aria-label="Close WhatsApp preview">
              <X size={20} />
            </button>
          </form>
        </div>
        <span className={styles.eyebrow}>WHATSAPP · DEMO PREVIEW</span>
        <h2>A quick hello to {shortName}.</h2>
        <p>Here’s how your message could look.</p>
        <label className={styles.formLabel}>
          Message draft
          <textarea
            ref={draft}
            aria-label="Message draft"
            readOnly
            rows={5}
            value={message}
          />
        </label>
        <p className={styles.formNote}>
          Demo draft for {profile.whatsapp}. This preview won’t open a chat or
          send a message. A message does not confirm a lesson or reserve a
          court.
        </p>
        <div className={styles.dialogActions}>
          <button
            type="button"
            className={styles.secondary}
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(message);
                setCopyStatus("Message draft copied.");
              } catch {
                draft.current?.focus();
                draft.current?.select();
                setCopyStatus("Select and copy the message draft above.");
              }
            }}
          >
            {copyStatus === "Message draft copied." ? (
              <Check size={16} />
            ) : (
              <Copy size={16} />
            )}
            Copy draft
          </button>
          <form method="dialog">
            <button className={styles.primary}>Done</button>
          </form>
        </div>
        <div className={styles.copyStatus} role="status">
          {copyStatus}
        </div>
      </dialog>
    </>
  );
}
