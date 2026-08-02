import { createHmac, timingSafeEqual } from "node:crypto";
import {
  ALENYA_PANEL_PASSWORD,
  ALENYA_SESSION_COOKIE,
  ALENYA_SESSION_DAYS,
} from "@/lib/alenya/config";

function secret(): string {
  return (
    process.env.ALENYA_SESSION_SECRET?.trim() ||
    process.env.SUPABASE_JWT_SECRET?.trim() ||
    ALENYA_PANEL_PASSWORD
  );
}

function sign(payload: string): string {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

export function createSessionToken(now = Date.now()): string {
  const exp = now + ALENYA_SESSION_DAYS * 24 * 60 * 60 * 1000;
  const body = `alenya:${exp}`;
  return `${body}.${sign(body)}`;
}

export function verifySessionToken(token: string | undefined | null): boolean {
  if (!token) return false;
  const [body, sig] = token.split(".");
  if (!body || !sig) return false;
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

export function verifyPanelPassword(password: string): boolean {
  const expected = Buffer.from(ALENYA_PANEL_PASSWORD);
  const got = Buffer.from(password);
  if (expected.length !== got.length) return false;
  return timingSafeEqual(expected, got);
}

export function sessionCookieOptions(token: string) {
  return {
    name: ALENYA_SESSION_COOKIE,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: ALENYA_SESSION_DAYS * 24 * 60 * 60,
  };
}

export { ALENYA_SESSION_COOKIE };
