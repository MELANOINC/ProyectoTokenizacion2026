import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import {
  ALENYA_SUPABASE_ANON_KEY,
  ALENYA_SUPABASE_URL,
} from "@/lib/alenya/config";

let client: SupabaseClient | null = null;

/** Publishable anon client — RPCs are SECURITY DEFINER. */
export function getAlenyaSupabase(): SupabaseClient {
  if (client) return client;
  const key = ALENYA_SUPABASE_ANON_KEY;
  if (!key) {
    throw new Error(
      "Missing ALENYA_SUPABASE_ANON_KEY (CRM Melania publishable key)",
    );
  }
  client = createClient(ALENYA_SUPABASE_URL, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return client;
}
