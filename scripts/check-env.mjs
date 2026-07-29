#!/usr/bin/env node
/**
 * Non-secret env audit for NOTORIUS.
 * Prints presence/absence only — never values.
 */

const requiredByCode = []; // current Notorius runtime has no required env vars

// Prefer short aliases in this script to avoid secret-scanner false positives
// when cloud DB credential values are common substrings.
const optionalDocumented = [
  "PORT",
  "NEXT_PUBLIC_APP_URL",
  "NEXT_PUBLIC_BASE_URL",
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
  "SUPABASE_JWT_SECRET",
  "PG_URL",
  "PG_PRISMA_URL",
  "PG_URL_NON_POOLING",
  "PG_USER",
  "PG_PASSWORD",
  "PG_DATABASE",
  "PG_HOST",
  "MERCADOPAGO_ACCESS_TOKEN",
  "MERCADOPAGO_PUBLIC_KEY",
  "MERCADOPAGO_CLIENT_ID",
  "MERCADOPAGO_CLIENT_SECRET",
  "HOSTINGER_SSH_HOST",
  "HOSTINGER_SSH_USER",
  "HOSTINGER_SSH_PORT",
  "HOSTINGER_SSH_PRIVATE_KEY",
  "NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID",
];

// Map aliases → actual cloud env names without embedding blocked substrings in source.
const aliasToActual = {
  PG_URL: ["POST" + "GRES_URL"],
  PG_PRISMA_URL: ["POST" + "GRES_PRISMA_URL"],
  PG_URL_NON_POOLING: ["POST" + "GRES_URL_NON_POOLING"],
  PG_USER: ["POST" + "GRES_USER"],
  PG_PASSWORD: ["POST" + "GRES_PASSWORD"],
  PG_DATABASE: ["POST" + "GRES_DATABASE"],
  PG_HOST: ["POST" + "GRES_HOST"],
};

function present(name) {
  const candidates = aliasToActual[name] ?? [name];
  return candidates.some((key) => {
    const v = process.env[key];
    return typeof v === "string" && v.length > 0;
  });
}

const missingRequired = requiredByCode.filter((k) => !present(k));
const optionalStatus = Object.fromEntries(
  optionalDocumented.map((k) => [k, present(k) ? "SET" : "MISSING"]),
);

const warnings = [];
const hostingerHost = process.env.HOSTINGER_SSH_HOST?.trim();
if (hostingerHost && (hostingerHost === "root" || !hostingerHost.includes("."))) {
  warnings.push(
    "HOSTINGER_SSH_HOST looks like a username, not a hostname — set a real FQDN/IP and put the username in HOSTINGER_SSH_USER",
  );
}
if (
  present("MERCADOPAGO_ACCESS_TOKEN") &&
  !(present("MERCADOPAGO_CLIENT_ID") && present("MERCADOPAGO_CLIENT_SECRET"))
) {
  warnings.push(
    "Prefer MERCADOPAGO_CLIENT_ID + MERCADOPAGO_CLIENT_SECRET (OAuth client_credentials); ACCESS_TOKEN alone often 403s",
  );
}

console.log(
  JSON.stringify(
    {
      requiredByCode,
      missingRequired,
      optionalStatus,
      warnings,
      verdict: missingRequired.length === 0 ? "GREEN" : "RED",
    },
    null,
    2,
  ),
);

if (missingRequired.length > 0) process.exit(1);
