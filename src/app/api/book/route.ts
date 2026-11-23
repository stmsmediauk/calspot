import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

/**
 * Receives booking requests from coach pages. It filters out bots before the
 * database is touched: a hidden field, a minimum fill-in time, an optional
 * Cloudflare Turnstile check, and a per-address rate limit. The database adds
 * its own limits as a last line of defence.
 */
const hits = new Map<string, number[]>();
const WINDOW = 10 * 60_000;
const MAX = 5;

function limited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear();
  return recent.length > MAX;
}

const bad = (error: string, status = 400) =>
  NextResponse.json({ error }, { status });

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return bad("Your request couldn’t be sent. Please try again.");
  }
  // Bots fill every field; people never see this one.
  if (typeof body.website === "string" && body.website.trim() !== "")
    return NextResponse.json({ ok: true });
  // A person takes longer than a few seconds to fill the form in.
  if (typeof body.elapsed !== "number" || body.elapsed < 4000)
    return bad("That was quick. Please check your details and try again.");

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (limited(ip))
    return bad("Too many requests just now. Please try again later.", 429);

  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (secret) {
    const token = typeof body.token === "string" ? body.token : "";
    const check = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: { "content-type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ secret, response: token, remoteip: ip }),
      },
    )
      .then((r) => r.json())
      .catch(() => null);
    if (!check?.success)
      return bad("We couldn’t confirm you’re human. Please try again.");
  }

  const str = (v: unknown, max: number) =>
    typeof v === "string" ? v.slice(0, max) : "";
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    { auth: { persistSession: false } },
  );
  const slug = str(body.slug, 60);
  const { data: live, error: liveError } = await supabase.rpc("coach_is_live", {
    p_slug: slug,
  });
  if (!liveError && live === false)
    return bad("This coach isn’t taking requests right now.", 403);
  const spaces = Math.min(40, Math.max(1, Math.floor(Number(body.spaces)) || 1));
  const { error } = await supabase.rpc("request_booking", {
    p_slug: slug,
    p_club: str(body.club, 60),
    p_lesson: str(body.lesson, 60),
    p_date: str(body.date, 10),
    p_hour: Number(body.hour),
    p_name: str(body.name, 100),
    p_email: str(body.email, 200),
    p_phone: str(body.phone, 40),
    p_message: str(body.message, 1000),
    // Only sent for group bookings, so one-to-one requests keep working even
    // before supabase/group_sessions.sql has been run.
    ...(spaces > 1 ? { p_spaces: spaces } : {}),
  });
  if (error) {
    const m = error.message;
    return bad(
      /taken|not available/i.test(m)
        ? "Sorry, that time is no longer available. Please go back and choose another."
        : /several requests|too many|not taking requests/i.test(m)
          ? m
          : "Your request couldn’t be sent. Please try again.",
      /taken|not available/i.test(m) ? 409 : 400,
    );
  }
  return NextResponse.json({ ok: true });
}
