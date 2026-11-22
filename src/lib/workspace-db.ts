import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "./supabase/client";
import type { Booking, Club, Exception, Lesson, Rule } from "./mock-data";
import { parseWorkspace, type CoachWorkspace } from "./workspace-model";

/** Maps the app's workspace shape to and from the Supabase tables. */

type Row = Record<string, unknown>;
export type Saved = {
  profile: string;
  rows: Record<Table, Map<string, string>>;
};
type Table =
  | "clubs"
  | "lessons"
  | "availability_rules"
  | "availability_exceptions"
  | "bookings";

const num = (v: unknown) => Number(v);
const nullable = (id: string) => (id === "all" || id === "" ? null : id);

const toRows = (coachId: string, ws: CoachWorkspace) => ({
  clubs: ws.clubs.map(
    (c: Club, position): Row => ({
      id: c.id,
      coach_id: coachId,
      name: c.name,
      address: c.address,
      notes: c.notes,
      active: c.active,
      position,
    }),
  ),
  lessons: ws.lessons.map(
    (l: Lesson, position): Row => ({
      id: l.id,
      coach_id: coachId,
      name: l.name,
      duration: l.duration,
      price: l.price,
      description: l.description,
      active: l.active,
      position,
    }),
  ),
  availability_rules: ws.rules.map(
    (r: Rule): Row => ({
      id: r.id,
      coach_id: coachId,
      club_id: r.clubId,
      lesson_id: nullable(r.lessonId),
      day: r.day,
      start_hour: r.start,
      end_hour: r.end,
      effective_start: r.effectiveStart,
      effective_end: r.effectiveEnd,
    }),
  ),
  availability_exceptions: ws.exceptions.map(
    (e: Exception): Row => ({
      id: e.id,
      coach_id: coachId,
      club_id: nullable(e.clubId),
      lesson_id: nullable(e.lessonId),
      date: e.date,
      kind: e.kind,
      start_hour: e.start,
      end_hour: e.end,
    }),
  ),
  // Visitors create bookings through request_booking(); coaches only decide on them.
  bookings: ws.bookings.map(
    (b: Booking): Row => ({
      id: b.id,
      status: b.status,
      reply: b.reply ?? "",
      suggested_date: b.suggested?.date ?? null,
      suggested_hour: b.suggested?.hour ?? null,
    }),
  ),
});

const keyed = (rows: Row[]) =>
  new Map(rows.map((r) => [r.id as string, JSON.stringify(r)]));
export const snapshotOf = (coachId: string, ws: CoachWorkspace): Saved => {
  const rows = toRows(coachId, ws);
  return {
    profile: JSON.stringify(ws.profile),
    rows: {
      clubs: keyed(rows.clubs),
      lessons: keyed(rows.lessons),
      availability_rules: keyed(rows.availability_rules),
      availability_exceptions: keyed(rows.availability_exceptions),
      bookings: keyed(rows.bookings),
    },
  };
};

export type LoadedCoach = {
  coachId: string;
  slug: string;
  published: boolean;
  workspace: CoachWorkspace;
};

export async function loadCoach(
  supabase: SupabaseClient,
  userId: string,
): Promise<LoadedCoach | null> {
  const { data: coach, error } = await supabase
    .from("coaches")
    .select("id, slug, published, profile")
    .eq("owner_id", userId)
    .maybeSingle();
  if (error) throw error;
  if (!coach) return null;
  const q = (table: Table) =>
    supabase.from(table).select("*").eq("coach_id", coach.id);
  const [clubs, lessons, rules, exceptions, bookings] = await Promise.all([
    q("clubs").order("position"),
    q("lessons").order("position"),
    q("availability_rules"),
    q("availability_exceptions"),
    q("bookings").order("date").order("hour"),
  ]);
  for (const r of [clubs, lessons, rules, exceptions, bookings])
    if (r.error) throw r.error;
  const workspace = parseWorkspace(
    JSON.stringify({
      profile: coach.profile,
      clubs: (clubs.data ?? []).map((c) => ({
        id: c.id,
        name: c.name,
        address: c.address,
        notes: c.notes,
        active: c.active,
      })),
      lessons: (lessons.data ?? []).map((l) => ({
        id: l.id,
        name: l.name,
        duration: l.duration,
        price: num(l.price),
        description: l.description,
        active: l.active,
      })),
      rules: (rules.data ?? []).map((r) => ({
        id: r.id,
        day: r.day,
        clubId: r.club_id,
        lessonId: r.lesson_id ?? "all",
        start: num(r.start_hour),
        end: num(r.end_hour),
        effectiveStart: r.effective_start,
        effectiveEnd: r.effective_end,
      })),
      exceptions: (exceptions.data ?? []).map((e) => ({
        id: e.id,
        date: e.date,
        kind: e.kind,
        clubId: e.club_id ?? "",
        lessonId: e.lesson_id ?? "all",
        start: num(e.start_hour),
        end: num(e.end_hour),
      })),
      bookings: (bookings.data ?? []).map((b) => ({
        id: b.id,
        player: b.player_name,
        email: b.email,
        phone: b.phone,
        lessonId: b.lesson_id,
        clubId: b.club_id,
        date: b.date,
        hour: num(b.hour),
        status: b.status,
        message: b.message,
        requestedAt: String(b.requested_at).slice(0, 10),
        reply: b.reply || undefined,
        suggested: b.suggested_date
          ? { date: b.suggested_date, hour: num(b.suggested_hour) }
          : undefined,
      })),
    }),
  );
  if (!workspace) throw new Error("Saved coach data could not be read.");
  return {
    coachId: coach.id,
    slug: coach.slug,
    published: coach.published,
    workspace,
  };
}

