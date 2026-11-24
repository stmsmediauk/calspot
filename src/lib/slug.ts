/** Turns a name into a page address: lowercase letters, numbers and single hyphens. */
export const slugify = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);

export const slugPattern = /^[a-z0-9][a-z0-9-]{1,38}[a-z0-9]$/;

/** Where the landing page leaves a claimed name for sign-up to pick up. */
export const claimKey = "calspot:claim";

/** The address of the seeded demo coach (supabase/demo_coach.sql). Never indexed or listed. */
export const DEMO_SLUG = "demo";
