import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/** Refreshes the landing page straight after an admin changes a site setting. */
export async function POST() {
  const supabase = await createClient();
  const { data: isAdmin } = await supabase.rpc("is_platform_admin");
  if (isAdmin !== true)
    return NextResponse.json({ error: "Not allowed" }, { status: 403 });
  revalidatePath("/");
  return NextResponse.json({ ok: true });
}
