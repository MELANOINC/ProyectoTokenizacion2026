import { NextResponse } from "next/server";
import { ALENYA_SESSION_COOKIE } from "@/lib/alenya/auth";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set({
    name: ALENYA_SESSION_COOKIE,
    value: "",
    httpOnly: true,
    path: "/",
    maxAge: 0,
  });
  return res;
}
