import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { processHandoff } from "@/lib/handoff";
import { getSnapshot } from "@/lib/store";

describe("ecosystem handoff", () => {
  it("creates investor and whitelists from luxia lead", async () => {
    const email = `handoff-${Date.now()}@melano.demo`;
    const result = await processHandoff({
      source: "luxia",
      name: "Handoff Test",
      email,
      autoWhitelist: true,
      assetId: "asset_puerto_madero",
      payload: { test: true },
    });

    assert.equal(result.investor.email, email);
    assert.equal(result.whitelisted, true);
    assert.ok(
      result.handoff.status === "whitelisted" ||
        result.handoff.status === "investor_created",
    );

    const snap = await getSnapshot();
    assert.ok(snap.investors.some((i) => i.email === email));
    assert.ok(
      snap.whitelist.some(
        (w) =>
          w.investorId === result.investor.id &&
          w.assetId === "asset_puerto_madero",
      ),
    );
  });
});
