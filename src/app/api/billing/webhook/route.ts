import { NextResponse } from "next/server";
import { getMercadoPagoToken } from "@/lib/billing/mercadopago";

/**
 * Mercado Pago IPN / webhook receiver.
 * Acknowledges notifications; payment fulfillment can be wired to CRM later.
 */
export async function POST(req: Request) {
  const url = new URL(req.url);
  const topic =
    url.searchParams.get("topic") ||
    url.searchParams.get("type") ||
    "unknown";
  const id =
    url.searchParams.get("id") ||
    url.searchParams.get("data.id") ||
    undefined;

  let body: unknown = null;
  try {
    body = await req.json();
  } catch {
    body = null;
  }

  const paymentId =
    id ||
    (typeof body === "object" &&
    body &&
    "data" in body &&
    typeof (body as { data?: { id?: string } }).data?.id === "string"
      ? (body as { data: { id: string } }).data.id
      : undefined);

  if (paymentId && (topic === "payment" || topic === "merchant_order")) {
    try {
      const token = await getMercadoPagoToken();
      const path =
        topic === "merchant_order"
          ? `https://api.mercadopago.com/merchant_orders/${paymentId}`
          : `https://api.mercadopago.com/v1/payments/${paymentId}`;
      await fetch(path, {
        headers: { Authorization: `Bearer ${token}` },
        signal: AbortSignal.timeout(10_000),
      });
    } catch {
      // Acknowledge anyway — MP retries on non-2xx
    }
  }

  return NextResponse.json({ ok: true, received: true, topic });
}

export async function GET() {
  return NextResponse.json({ ok: true, service: "billing-webhook" });
}
