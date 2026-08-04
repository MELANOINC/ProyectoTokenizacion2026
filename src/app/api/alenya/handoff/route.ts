import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ALENYA_SESSION_COOKIE, verifySessionToken } from "@/lib/alenya/auth";
import { requestHandoff } from "@/lib/alenya/data";

export async function POST(req: Request) {
  const jar = await cookies();
  if (!verifySessionToken(jar.get(ALENYA_SESSION_COOKIE)?.value)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = (await req.json().catch(() => ({}))) as {
    contactId?: string;
    reason?: string;
  };
  if (!body.contactId) {
    return NextResponse.json({ error: "contactId required" }, { status: 400 });
  }
  try {
    const result = await requestHandoff(body.contactId, body.reason);
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
