import assert from "node:assert/strict";
import { describe, it, before } from "node:test";
import {
  addToWhitelist,
  getSnapshot,
  mintTokens,
  registerInvestor,
  transferTokens,
} from "@/lib/store";

describe("in-memory tokenization store", () => {
  before(() => {
    process.env.NOTORIUS_STORE = "memory";
  });

  it("seeds demo asset and investor", async () => {
    const snap = await getSnapshot();
    assert.ok(snap.assets.some((a) => a.symbol === "TNPM"));
    assert.ok(
      snap.investors.some(
        (i) => i.walletAddress === "0x1111111111111111111111111111111111111111",
      ),
    );
  });

  it("registers, whitelists, mints and transfers", async () => {
    const snap = await getSnapshot();
    const assetId = snap.assets[0]!.id;

    const investor = await registerInvestor({
      name: "Bruno Test",
      email: `bruno.${Date.now()}@example.com`,
      walletAddress: "0x2222222222222222222222222222222222222222",
    });

    await addToWhitelist({
      investorId: investor.id,
      assetId,
    });

    const mint = await mintTokens({
      assetId,
      toWallet: investor.walletAddress,
      amount: 10,
    });
    assert.equal(mint.amount, 10);

    // Demo wallet is already whitelisted for the demo asset
    const xfer = await transferTokens({
      assetId,
      fromWallet: "0x1111111111111111111111111111111111111111",
      toWallet: investor.walletAddress,
      amount: 5,
    });
    assert.equal(xfer.amount, 5);
  });
});
