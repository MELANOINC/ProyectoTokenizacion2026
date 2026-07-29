import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  createAssetSchema,
  mintSchema,
  registerInvestorSchema,
  transferSchema,
  whitelistSchema,
} from "@/lib/validation";

describe("validation schemas", () => {
  it("accepts a valid investor registration", () => {
    const parsed = registerInvestorSchema.parse({
      name: "Ana Ríos",
      email: "ana@example.com",
      walletAddress: "0x1111111111111111111111111111111111111111",
    });
    assert.equal(parsed.email, "ana@example.com");
  });

  it("rejects invalid wallets", () => {
    assert.throws(() =>
      mintSchema.parse({
        assetId: "asset_1",
        toWallet: "not-a-wallet",
        amount: 10,
      }),
    );
  });

  it("accepts mint / whitelist / transfer payloads", () => {
    const wallet = "0x2222222222222222222222222222222222222222";
    assert.equal(
      whitelistSchema.parse({
        investorId: "inv_1",
        assetId: "asset_1",
        walletAddress: wallet,
      }).investorId,
      "inv_1",
    );
    assert.equal(
      mintSchema.parse({ assetId: "asset_1", toWallet: wallet, amount: 5 })
        .amount,
      5,
    );
    assert.equal(
      transferSchema.parse({
        assetId: "asset_1",
        fromWallet: wallet,
        toWallet: "0x1111111111111111111111111111111111111111",
        amount: 1,
      }).amount,
      1,
    );
  });

  it("normalizes asset creation defaults", () => {
    const asset = createAssetSchema.parse({
      name: "Torre Demo",
      class: "property",
      symbol: "TDEM",
      totalSupply: 1000,
      issuerId: "issuer_1",
    });
    assert.equal(asset.chain, "polygon");
  });
});
