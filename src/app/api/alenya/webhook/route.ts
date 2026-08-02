import { NextResponse } from "next/server";

/**
 * Meta WhatsApp Cloud API webhook stub.
 * Verify token challenge + acknowledge inbound events.
 * Full AI pipeline lives with the bot worker; this keeps the endpoint green.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge");
  const expected =
    process.env.ALENYA_WHATSAPP_VERIFY_TOKEN?.trim() ||
    process.env.WHATSAPP_VERIFY_TOKEN?.trim() ||
    "alenya-verify";

  if (mode === "subscribe" && token === expected && challenge) {
    return new NextResponse(challenge, {
      status: 200,
      headers: { "Content-Type": "text/plain" },
    });
  }
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

export async function POST(req: Request) {
  const payload = await req.json().catch(() => null);
  // Idempotent ack — processing is async / external worker.
  console.info("[alenya.webhook]", JSON.stringify({
    received: Boolean(payload),
    object: (payload as { object?: string } | null)?.object,
  }));
  return NextResponse.json({ ok: true });
}
