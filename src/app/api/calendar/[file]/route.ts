import { createClient } from "@supabase/supabase-js";
import { buildCalendar, type FeedRow } from "@/lib/ics";

/** The calendar link a coach subscribes to: /api/calendar/<token>.ics */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ file: string }> },
) {
  const token = (await params).file.replace(/\.ics$/i, "");
  const notFound = () => new Response("Not found", { status: 404 });
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(token))
    return notFound();
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    { auth: { persistSession: false } },
  );
  const { data, error } = await supabase.rpc("calendar_feed", { p_token: token });
  if (error) return new Response("Calendar unavailable", { status: 503 });
  // An unknown or reset token simply returns no rows, so an old link shows an empty
  // calendar and the sessions drop out of the coach's calendar app.
  const rows = (data ?? []) as FeedRow[];
  return new Response(buildCalendar(rows), {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'inline; filename="calspot.ics"',
      "Cache-Control": "private, max-age=300",
      "X-Robots-Tag": "noindex",
    },
  });
}
