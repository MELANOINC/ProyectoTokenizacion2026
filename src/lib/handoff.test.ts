import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { authorizeEcosystemHandoff } from "@/lib/ecosystem-handoff-auth";
import { processHandoff } from "@/lib/handoff";
import { getSnapshot } from "@/lib/store";

describe("ecosystem handoff", () => {
  it("creates pending-KYC investor without auto-whitelist", async () => {
    const stamp = Date.now().toString(16).padStart(12, "0");
    const email = `handoff-${stamp}@melano.demo`;
    const wallet = `0x${stamp}${"b".repeat(28)}`.slice(0, 42);
    const result = await processHandoff({
      source: "luxia",
      name: "Handoff Test",
      email,
      walletAddress: wallet,
      assetId: "asset_puerto_madero",
      payload: { test: true },
    });

    assert.equal(result.investor.email, email);
    assert.equal(result.investor.kycStatus, "pending");
    assert.equal(result.whitelisted, false);
    assert.equal(result.status, "investor_created");

    const snap = await getSnapshot();
    assert.ok(snap.investors.some((i) => i.email === email));
  });

  it("requires ECOSYSTEM_HANDOFF_SECRET in production", () => {
    const prevEnv = process.env.NODE_ENV;
    const prevSecret = process.env.ECOSYSTEM_HANDOFF_SECRET;
    try {
      process.env.NODE_ENV = "production";
      delete process.env.ECOSYSTEM_HANDOFF_SECRET;
      const denied = authorizeEcosystemHandoff(
        new Request("http://localhost/api/ecosystem/handoff", { method: "POST" }),
      );
      assert.equal(denied.ok, false);
      if (!denied.ok) assert.equal(denied.status, 503);

      process.env.ECOSYSTEM_HANDOFF_SECRET = "test-secret";
      const unauthorized = authorizeEcosystemHandoff(
        new Request("http://localhost/api/ecosystem/handoff", { method: "POST" }),
      );
      assert.equal(unauthorized.ok, false);

      const ok = authorizeEcosystemHandoff(
        new Request("http://localhost/api/ecosystem/handoff", {
          method: "POST",
          headers: { "x-melano-handoff-secret": "test-secret" },
        }),
      );
      assert.equal(ok.ok, true);
    } finally {
      process.env.NODE_ENV = prevEnv;
      if (prevSecret === undefined) delete process.env.ECOSYSTEM_HANDOFF_SECRET;
      else process.env.ECOSYSTEM_HANDOFF_SECRET = prevSecret;
    }
  });
});