/** Uploads any pasted-in (data URL) images to storage and swaps in their public URLs. */
async function uploadMedia(
  supabase: SupabaseClient,
  coachId: string,
  ws: CoachWorkspace,
): Promise<CoachWorkspace> {
  const upload = async (value: string | null, name: string) => {
    if (!value || !value.startsWith("data:")) return value;
    const blob = await (await fetch(value)).blob();
    const ext = blob.type === "image/png" ? "png" : blob.type === "image/webp" ? "webp" : "jpg";
    const path = `${coachId}/${name}-${Date.now()}.${ext}`;
    const { error } = await supabase.storage
      .from("coach-media")
      .upload(path, blob, { contentType: blob.type, cacheControl: "31536000" });
    if (error) throw error;
    return supabase.storage.from("coach-media").getPublicUrl(path).data.publicUrl;
  };
  const { profile } = ws;
  const [photograph, logo, logoDark] = await Promise.all([
    upload(profile.photograph, "photo"),
    upload(profile.logo, "logo"),
    upload(profile.logoDark, "logo-dark"),
  ]);
  if (
    photograph === profile.photograph &&
    logo === profile.logo &&
    logoDark === profile.logoDark
  )
    return ws;
  return { ...ws, profile: { ...profile, photograph, logo, logoDark } };
}

/** Writes only what changed since `saved`. Returns the stored workspace and new snapshot. */
export async function pushChanges(
  supabase: SupabaseClient,
  coachId: string,
  wanted: CoachWorkspace,
  saved: Saved,
): Promise<{ workspace: CoachWorkspace; saved: Saved }> {
  const ws = await uploadMedia(supabase, coachId, wanted);
  const next = snapshotOf(coachId, ws);
  const fail = (e: { message: string } | null) => {
    if (e) throw new Error(e.message);
  };
  if (next.profile !== saved.profile)
    fail(
      (await supabase.from("coaches").update({ profile: ws.profile }).eq("id", coachId)).error,
    );
  const rows = toRows(coachId, ws);
  const order: Table[] = ["clubs", "lessons", "availability_rules", "availability_exceptions"];
  for (const table of order) {
    const changed = rows[table].filter(
      (r) => next.rows[table].get(r.id as string) !== saved.rows[table].get(r.id as string),
    );
    if (changed.length) fail((await supabase.from(table).upsert(changed)).error);
  }
  for (const b of rows.bookings) {
    if (next.rows.bookings.get(b.id as string) === saved.rows.bookings.get(b.id as string)) continue;
    const { id, ...fields } = b;
    fail((await supabase.from("bookings").update(fields).eq("id", id as string)).error);
  }
  // Deletes run children-first so foreign keys stay satisfied.
  for (const table of ["availability_rules", "availability_exceptions", "lessons", "clubs"] as Table[]) {
    const gone = [...saved.rows[table].keys()].filter((id) => !next.rows[table].has(id));
    if (gone.length) fail((await supabase.from(table).delete().in("id", gone)).error);
  }
  return { workspace: ws, saved: next };
}

const empty = (): Saved => ({
  profile: "",
  rows: {
    clubs: new Map(),
    lessons: new Map(),
    availability_rules: new Map(),
    availability_exceptions: new Map(),
    bookings: new Map(),
  },
});

/** Creates the coach row for a new account, then writes the whole starter workspace. */
export async function createCoach(
  supabase: SupabaseClient,
  userId: string,
  slug: string,
  ws: CoachWorkspace,
): Promise<LoadedCoach> {
  const { data, error } = await supabase
    .from("coaches")
    .insert({ owner_id: userId, slug, profile: {}, published: false })
    .select("id")
    .single();
  if (error) {
    throw new Error(
      error.code === "23505"
        ? "That page address is already taken. Choose another."
        : error.message,
    );
  }
  const { workspace } = await pushChanges(supabase, data.id, ws, empty());
  return { coachId: data.id, slug, published: false, workspace };
}

export async function slugAvailable(slug: string) {
  const { data, error } = await createClient().rpc("slug_available", { p_slug: slug });
  if (error) throw error;
  return data === true;
}
export { empty as emptySaved };
