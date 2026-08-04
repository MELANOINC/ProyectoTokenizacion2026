/**
 * Notorius prefers NOTORIUS_* overrides so stale cloud SUPABASE_* secrets
 * (dead project hosts) do not block a working local/project config.
 */

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

export type SupabaseConfig = {
  url: string;
  key: string;
  companyId: string;
  enabled: boolean;
};

export function getSupabaseConfig(): SupabaseConfig | null {
  if (process.env.NODE_ENV === "test") return null;
  if (trim(process.env.NOTORIUS_STORE) === "memory") return null;

  const url = first(
    "NOTORIUS_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_URL",
    "SUPABASE_URL",
  );
  const key = first(
    "NOTORIUS_SUPABASE_SERVICE_ROLE_KEY",
    "SUPABASE_SERVICE_ROLE_KEY",
    "NOTORIUS_SUPABASE_ANON_KEY",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "SUPABASE_ANON_KEY",
  );
  const companyId = first(
    "NOTORIUS_COMPANY_ID",
    // Known Melano Inc company row in orehvausvxxtvjomxchr
    "NOTORIUS_DEFAULT_COMPANY_ID",
  );

  if (!url || !key) return null;

  return {
    url: url.replace(/\/$/, ""),
    key,
    companyId: companyId ?? "ed6c4152-18b0-4ff9-9c00-423058748289",
    enabled: true,
  };
}
