import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  ADMIN_SESSION_COOKIE,
  verifyAdminSessionToken,
} from "@/lib/admin/auth";

export async function requireAdminApi(): Promise<NextResponse | null> {
  const jar = await cookies();
  const token = jar.get(ADMIN_SESSION_COOKIE)?.value;
  if (verifyAdminSessionToken(token)) return null;
  return NextResponse.json(
    { ok: false, error: "No autorizado" },
    { status: 401 },
  );
}
