import { NextResponse } from "next/server";
import {
  createSessionToken,
  sessionCookieOptions,
  verifyPanelPassword,
} from "@/lib/alenya/auth";

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { password?: string };
  const password = body.password?.trim() ?? "";
  if (!verifyPanelPassword(password)) {
    return NextResponse.json(
      { ok: false, error: "Clave incorrecta" },
      { status: 401 },
    );
  }
  const token = createSessionToken();
  const res = NextResponse.json({ ok: true });
  const cookie = sessionCookieOptions(token);
  res.cookies.set(cookie);
  return res;
}
