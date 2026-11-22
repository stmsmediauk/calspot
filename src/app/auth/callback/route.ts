import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/** Email confirmation lands here; swap the one-time code for a session. */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  // Only allow same-site paths so the link can't redirect elsewhere.
  const requested = searchParams.get("next") ?? "";
  const next = /^\/(?!\/)[a-z0-9/_-]*$/i.test(requested) ? requested : "/dashboard";
  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${origin}${next}`);
  }
  return NextResponse.redirect(`${origin}/login`);
}
