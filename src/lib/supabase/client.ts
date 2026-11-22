import { createBrowserClient } from "@supabase/ssr";

/** Browser Supabase client (publishable key only; row-level security protects data). */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  );
}
