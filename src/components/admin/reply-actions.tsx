"use client";
import { useMemo, useState } from "react";
import { Check, TriangleAlert } from "lucide-react";
import { startTimes } from "@/lib/availability";
import { useCoachWorkspace } from "@/lib/coach-workspace";
import * as mock from "@/lib/mock-data";
import type { Booking } from "@/lib/mock-data";
import { MessageCircle } from "lucide-react";
import { useAdmin } from "./context";
import { playerNumber, whatsappLink } from "./whatsapp-drafts";

/** Other times this player could take, from the coach's own availability. */
function useSuggestions(b: Booking) {
  const { lessons, rules, exceptions, bookings } = useCoachWorkspace();
  return useMemo(() => {
    const lesson = lessons.find((l) => l.id === b.lessonId);
    if (!lesson) return [];
    const options: { date: string; hour: number }[] = [];
    for (let i = 1; i < 15 && options.length < 6; i++) {
      const d = mock.parseDate(mock.today());
      d.setDate(d.getDate() + i);
      const date = mock.dateKey(d);
      for (const hour of startTimes({
        date,
        rules,
        exceptions,
        bookings: bookings.filter((x) => x.id !== b.id),
        lessons,
        lesson,
        clubId: b.clubId,
      }))
        if (!(date === b.date && hour === b.hour) && options.length < 6)
          options.push({ date, hour });
    }
    return options;
  }, [b, lessons, rules, exceptions, bookings]);
}

/** Overlap with a confirmed session, if approving would double-book the coach. */
export function useClash(b: Booking) {
  const { lessons, bookings } = useCoachWorkspace();
  const length = (id: string) =>
    (lessons.find((l) => l.id === id)?.duration ?? 60) / 60;
  return b.status === "pending"
    ? bookings.find(
        (o) =>
          o.id !== b.id &&
          o.status === "confirmed" &&
          o.date === b.date &&
          b.hour < o.hour + length(o.lessonId) &&
          o.hour < b.hour + length(b.lessonId),
      )
    : undefined;
}

export function ReplyActions({ b }: { b: Booking }) {
  const { decide } = useAdmin();
  const workspace = useCoachWorkspace();
  const suggestions = useSuggestions(b);
  const clash = useClash(b);
  const [note, setNote] = useState("");
  const [pick, setPick] = useState("");
  const [message, setMessage] = useState(true);
  const chosen = suggestions.find((s) => `${s.date}@${s.hour}` === pick);
  const first = b.player.split(" ")[0];
  const canMessage = !!playerNumber(b);
  /** Opens the WhatsApp draft inside the click, then records the decision. */
  const act = (
    status: "confirmed" | "declined",
    kind: "confirm" | "decline" | "suggest",
  ) => {
    if (canMessage && message) {
      const url = whatsappLink(workspace, b, kind, note, chosen);
      if (url) window.open(url, "_blank", "noopener,noreferrer");
    }
    decide(b.id, status, {
      ...(note.trim() ? { reply: note.trim() } : {}),
      ...(status === "declined" && chosen ? { suggested: chosen } : {}),
    });
  };
  return (
    <div className="reply-actions">
      {clash && (
        <p className="clash" role="note">
          <TriangleAlert size={15} aria-hidden="true" />
          Overlaps {clash.player} at {mock.time(clash.hour)}. Approving would
          double-book you.
        </p>
      )}
      <label className="reply-field">
        Can’t make it? Suggest another time <span>(optional)</span>
        <select value={pick} onChange={(e) => setPick(e.target.value)}>
          <option value="">No suggestion</option>
          {suggestions.map((s) => (
            <option key={`${s.date}@${s.hour}`} value={`${s.date}@${s.hour}`}>
              {mock.formatDate(s.date)} · {mock.time(s.hour)}
            </option>
          ))}
        </select>
      </label>
      <label className="reply-field">
        Add a personal line <span>(optional)</span>
        <textarea
          rows={2}
          maxLength={300}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder={`e.g. Bring a spare grip, ${first}.`}
        />
      </label>
      {canMessage ? (
        <label className="check-line">
          <input
            type="checkbox"
            checked={message}
            onChange={(e) => setMessage(e.target.checked)}
          />
          <span>
            <MessageCircle size={15} aria-hidden="true" /> Open WhatsApp with a
            draft message to {first} ({b.phone})
          </span>
        </label>
      ) : (
        <p className="hint-line">
          {first} didn’t give a phone number, so there is no WhatsApp draft.
        </p>
      )}
      <div className="row">
        <button
          className="button"
          disabled={!!chosen}
          title={
            chosen
              ? "Clear the suggested time to approve this request"
              : undefined
          }
          onClick={() => act("confirmed", "confirm")}
        >
          <Check size={15} aria-hidden="true" /> Approve
        </button>
        <button
          className="button secondary"
          onClick={() => act("declined", chosen ? "suggest" : "decline")}
        >
          {chosen ? "Decline and suggest time" : "Decline"}
        </button>
      </div>
    </div>
  );
}

/** One-tap WhatsApp drafts for a request that has already been decided. */
export function WhatsAppFollowUps({ b }: { b: Booking }) {
  const workspace = useCoachWorkspace();
  const first = b.player.split(" ")[0];
  if (!playerNumber(b)) return null;
  const links: { label: string; href: string | null }[] =
    b.status === "confirmed"
      ? [
          {
            label: `Send ${first} a reminder`,
            href: whatsappLink(workspace, b, "reminder"),
          },
          {
            label: "Resend confirmation",
            href: whatsappLink(workspace, b, "confirm"),
          },
        ]
      : b.status === "declined"
        ? [
            {
              label: b.suggested
                ? `Message ${first} your suggestion`
                : `Message ${first}`,
              href: whatsappLink(
                workspace,
                b,
                b.suggested ? "suggest" : "decline",
              ),
            },
          ]
        : [];
  const usable = links.filter((l) => l.href);
  if (!usable.length) return null;
  return (
    <div className="row wa-followups">
      {usable.map((l) => (
        <a
          key={l.label}
          className="button secondary small"
          href={l.href!}
          target="_blank"
          rel="noopener noreferrer"
        >
          <MessageCircle size={14} aria-hidden="true" /> {l.label}
          <span className="sr-only"> (opens WhatsApp in a new tab)</span>
        </a>
      ))}
    </div>
  );
}
