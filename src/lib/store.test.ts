import assert from "node:assert/strict";
import { describe, it, before } from "node:test";
import {
  addToWhitelist,
  createAsset,
  getSnapshot,
  mintTokens,
  registerInvestor,
  setKycStatus,
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
    assert.ok(snap.mints.some((m) => m.ledgerSource === "demo"));
  });

  it("requires KYC approve before whitelist and labels demo vs onchain ledger", async () => {
    const snap = await getSnapshot();
    const baseAssetId = snap.assets[0]!.id;
    const wallet = "0x3333333333333333333333333333333333333333";

    const investor = await registerInvestor({
      name: "Audit User",
      email: `audit-${Date.now()}@example.com`,
      walletAddress: wallet,
    });
    assert.equal(investor.kycStatus, "pending");

    await assert.rejects(
      () =>
        addToWhitelist({
          investorId: investor.id,
          assetId: baseAssetId,
          walletAddress: wallet,
        }),
      /KYC must be approved/,
    );

    await setKycStatus(investor.id, "approved");

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
    const after = await getSnapshot();
    const demoInvestor = after.investors.find(
      (i) => i.walletAddress === demo,
    );
    assert.ok(demoInvestor);
    await addToWhitelist({
      investorId: demoInvestor!.id,
      assetId: asset.id,
      walletAddress: demo,
    });

    const demoMint = await mintTokens({
      assetId: asset.id,
      toWallet: wallet,
      amount: 100,
    });
    assert.equal(demoMint.ledgerSource, "demo");

    const onchainHash =
      "0x1111111111111111111111111111111111111111111111111111111111111111";
    const onchainMint = await mintTokens({
      assetId: asset.id,
      toWallet: wallet,
      amount: 50,
      txHash: onchainHash,
    });
    assert.equal(onchainMint.ledgerSource, "onchain");
    assert.equal(onchainMint.txHash, onchainHash);

    const xfer = await transferTokens({
      assetId: asset.id,
      fromWallet: wallet,
      toWallet: demo,
      amount: 25,
      txHash:
        "0x2222222222222222222222222222222222222222222222222222222222222222",
    });
    assert.equal(xfer.ledgerSource, "onchain");
    assert.equal(xfer.amount, 25);
  });

  it("reject KYC clears whitelist flag", async () => {
    const snap = await getSnapshot();
    const assetId = snap.assets[0]!.id;
    const wallet = "0x4444444444444444444444444444444444444444";
    const investor = await registerInvestor({
      name: "Reject User",
      email: `reject-${Date.now()}@example.com`,
      walletAddress: wallet,
    });
    await setKycStatus(investor.id, "approved");
    await addToWhitelist({
      investorId: investor.id,
      assetId,
      walletAddress: wallet,
    });
    const rejected = await setKycStatus(investor.id, "rejected");
    assert.equal(rejected.kycStatus, "rejected");
    assert.equal(rejected.whitelisted, false);
    const after = await getSnapshot();
    assert.ok(!after.whitelist.some((w) => w.investorId === investor.id));
  });
});
