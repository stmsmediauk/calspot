export type Club = {
  id: string;
  name: string;
  address: string;
  notes: string;
  active: boolean;
  /** The club's Playtomic page. Opened by a button so the coach can check courts. */
  playtomicUrl?: string;
};
export type Lesson = {
  id: string;
  name: string;
  duration: number;
  /** Guide price per person. */
  price: number;
  /** Players per session: 1 private, 2 duo, 4 small group, 12 americano. */
  capacity: number;
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
  /** Spaces this request takes in a group session (default 1). */
  spaces?: number;
  message: string;
  /** Player phone in international format (fictional Ofcom drama range). */
  phone?: string;
  /** Date the request arrived, for "requested 2 days ago". */
  requestedAt?: string;
  /** Note the coach added when deciding. */
  reply?: string;
  /** Length in minutes, set on the public page where the lesson itself may be hidden. */
  minutes?: number;
  /** Another time the coach offered when declining. */
  suggested?: { date: string; hour: number };
  /** The coach's own tick that they have booked the court. Calspot does not check it. */
  courtBooked?: boolean;
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
/** Today's date (YYYY-MM-DD) in UK time. A function so long-running servers never go stale. */
export const today = () =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/London" }).format(
    new Date(),
  );
/** Monday of the current UK week. */
export const thisWeekStart = () => {
  const d = parseDate(today());
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  return dateKey(d);
};
/** The current UK clock time as decimal hours, e.g. 14.5 for 14:30. */
export const londonHour = () => {
  const [h, m] = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/London",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  })
    .format(new Date())
    .split(":")
    .map(Number);
  return h + m / 60;
};
export const lessonName = (list: Lesson[], id: string) =>
  id === "all"
    ? "All lessons"
    : (list.find((l) => l.id === id)?.name ?? "Lesson");
export function daysAgo(key: string, from = today()) {
  const diff = Math.round(
    (parseDate(from).getTime() - parseDate(key).getTime()) / 864e5,
  );
  return diff <= 0 ? "today" : diff === 1 ? "yesterday" : `${diff} days ago`;
}
