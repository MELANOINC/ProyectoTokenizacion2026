import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ALENYA_SESSION_COOKIE, verifySessionToken } from "@/lib/alenya/auth";
import { fetchPanelKnowledge, upsertKnowledge } from "@/lib/alenya/data";

export const dynamic = "force-dynamic";

async function authed() {
  const jar = await cookies();
  return verifySessionToken(jar.get(ALENYA_SESSION_COOKIE)?.value);
}

export async function GET() {
  if (!(await authed())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const items = await fetchPanelKnowledge();
    return NextResponse.json({ items });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}

export async function POST(req: Request) {
  if (!(await authed())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = (await req.json().catch(() => ({}))) as {
    contenido?: string;
    empresa?: string;
  };
  const contenido = body.contenido?.trim() ?? "";
  if (contenido.length < 4) {
    return NextResponse.json(
      { error: "contenido demasiado corto" },
      { status: 400 },
    );
  }
  try {
    const result = await upsertKnowledge(contenido, body.empresa);
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
