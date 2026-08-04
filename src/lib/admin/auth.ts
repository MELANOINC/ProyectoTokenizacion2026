import { createHmac, timingSafeEqual } from "node:crypto";
import { ADMIN_SESSION_COOKIE } from "@/lib/admin/config";

export { ADMIN_SESSION_COOKIE };
const ADMIN_SESSION_DAYS = 7;

function adminPassword(): string {
  return (
    process.env.NOTORIUS_ADMIN_PASSWORD?.trim() ||
    process.env.ALENYA_PANEL_PASSWORD?.trim() ||
    ""
  );
}

function secret(): string {
  return (
    process.env.NOTORIUS_ADMIN_SESSION_SECRET?.trim() ||
    process.env.ALENYA_SESSION_SECRET?.trim() ||
    process.env.SUPABASE_JWT_SECRET?.trim() ||
    adminPassword()
  );
}

function sign(payload: string): string {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

export function createAdminSessionToken(now = Date.now()): string {
  const exp = now + ADMIN_SESSION_DAYS * 24 * 60 * 60 * 1000;
  const body = `admin:${exp}`;
  return `${body}.${sign(body)}`;
}

export function verifyAdminSessionToken(
  token: string | undefined | null,
): boolean {
  if (!token) return false;
  const [body, sig] = token.split(".");
  if (!body || !sig || !body.startsWith("admin:")) return false;
  const expected = sign(body);
  try {
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return false;
  } catch {
    return false;
  }
  const exp = Number(body.split(":")[1]);
  return Number.isFinite(exp) && Date.now() < exp;
}

export function verifyAdminPassword(password: string): boolean {
  const expectedPw = adminPassword();
  if (!expectedPw || !password) return false;
  const expected = Buffer.from(expectedPw);
  const got = Buffer.from(password);
  if (expected.length !== got.length) return false;
  return timingSafeEqual(expected, got);
}

export function adminCookieOptions(token: string) {
  return {
    name: ADMIN_SESSION_COOKIE,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: ADMIN_SESSION_DAYS * 24 * 60 * 60,
  };
}
