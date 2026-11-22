"use client";

import { useRef, useState } from "react";
import { MessageCircle, X, Copy, Check } from "lucide-react";
import styles from "./site.module.css";

/** Local preview only: no phone number, external links or messaging service. */
export function WhatsAppButton({
  message = "Hi Kelly-Jane, I’m interested in padel coaching. Could you help me choose a session?",
  label = "Ask on WhatsApp",
}: {
  message?: string;
  label?: string;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const draft = useRef<HTMLTextAreaElement>(null);
  const [copyStatus, setCopyStatus] = useState("");

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
        <h2>A quick hello to Kelly-Jane.</h2>
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
          Kelly-Jane’s WhatsApp number hasn’t been added. This preview won’t
          open a chat or send a message. A message does not confirm a lesson or
          reserve a court.
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
