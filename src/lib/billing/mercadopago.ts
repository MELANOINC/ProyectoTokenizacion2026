function env(...keys: string[]): string | undefined {
  for (const key of keys) {
    const value = process.env[key]?.trim();
    if (value) return value;
  }
  return undefined;
}

export async function getMercadoPagoToken(): Promise<string> {
  const accessToken = env("MERCADOPAGO_ACCESS_TOKEN");
  const clientId = env("MERCADOPAGO_CLIENT_ID");
  const clientSecret = env("MERCADOPAGO_CLIENT_SECRET");

  if (clientId && clientSecret) {
    const body = new URLSearchParams({
      grant_type: "client_credentials",
      client_id: clientId,
      client_secret: clientSecret,
    });
    const tokenRes = await fetch("https://api.mercadopago.com/oauth/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
      signal: AbortSignal.timeout(12_000),
    });
    if (tokenRes.ok) {
      const json = (await tokenRes.json()) as { access_token?: string };
      if (json.access_token) return json.access_token;
    }
  }

  if (accessToken) return accessToken;
  throw new Error("Mercado Pago no configurado");
}

export type PreferenceInput = {
  title: string;
  unitPrice: number;
  currencyId: string;
  quantity?: number;
  externalReference: string;
  payerEmail?: string;
  successUrl: string;
  failureUrl: string;
  pendingUrl: string;
  notificationUrl?: string;
};

export async function createCheckoutPreference(input: PreferenceInput) {
  const token = await getMercadoPagoToken();
  const payload = {
    items: [
      {
        id: input.externalReference,
        title: input.title,
        quantity: input.quantity ?? 1,
        unit_price: input.unitPrice,
        currency_id: input.currencyId,
      },
    ],
    payer: input.payerEmail ? { email: input.payerEmail } : undefined,
    external_reference: input.externalReference,
    back_urls: {
      success: input.successUrl,
      failure: input.failureUrl,
      pending: input.pendingUrl,
    },
    auto_return: "approved" as const,
    notification_url: input.notificationUrl,
    statement_descriptor: "MELANO INC",
    metadata: {
      source: "notorius-live",
      plan_id: input.externalReference,
    },
  };

  const res = await fetch("https://api.mercadopago.com/checkout/preferences", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(15_000),
  });

  const json = (await res.json()) as {
    id?: string;
    init_point?: string;
    sandbox_init_point?: string;
    message?: string;
    error?: string;
  };

  if (!res.ok || !json.init_point) {
    throw new Error(
      json.message || json.error || `Mercado Pago HTTP ${res.status}`,
    );
  }

  return {
    id: json.id!,
    initPoint: json.init_point,
    sandboxInitPoint: json.sandbox_init_point,
  };
}
