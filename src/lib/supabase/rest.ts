import { getSupabaseConfig, type SupabaseConfig } from "./config";

export class SupabaseRestError extends Error {
  status: number;
  body: string;

  constructor(message: string, status: number, body: string) {
    super(message);
    this.name = "SupabaseRestError";
    this.status = status;
    this.body = body;
  }
}

export async function sbFetch<T>(
  path: string,
  init: RequestInit & { config?: SupabaseConfig } = {},
): Promise<T> {
  const config = init.config ?? getSupabaseConfig();
  if (!config) {
    throw new Error("Supabase is not configured");
  }

  const headers = new Headers(init.headers);
  headers.set("apikey", config.key);
  headers.set("Authorization", `Bearer ${config.key}`);
  if (!headers.has("Accept")) {
    headers.set("Accept", "application/json");
  }

  const response = await fetch(`${config.url}${path}`, {
    ...init,
    headers,
    signal: init.signal ?? AbortSignal.timeout(12_000),
  });

  const text = await response.text();
  if (!response.ok) {
    throw new SupabaseRestError(
      `Supabase ${path} → HTTP ${response.status}`,
      response.status,
      text.slice(0, 300),
    );
  }

  if (!text) return undefined as T;
  return JSON.parse(text) as T;
}

export function isSupabaseConfigured(): boolean {
  return getSupabaseConfig() !== null;
}
