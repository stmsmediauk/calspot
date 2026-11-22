import { defaultTemplates, type WhatsAppTemplates } from "./whatsapp";
import {
  defaultAppearance,
  sanitiseAppearance,
  type CoachAppearance,
} from "./coach-theme";
import type {
  Booking,
  Club,
  Exception,
  Lesson,
  Rule,
} from "./mock-data";

export type Highlight = { value: string; label: string };
export type Testimonial = { quote: string; attribution: string };
export type CoachProfile = {
  name: string;
  title: string;
  /** Optional one-line tagline shown with the name. */
  tagline: string;
  introduction: string;
  experience: string;
  location: string;
  /** Up to three short credentials shown under the hero. */
  highlights: Highlight[];
  /** Real testimonials supplied by the coach. Never invented. */
  testimonials: Testimonial[];
  appearance: CoachAppearance;
  photograph: string | null;
  /** Focal point of the photograph, 0-100% from the left and top. */
  photoFocusX: number;
  photoFocusY: number;
  logo: string | null;
  /** Optional logo for dark looks such as Midnight. */
  logoDark: string | null;
  whatsapp: string;
  /** Editable WhatsApp message drafts. */
  whatsappTemplates: WhatsAppTemplates;
  instagram: string;
};
export type CoachWorkspace = {
  profile: CoachProfile;
  clubs: Club[];
  lessons: Lesson[];
  /** Demo bookings, shared by the dashboard and the public availability. */
  bookings: Booking[];
  rules: Rule[];
  exceptions: Exception[];
};
/** A blank profile. No coach's details are bundled; sign-up fills these in. */
export const defaultProfile: CoachProfile = {
  name: "",
  title: "",
  tagline: "",
  introduction: "",
  experience: "",
  location: "",
  highlights: [],
  testimonials: [],
  appearance: defaultAppearance,
  photograph: null,
  photoFocusX: 50,
  photoFocusY: 20,
  logo: null,
  logoDark: null,
  whatsapp: "",
  whatsappTemplates: defaultTemplates,
  instagram: "",
};
export const defaultWorkspace: CoachWorkspace = {
  profile: defaultProfile,
  clubs: [],
  lessons: [],
  bookings: [],
  rules: [],
  exceptions: [],
};

export function normaliseWhatsApp(value: string) {
  return value.replace(/[\s().-]/g, "");
}
export function hasWhatsApp(value: string) {
  return /^\+[1-9]\d{7,14}$/.test(normaliseWhatsApp(value));
}
export function coachInitials(name: string) {
  return name
    .split(/[\s-]+/)
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 3)
    .join("")
    .toUpperCase();
}
export function isProfileImage(value: unknown): value is string {
  return (
    typeof value === "string" &&
    (value === defaultProfile.photograph ||
      (value.length <= 1_450_000 &&
        /^data:image\/(png|jpeg|webp);base64,[a-zA-Z0-9+/=]+$/.test(value)))
  );
}

