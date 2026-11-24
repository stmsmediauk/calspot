import { platform } from "./platform";

export type FeedRow = {
  booking_id: string;
  coach_name: string | null;
  first_name: string;
  lesson_name: string;
  duration: number;
  club_name: string;
  club_address: string | null;
  date: string;
  hour: number | string;
  spaces: number;
  court_booked: boolean;
};

/** Minutes the zone is ahead of UTC at the given instant. */
function offsetMinutes(at: number, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).formatToParts(new Date(at));
  const get = (type: string) =>
    Number(parts.find((p) => p.type === type)?.value);
  const local = Date.UTC(
    get("year"),
    get("month") - 1,
    get("day"),
    get("hour"),
    get("minute"),
  );
  return Math.round((local - Math.floor(at / 60000) * 60000) / 60000);
}

/** A local date and hour in the platform time zone, as a UTC timestamp in ms. */
export function localToUtc(date: string, hour: number, timeZone = platform.timeZone) {
  const [y, m, d] = date.split("-").map(Number);
  const guess = Date.UTC(y, m - 1, d, Math.floor(hour), Math.round((hour % 1) * 60));
  const first = guess - offsetMinutes(guess, timeZone) * 60000;
  // The offset can differ at the corrected instant around a clock change.
  return guess - offsetMinutes(first, timeZone) * 60000;
}

const stamp = (ms: number) =>
  new Date(ms).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

const escapeText = (value: string) =>
  value
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");

/** Folds a line to 75 characters, as calendar apps expect. */
const fold = (line: string) => {
  const out: string[] = [];
  let rest = line;
  while (rest.length > 75) {
    out.push(rest.slice(0, 75));
    rest = ` ${rest.slice(75)}`;
  }
  out.push(rest);
  return out.join("\r\n");
};

/** An iCalendar feed of confirmed sessions. Contains first names only. */
export function buildCalendar(rows: FeedRow[], now = Date.now()) {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Calspot//Coaching sessions//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${escapeText("Calspot coaching")}`,
    "REFRESH-INTERVAL;VALUE=DURATION:PT1H",
    "X-PUBLISHED-TTL:PT1H",
  ];
  for (const r of rows) {
    const start = localToUtc(r.date, Number(r.hour));
    const end = start + r.duration * 60000;
    const who = r.spaces > 1 ? `${r.first_name} (${r.spaces} spaces)` : r.first_name;
    const details = [
      `Player: ${who}`,
      r.court_booked ? "Court booked" : "Court not yet marked as booked",
      "Booked through Calspot. Calspot does not confirm court availability.",
    ];
    lines.push(
      "BEGIN:VEVENT",
      `UID:${r.booking_id}@calspot`,
      `DTSTAMP:${stamp(now)}`,
      `DTSTART:${stamp(start)}`,
      `DTEND:${stamp(end)}`,
      `SUMMARY:${escapeText(`${r.lesson_name} · ${r.first_name}`)}`,
      `LOCATION:${escapeText([r.club_name, r.club_address].filter(Boolean).join(", "))}`,
      `DESCRIPTION:${escapeText(details.join("\n"))}`,
      "STATUS:CONFIRMED",
      "END:VEVENT",
    );
  }
  lines.push("END:VCALENDAR");
  return `${lines.map(fold).join("\r\n")}\r\n`;
}
