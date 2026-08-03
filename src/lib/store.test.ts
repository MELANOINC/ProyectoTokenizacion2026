import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  addToWhitelist,
  createAsset,
  getSnapshot,
  mintTokens,
  registerInvestor,
  transferTokens,
} from "@/lib/store";

describe("tokenization store", () => {
  it("seeds demo asset and investor", async () => {
    const snap = await getSnapshot();
    assert.ok(snap.assets.some((a) => a.id === "asset_puerto_madero"));
    assert.ok(snap.investors.some((i) => i.id === "inv_demo_ana"));
  });

  it("registers, whitelists, mints and transfers", async () => {
    const wallet = "0x3333333333333333333333333333333333333333";
    const investor = await registerInvestor({
      name: "Audit User",
      email: `audit-${Date.now()}@example.com`,
      walletAddress: wallet,
    });
    const asset = await createAsset({
      name: "Audit Asset",
      class: "property",
      symbol: `AUD${Date.now().toString().slice(-4)}`,
      totalSupply: 10_000,
      issuerId: "issuer_audit",
      chain: "polygon",
    });
    await addToWhitelist({
      investorId: investor.id,
      assetId: asset.id,
      walletAddress: wallet,
    });
    const demo = "0x1111111111111111111111111111111111111111";
    const demoInvestor = (await getSnapshot()).investors.find(
      (i) => i.walletAddress === demo,
    );
    assert.ok(demoInvestor);
    await addToWhitelist({
      investorId: demoInvestor!.id,
      assetId: asset.id,
      walletAddress: demo,
    });

    const mint = await mintTokens({
      assetId: asset.id,
      toWallet: wallet,
      amount: 100,
    });
    assert.equal(mint.amount, 100);

    const xfer = await transferTokens({
      assetId: asset.id,
      fromWallet: wallet,
      toWallet: demo,
      amount: 25,
    });
    assert.equal(xfer.amount, 25);
  });
});