function sanitiseTemplates(value: unknown): WhatsAppTemplates {
  const raw = (value && typeof value === "object" ? value : {}) as Record<string, unknown>;
  const pick = (key: keyof WhatsAppTemplates) =>
    typeof raw[key] === "string" && raw[key].length > 0 && raw[key].length <= 600
      ? (raw[key] as string)
      : defaultTemplates[key];
  return {
    confirm: pick("confirm"),
    decline: pick("decline"),
    suggest: pick("suggest"),
    reminder: pick("reminder"),
  };
}
function restore(raw: string): CoachWorkspace | null {
  const value: unknown = JSON.parse(raw);
  if (!value || typeof value !== "object") return null;
  const {
    profile,
    clubs: savedClubs,
    lessons: savedLessons,
  } = value as CoachWorkspace;
  if (
    !profile ||
    !savedClubs ||
    !savedLessons ||
    !Array.isArray(savedClubs) ||
    !Array.isArray(savedLessons)
  )
    return null;
  const texts = [
    "name",
    "title",
    "introduction",
    "experience",
    "location",
    "whatsapp",
    "instagram",
  ] as const;
  if (
    texts.some(
      (key) => typeof profile[key] !== "string" || profile[key].length > 1000,
    ) ||
    !profile.name.trim() ||
    !profile.title.trim()
  )
    return null;
  if (
    (profile.photograph !== null && !isProfileImage(profile.photograph)) ||
    (profile.logo !== null && !isProfileImage(profile.logo))
  )
    return null;
  if (
    !savedClubs.every(
      (c) =>
        c &&
        [c.id, c.name, c.address, c.notes].every(
          (x) => typeof x === "string",
        ) &&
        typeof c.active === "boolean",
    )
  )
    return null;
  if (
    !savedLessons.every(
      (l) =>
        l &&
        [l.id, l.name, l.description].every((x) => typeof x === "string") &&
        [60, 90].includes(l.duration) &&
        Number.isFinite(l.price) &&
        l.price >= 0 &&
        typeof l.active === "boolean",
    )
  )
    return null;
  // Older drafts lack newer appearance and content fields (and may carry a
  // legacy palette or arbitrary accent). Keep their content, fill gaps from
  // the defaults and validate every appearance value against curated lists.
  const legacy = profile as unknown as Record<string, unknown>;
  const text = (value: unknown, fallback: string) =>
    typeof value === "string" && value.length <= 1000 ? value : fallback;
  const pairs = <T extends Record<string, string>>(
    value: unknown,
    keys: (keyof T & string)[],
    max: number,
    fallback: T[],
  ): T[] =>
    Array.isArray(value)
      ? (value
          .filter(
            (item) =>
              item &&
              typeof item === "object" &&
              keys.every(
                (key) =>
                  typeof item[key] === "string" && item[key].length <= 300,
              ),
          )
          .slice(0, max)
          .map((item) =>
            Object.fromEntries(keys.map((key) => [key, item[key]])),
          ) as T[])
      : fallback;
  const focus = (value: unknown, fallback: number) =>
    typeof value === "number" && value >= 0 && value <= 100 ? value : fallback;
  const migrated: CoachProfile = {
    ...profile,
    tagline: text(legacy.tagline, defaultProfile.tagline),
    highlights: pairs<Highlight>(
      legacy.highlights,
      ["value", "label"],
      3,
      defaultProfile.highlights,
    ),
    testimonials: pairs<Testimonial>(
      legacy.testimonials,
      ["quote", "attribution"],
      2,
      [],
    ),
    appearance: sanitiseAppearance(legacy.appearance, legacy.palette),
    logoDark: isProfileImage(legacy.logoDark) ? legacy.logoDark : null,
    whatsappTemplates: sanitiseTemplates(legacy.whatsappTemplates),
    photoFocusX: focus(legacy.photoFocusX, defaultProfile.photoFocusX),
    photoFocusY: focus(legacy.photoFocusY, defaultProfile.photoFocusY),
  };
  delete (migrated as unknown as Record<string, unknown>).palette;
  const record = (value: unknown): value is Record<string, unknown> =>
    !!value && typeof value === "object";
  const str = (value: unknown) => typeof value === "string";
  const num = (value: unknown) =>
    typeof value === "number" && Number.isFinite(value);
  const list = <T>(
    value: unknown,
    valid: (item: Record<string, unknown>) => boolean,
    fallback: T[],
  ) =>
    Array.isArray(value) && value.every((item) => record(item) && valid(item))
      ? (value as T[])
      : fallback;
  const extras = value as Record<string, unknown>;
  return {
    profile: migrated,
    clubs: savedClubs,
    lessons: savedLessons,
    bookings: list<Booking>(
      extras.bookings,
      (b) =>
        [
          b.id,
          b.player,
          b.email,
          b.lessonId,
          b.clubId,
          b.date,
          b.message,
        ].every(str) &&
        num(b.hour) &&
        ["pending", "confirmed", "declined", "cancelled"].includes(
          String(b.status),
        ),
      defaultWorkspace.bookings,
    ),
    rules: list<Rule>(
      extras.rules,
      (r) =>
        [r.id, r.clubId, r.lessonId, r.effectiveStart, r.effectiveEnd].every(
          str,
        ) && [r.day, r.start, r.end].every(num),
      defaultWorkspace.rules,
    ),
    exceptions: list<Exception>(
      extras.exceptions,
      (e) =>
        [e.id, e.date, e.clubId, e.lessonId].every(str) &&
        [e.start, e.end].every(num) &&
        (e.kind === "blocked" || e.kind === "extra"),
      [],
    ),
  };
}

/** Validates a serialised workspace (used by the dashboard preview frame). */
export function parseWorkspace(raw: string): CoachWorkspace | null {
  try {
    return restore(raw);
  } catch {
    return null;
  }
}
