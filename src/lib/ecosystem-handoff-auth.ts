/**
 * Authorize Melano ecosystem handoff calls.
 * Production requires ECOSYSTEM_HANDOFF_SECRET; local/demo may omit it.
 */
export function authorizeEcosystemHandoff(
  request: Request,
): { ok: true } | { ok: false; status: number; error: string } {
  const secret = process.env.ECOSYSTEM_HANDOFF_SECRET?.trim();
  const isProd = process.env.NODE_ENV === "production";

  if (isProd && !secret) {
    return {
      ok: false,
      status: 503,
      error: "ECOSYSTEM_HANDOFF_SECRET is required in production",
    };
  }

  if (!secret) {
    return { ok: true };
  }

  const header =
    request.headers.get("x-melano-handoff-secret") ??
    request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");

  if (header !== secret) {
    return { ok: false, status: 401, error: "Unauthorized handoff" };
  }

  return { ok: true };
}
