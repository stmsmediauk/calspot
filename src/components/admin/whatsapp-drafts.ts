import * as mock from "@/lib/mock-data";
import type { Booking } from "@/lib/mock-data";
import type { CoachWorkspace } from "@/lib/coach-workspace";
import { renderTemplate, waLink, waNumber } from "@/lib/whatsapp";

export type DraftKind = "confirm" | "decline" | "suggest" | "reminder";

/** The player's WhatsApp number in international form, if they gave a valid one. */
export const playerNumber = (b: Booking) =>
  b.phone ? waNumber(b.phone) : null;

/**
 * A wa.me link that opens the player's chat with the coach's template filled
 * in. The coach can still edit the message in WhatsApp before sending.
 */
export function whatsappLink(
  ws: Pick<CoachWorkspace, "profile" | "clubs" | "lessons">,
  b: Booking,
  kind: DraftKind,
  note = "",
  suggested = b.suggested,
) {
  if (!b.phone) return null;
  const text = renderTemplate(ws.profile.whatsappTemplates[kind], {
    first: b.player.split(" ")[0],
    name: b.player,
    lesson: ws.lessons.find((l) => l.id === b.lessonId)?.name ?? "lesson",
    club: ws.clubs.find((c) => c.id === b.clubId)?.name ?? "the club",
    date: mock.formatDate(b.date),
    time: mock.time(b.hour),
    suggestion: suggested
      ? `${mock.formatDate(suggested.date)} at ${mock.time(suggested.hour)}`
      : "",
    coach: ws.profile.name.split(" ")[0],
  });
  return waLink(b.phone, note.trim() ? `${text}\n\n${note.trim()}` : text);
}
