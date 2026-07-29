import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { probeIntegrations } from "./integrations";

describe("probeIntegrations hostinger validation", () => {
  it("marks hostinger RED when HOSTINGER_SSH_HOST is a username", async () => {
    const prev = {
      HOSTINGER_SSH_HOST: process.env.HOSTINGER_SSH_HOST,
      HOSTINGER_SSH_USER: process.env.HOSTINGER_SSH_USER,
      HOSTINGER_SSH_PRIVATE_KEY: process.env.HOSTINGER_SSH_PRIVATE_KEY,
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      SUPABASE_URL: process.env.SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      MERCADOPAGO_CLIENT_ID: process.env.MERCADOPAGO_CLIENT_ID,
      MERCADOPAGO_CLIENT_SECRET: process.env.MERCADOPAGO_CLIENT_SECRET,
      MERCADOPAGO_ACCESS_TOKEN: process.env.MERCADOPAGO_ACCESS_TOKEN,
    };

    process.env.HOSTINGER_SSH_HOST = "root";
    delete process.env.HOSTINGER_SSH_USER;
    delete process.env.HOSTINGER_SSH_PRIVATE_KEY;
    // Avoid network calls for unrelated probes in this unit assertion path
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    delete process.env.MERCADOPAGO_CLIENT_ID;
    delete process.env.MERCADOPAGO_CLIENT_SECRET;
    delete process.env.MERCADOPAGO_ACCESS_TOKEN;

    try {
      const report = await probeIntegrations();
      const hostinger = report.probes.find((p) => p.name === "hostinger");
      assert.ok(hostinger);
      assert.equal(hostinger.status, "RED");
      assert.match(hostinger.detail, /hostname/i);
      assert.equal(report.opsVerdict, "RED");
      assert.equal(report.appVerdict, "GREEN");
    } finally {
      for (const [key, value] of Object.entries(prev)) {
        if (value === undefined) delete process.env[key];
        else process.env[key] = value;
      }
    }
  });
});
