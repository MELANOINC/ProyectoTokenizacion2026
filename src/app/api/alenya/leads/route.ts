import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ALENYA_SESSION_COOKIE, verifySessionToken } from "@/lib/alenya/auth";
import { fetchPanelLeads } from "@/lib/alenya/data";

export const dynamic = "force-dynamic";

export async function GET() {
  const jar = await cookies();
  if (!verifySessionToken(jar.get(ALENYA_SESSION_COOKIE)?.value)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const leads = await fetchPanelLeads();
    return NextResponse.json({ leads });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
