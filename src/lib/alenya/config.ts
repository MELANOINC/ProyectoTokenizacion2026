function env(...keys: string[]): string | undefined {
  for (const key of keys) {
    const value = process.env[key]?.trim();
    if (value) return value;
  }
  return undefined;
}

/** CRM-MELANIA (aLENYA data plane). */
export const ALENYA_SUPABASE_URL =
  env("ALENYA_SUPABASE_URL", "CRM_SUPABASE_URL") ??
  "https://mbxjrdgbgwaaboldzhph.supabase.co";

export const ALENYA_SUPABASE_ANON_KEY = env(
  "ALENYA_SUPABASE_ANON_KEY",
  "CRM_SUPABASE_ANON_KEY",
  "NEXT_PUBLIC_ALENYA_SUPABASE_ANON_KEY",
);

/** Panel gate — override in Vercel; default is demo-only. */
export const ALENYA_PANEL_PASSWORD =
  env("ALENYA_PANEL_PASSWORD") ?? "alenya-melano";

export const ALENYA_SESSION_COOKIE = "alenya_cc_session";
export const ALENYA_SESSION_DAYS = 7;

export const ALENYA_BRAND = "aLENYA";
export const ALENYA_ORG = "Melano Inc";

export function isAlenyaHost(host: string | null | undefined): boolean {
  if (!host) return false;
  const h = host.toLowerCase().split(":")[0];
  return (
    h.startsWith("alenya.") ||
    h.includes("alenya-ai") ||
    h.includes("alenya-cc") ||
    h === "alenya.localhost"
  );
}
