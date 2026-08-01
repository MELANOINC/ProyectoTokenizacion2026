export type ProbeStatus = "GREEN" | "RED" | "SKIP";

export type IntegrationProbe = {
  name: "supabase" | "mercadopago" | "hostinger";
  status: ProbeStatus;
  detail: string;
};

export type IntegrationsReport = {
  probes: IntegrationProbe[];
  /** App-facing integrations (Supabase, Mercado Pago). SKIP does not fail. */
  appVerdict: "GREEN" | "RED";
  /** Ops integrations (Hostinger SSH). SKIP does not fail. */
  opsVerdict: "GREEN" | "RED";
  /** Combined: RED if either app or ops is RED. */
  verdict: "GREEN" | "RED";
  timestamp: string;
};

function env(name: string): string | undefined {
  const value = process.env[name];
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function firstEnv(...names: string[]): string | undefined {
  for (const name of names) {
    const value = env(name);
    if (value) return value;
  }
  return undefined;
}

async function probeSupabase(): Promise<IntegrationProbe> {
  const url = firstEnv(
    "NOTORIUS_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_URL",
    "SUPABASE_URL",
  );
  const key = firstEnv(
    "NOTORIUS_SUPABASE_SERVICE_ROLE_KEY",
    "NOTORIUS_SUPABASE_ANON_KEY",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
    "SUPABASE_ANON_KEY",
    "SUPABASE_SERVICE_ROLE_KEY",
  );

  if (!url || !key) {
    return {
      name: "supabase",
      status: "SKIP",
      detail: "Missing SUPABASE_URL / anon or publishable key",
    };
  }

  try {
    const authHealth = await fetch(`${url.replace(/\/$/, "")}/auth/v1/health`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
      signal: AbortSignal.timeout(10_000),
    });
    if (!authHealth.ok) {
      return {
        name: "supabase",
        status: "RED",
        detail: `Auth health HTTP ${authHealth.status}`,
      };
    }

    // Prefer Notorius-specific tables; fall back to Melano platform schema.
    const restCandidates = [
      "tokenization_assets",
      "tokenizations",
      "assets",
      "investors",
    ];
    const base = url.replace(/\/$/, "");
    let reached: string | undefined;
    let lastStatus = 0;

    for (const table of restCandidates) {
      const rest = await fetch(
        `${base}/rest/v1/${table}?select=*&limit=1`,
        {
          headers: {
            apikey: key,
            Authorization: `Bearer ${key}`,
            Accept: "application/json",
          },
          signal: AbortSignal.timeout(10_000),
        },
      );
      lastStatus = rest.status;
      if (rest.ok) {
        reached = table;
        break;
      }
      // 404 = table missing; keep trying. Other errors are fatal.
      if (rest.status !== 404) {
        return {
          name: "supabase",
          status: "RED",
          detail: `REST ${table} HTTP ${rest.status}`,
        };
      }
    }

    if (!reached) {
      return {
        name: "supabase",
        status: "GREEN",
        detail: `Auth healthy; no known REST tables yet (last HTTP ${lastStatus})`,
      };
    }

    return {
      name: "supabase",
      status: "GREEN",
      detail: `Auth health + ${reached} reachable`,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    const hint =
      /ENOTFOUND|getaddrinfo|DNS/i.test(message)
        ? " — update Cursor/cloud secrets to a live project (e.g. CRM-MELANIA mbxjrdgbgwaaboldzhph) or set overrides in .env.local"
        : "";
    return { name: "supabase", status: "RED", detail: `${message}${hint}` };
  }
}

async function probeMercadoPago(): Promise<IntegrationProbe> {
  const clientId = env("MERCADOPAGO_CLIENT_ID");
  const clientSecret = env("MERCADOPAGO_CLIENT_SECRET");
  const accessToken = env("MERCADOPAGO_ACCESS_TOKEN");

  if (!clientId && !clientSecret && !accessToken) {
    return {
      name: "mercadopago",
      status: "SKIP",
      detail: "No Mercado Pago credentials configured",
    };
  }

  try {
    let bearer = accessToken;
    let authPath = "access_token";

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
        signal: AbortSignal.timeout(10_000),
      });
      if (!tokenRes.ok) {
        return {
          name: "mercadopago",
          status: "RED",
          detail: `OAuth client_credentials HTTP ${tokenRes.status}`,
        };
      }
      const tokenJson = (await tokenRes.json()) as { access_token?: string };
      if (!tokenJson.access_token) {
        return {
          name: "mercadopago",
          status: "RED",
          detail: "OAuth response missing access_token",
        };
      }
      bearer = tokenJson.access_token;
      authPath = "client_credentials";
    }

    if (!bearer) {
      return {
        name: "mercadopago",
        status: "RED",
        detail: "No usable bearer token",
      };
    }

    const me = await fetch("https://api.mercadopago.com/users/me", {
      headers: { Authorization: `Bearer ${bearer}` },
      signal: AbortSignal.timeout(10_000),
    });

    if (!me.ok) {
      return {
        name: "mercadopago",
        status: "RED",
        detail: `/users/me via ${authPath} HTTP ${me.status}`,
      };
    }

    const profile = (await me.json()) as { id?: number; site_id?: string };
    return {
      name: "mercadopago",
      status: "GREEN",
      detail: `Authenticated via ${authPath} (site ${profile.site_id ?? "?"})`,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return { name: "mercadopago", status: "RED", detail: message };
  }
}

function probeHostinger(): IntegrationProbe {
  const host = env("HOSTINGER_SSH_HOST");
  const user = env("HOSTINGER_SSH_USER");
  const key = env("HOSTINGER_SSH_PRIVATE_KEY");
  const port = env("HOSTINGER_SSH_PORT") ?? "22";

  if (!host && !user && !key) {
    return {
      name: "hostinger",
      status: "SKIP",
      detail: "No Hostinger SSH vars configured",
    };
  }

  const issues: string[] = [];
  if (!host) issues.push("HOSTINGER_SSH_HOST missing");
  if (host && (host === "root" || !host.includes("."))) {
    issues.push(
      'HOSTINGER_SSH_HOST looks like a username, not a hostname (got a non-FQDN value)',
    );
  }
  if (!user) issues.push("HOSTINGER_SSH_USER missing");
  if (!key) issues.push("HOSTINGER_SSH_PRIVATE_KEY missing");
  if (!/^\d+$/.test(port)) issues.push("HOSTINGER_SSH_PORT invalid");

  if (issues.length > 0) {
    return {
      name: "hostinger",
      status: "RED",
      detail: issues.join("; "),
    };
  }

  return {
    name: "hostinger",
    status: "GREEN",
    detail: `SSH config present for ${user}@${host}:${port} (TCP not opened)`,
  };
}

export async function probeIntegrations(): Promise<IntegrationsReport> {
  const probes = await Promise.all([
    probeSupabase(),
    probeMercadoPago(),
    Promise.resolve(probeHostinger()),
  ]);

  const appRed = probes.some(
    (p) =>
      (p.name === "supabase" || p.name === "mercadopago") && p.status === "RED",
  );
  const opsRed = probes.some(
    (p) => p.name === "hostinger" && p.status === "RED",
  );

  return {
    probes,
    appVerdict: appRed ? "RED" : "GREEN",
    opsVerdict: opsRed ? "RED" : "GREEN",
    verdict: appRed || opsRed ? "RED" : "GREEN",
    timestamp: new Date().toISOString(),
  };
}
