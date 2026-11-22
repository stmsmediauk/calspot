/** Real pilot coach identity supplied by the project owner; session fixtures below are fictional. */
export const coachProfile = {
  name: "Kelly-Jane Whalley",
  initials: "KJW",
  workspaceLabel: "Pilot coach workspace",
};

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
};
export type Rule = {
  id: string;
  day: number;
  clubId: string;
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
export const clubs: Club[] = [
  {
    id: "c1",
    name: "The Padel Yard",
    address: "2 Armoury Way, London SW18 1SH",
    notes: "Outdoor courts · Meet at reception",
    active: true,
  },
  {
    id: "c2",
    name: "Riverside Padel Club",
    address: "18 Riverside Road, London SW15 2NP",
    notes: "Indoor courts · Parking available",
    active: true,
  },
];
export const lessons: Lesson[] = [
  {
    id: "l1",
    name: "Private coaching",
    duration: 60,
    price: 65,
    description: "One-to-one time to focus on your game.",
    active: true,
  },
  {
    id: "l2",
    name: "Duo session",
    duration: 60,
    price: 80,
    description: "Build your partnership, together.",
    active: true,
  },
  {
    id: "l3",
    name: "Group coaching",
    duration: 90,
    price: 100,
    description: "Tactics and match play for up to four players.",
    active: true,
  },
];
export const bookings: Booking[] = [
  {
    id: "b1",
    player: "Oliver James",
    email: "oliver@example.com",
    lessonId: "l1",
    clubId: "c1",
    date: "2026-11-23",
    hour: 9,
    status: "confirmed",
    message: "Looking forward to working on my volley.",
  },
  {
    id: "b2",
    player: "Sophie & Ben",
    email: "sophie@example.com",
    lessonId: "l2",
    clubId: "c1",
    date: "2026-11-23",
    hour: 12,
    status: "confirmed",
    message: "We have both been playing for six months.",
  },
  {
    id: "b3",
    player: "Emma Wilson",
    email: "emma@example.com",
    lessonId: "l1",
    clubId: "c2",
    date: "2026-11-24",
    hour: 10,
    status: "pending",
    message: "I’m an intermediate player and would love to improve my bandeja.",
  },
  {
    id: "b4",
    player: "Alex Morgan",
    email: "alex@example.com",
    lessonId: "l3",
    clubId: "c1",
    date: "2026-11-25",
    hour: 9,
    status: "confirmed",
    message: "Four players, intermediate level.",
  },
  {
    id: "b5",
    player: "James Taylor",
    email: "james@example.com",
    lessonId: "l1",
    clubId: "c2",
    date: "2026-11-26",
    hour: 12,
    status: "pending",
    message: "My first private lesson. Keen to get the basics right.",
  },
  {
    id: "b6",
    player: "Isabella Chen",
    email: "isabella@example.com",
    lessonId: "l1",
    clubId: "c1",
    date: "2026-11-27",
    hour: 10,
    status: "confirmed",
    message: "Focus on serve and return.",
  },
  {
    id: "b7",
    player: "Daniel Brooks",
    email: "daniel@example.com",
    lessonId: "l2",
    clubId: "c1",
    date: "2026-11-28",
    hour: 11,
    status: "pending",
    message: "A session for myself and my doubles partner.",
  },
];
export const rules: Rule[] = [1, 2, 3, 4, 5].map((day) => ({
  id: `r${day}`,
  day,
  clubId: day % 2 ? "c1" : "c2",
  lessonId: "l1",
  start: 9,
  end: 15,
  effectiveStart: "2026-11-01",
  effectiveEnd: "2027-03-31",
}));
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
