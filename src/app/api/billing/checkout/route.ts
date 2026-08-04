import { NextResponse } from "next/server";
import { createCheckoutPreference } from "@/lib/billing/mercadopago";
import { getPlan, type PlanId } from "@/lib/billing/plans";
import { absoluteUrl } from "@/lib/seo";

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as {
    planId?: string;
    email?: string;
    name?: string;
  };

  const plan = getPlan(body.planId);
  if (!plan) {
    return NextResponse.json(
      { ok: false, error: "Plan inválido" },
      { status: 400 },
    );
  }

  const email = body.email?.trim().toLowerCase();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json(
      { ok: false, error: "Email inválido" },
      { status: 400 },
    );
  }

  const externalReference = `${plan.id}:${Date.now()}`;
  const success = absoluteUrl(
    `/gracias?plan=${encodeURIComponent(plan.id)}&status=approved`,
  );
  const failure = absoluteUrl(
    `/comprar?plan=${encodeURIComponent(plan.id)}&status=failure`,
  );
  const pending = absoluteUrl(
    `/gracias?plan=${encodeURIComponent(plan.id)}&status=pending`,
  );

  try {
    const preference = await createCheckoutPreference({
      title: `${plan.name} · Melano Inc`,
      unitPrice: plan.unitPrice,
      currencyId: plan.currency,
      externalReference,
      payerEmail: email,
      successUrl: success,
      failureUrl: failure,
      pendingUrl: pending,
      notificationUrl: absoluteUrl("/api/billing/webhook"),
    });

    return NextResponse.json({
      ok: true,
      planId: plan.id as PlanId,
      preferenceId: preference.id,
      checkoutUrl: preference.initPoint,
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "No se pudo crear el checkout";
    return NextResponse.json({ ok: false, error: message }, { status: 502 });
  }
}
