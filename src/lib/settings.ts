import { createClient } from "@supabase/supabase-js";
import { FOUNDING_OFFER_ACTIVE } from "./offer";

/**
 * Whether the founding coach offer is switched on. Set from /admin and stored
 * in the site_settings table. Falls back to the default in offer.ts if the
 * table isn't set up yet or can't be read, so the page never breaks.
 */
export async function getFoundingOfferActive(): Promise<boolean> {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      { auth: { persistSession: false } },
    );
    const { data, error } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "founding_offer_active")
      .maybeSingle();
    if (error || !data) return FOUNDING_OFFER_ACTIVE;
    return data.value === true;
  } catch {
    return FOUNDING_OFFER_ACTIVE;
  }
}
