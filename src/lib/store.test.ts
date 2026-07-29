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

describe("in-memory tokenization store", () => {
  it("seeds demo asset and investor", () => {
    const snap = getSnapshot();
    assert.ok(snap.assets.some((a) => a.id === "asset_puerto_madero"));
    assert.ok(snap.investors.some((i) => i.id === "inv_demo_ana"));
  });

  it("registers, whitelists, mints and transfers", () => {
    const wallet = "0x3333333333333333333333333333333333333333";
    const investor = registerInvestor({
      name: "Audit User",
      email: `audit-${Date.now()}@example.com`,
      walletAddress: wallet,
    });
    const asset = createAsset({
      name: "Audit Asset",
      class: "property",
      symbol: `AUD${Date.now().toString().slice(-4)}`,
      totalSupply: 10_000,
      issuerId: "issuer_audit",
      chain: "polygon",
    });
    addToWhitelist({
      investorId: investor.id,
      assetId: asset.id,
      walletAddress: wallet,
    });
    // also whitelist demo wallet as counterparty for transfer out later
    const demo = "0x1111111111111111111111111111111111111111";
    const demoInvestor = getSnapshot().investors.find(
      (i) => i.walletAddress === demo,
    );
    assert.ok(demoInvestor);
    addToWhitelist({
      investorId: demoInvestor!.id,
      assetId: asset.id,
      walletAddress: demo,
    });

    const mint = mintTokens({
      assetId: asset.id,
      toWallet: wallet,
      amount: 100,
    });
    assert.equal(mint.amount, 100);

    const xfer = transferTokens({
      assetId: asset.id,
      fromWallet: wallet,
      toWallet: demo,
      amount: 25,
    });
    assert.equal(xfer.amount, 25);
  });
});
