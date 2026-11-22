export type Club = {
  id: string;
  name: string;
  address: string;
  notes: string;
  active: boolean;
};
export type Lesson = {
  id: string;
  name: string;
  duration: number;
  price: number;
  description: string;
  active: boolean;
};
export type Booking = {
  id: string;
  player: string;
  email: string;
  lessonId: string;
  clubId: string;
  date: string;
  hour: number;
  status: "pending" | "confirmed" | "declined" | "cancelled";
  message: string;
  /** Player phone in international format (fictional Ofcom drama range). */
  phone?: string;
  /** Date the request arrived, for "requested 2 days ago". */
  requestedAt?: string;
  /** Note the coach added when deciding. */
  reply?: string;
  /** Another time the coach offered when declining. */
  suggested?: { date: string; hour: number };
};
export type Rule = {
  id: string;
  day: number;
  clubId: string;
  /** A lesson id, or "all" for every active lesson. */
  lessonId: string;
  start: number;
  end: number;
  effectiveStart: string;
  effectiveEnd: string;
};
export type Exception = {
  id: string;
  date: string;
  kind: "blocked" | "extra";
  clubId: string;
  lessonId: string;
  start: number;
  end: number;
};
export const dateKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
export const parseDate = (value: string) => new Date(`${value}T12:00:00`);
export const formatDate = (value: string) =>
  parseDate(value).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
export const time = (hour: number) =>
  `${String(Math.floor(hour)).padStart(2, "0")}:${hour % 1 ? "30" : "00"}`;
/** The prototype's fixed "today", so sample data stays consistent. */
export const demoToday = "2026-11-22";
export const demoWeek = "2026-11-23";
export const lessonName = (list: Lesson[], id: string) =>
  id === "all"
    ? "All lessons"
    : (list.find((l) => l.id === id)?.name ?? "Lesson");
export function daysAgo(key: string, from = demoToday) {
  const diff = Math.round(
    (parseDate(from).getTime() - parseDate(key).getTime()) / 864e5,
  );
  return diff <= 0 ? "today" : diff === 1 ? "yesterday" : `${diff} days ago`;
}
