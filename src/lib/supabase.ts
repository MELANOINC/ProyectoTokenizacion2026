import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let cached: SupabaseClient | null | undefined;

function trim(value: string | undefined): string | undefined {
  if (typeof value !== "string") return undefined;
  const t = value.trim();
  return t.length > 0 ? t : undefined;
}

function first(...names: string[]): string | undefined {
  for (const name of names) {
    const value = trim(process.env[name]);
    if (value) return value;
  }
  return undefined;
}

/** Server-side Supabase client. Returns null when env is not configured (demo memory mode). */
export function getSupabase(): SupabaseClient | null {
  // Unit tests / explicit memory mode always use the in-memory store.
  if (
    process.env.NODE_ENV === "test" ||
    process.env.NOTORIUS_FORCE_MEMORY === "1" ||
    trim(process.env.NOTORIUS_STORE) === "memory"
  ) {
    return null;
  }

  if (cached !== undefined) return cached;

  // Prefer NOTORIUS_* so stale cloud SUPABASE_* hosts do not override.
  const url = first(
    "NOTORIUS_SUPABASE_URL",
    "SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_URL",
  );
  const key = first(
    "NOTORIUS_SUPABASE_SERVICE_ROLE_KEY",
    "SUPABASE_SERVICE_ROLE_KEY",
    "NOTORIUS_SUPABASE_ANON_KEY",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
    "SUPABASE_ANON_KEY",
  );

  if (!url || !key) {
    cached = null;
    return null;
  }

  cached = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cached;
}

export function isSupabaseConfigured(): boolean {
  return getSupabase() !== null;
}
