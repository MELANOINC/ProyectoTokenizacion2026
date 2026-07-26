import { createContractAddress, createId, createTxHash } from "@/lib/ids";
import type {
  Investor,
  MintRecord,
  PlatformState,
  TokenizedAsset,
  TransferRecord,
  WhitelistEntry,
} from "@/lib/types";

/**
 * In-memory store for the v1 scaffold.
 * Render's filesystem is ephemeral — replace with a managed SQL DB or object storage before production.
 */
const globalForStore = globalThis as typeof globalThis & {
  __notoriusStore?: PlatformState;
};

function seedState(): PlatformState {
  const issuerId = "issuer_demo";
  const asset: TokenizedAsset = {
    id: "asset_puerto_madero",
    name: "Torre Núñez — Puerto Madero",
    class: "property",
    symbol: "TNPM",
    totalSupply: 1_000_000,
    mintedSupply: 125_000,
    issuerId,
    chain: "polygon",
    contractAddress: "0x3643a11c0de0f0a0b0c0d0e0f0a1b2c3d4e5f678",
    createdAt: new Date("2026-06-01T12:00:00.000Z").toISOString(),
  };

  const investor: Investor = {
    id: "inv_demo_ana",
    name: "Ana Ríos",
    email: "ana@example.com",
    walletAddress: "0x1111111111111111111111111111111111111111",
    kycStatus: "approved",
    whitelisted: true,
    createdAt: new Date("2026-06-02T12:00:00.000Z").toISOString(),
  };

  const whitelist: WhitelistEntry = {
    id: "wl_demo_1",
    investorId: investor.id,
    assetId: asset.id,
    walletAddress: investor.walletAddress,
    createdAt: new Date("2026-06-03T12:00:00.000Z").toISOString(),
  };

  const mint: MintRecord = {
    id: "mint_demo_1",
    assetId: asset.id,
    toWallet: investor.walletAddress,
    amount: 125_000,
    txHash: "0xabc123def456abc123def456abc123def456abc123def456abc123def456abcd",
    createdAt: new Date("2026-06-04T12:00:00.000Z").toISOString(),
  };

  return {
    assets: [asset],
    investors: [investor],
    whitelist: [whitelist],
    mints: [mint],
    transfers: [],
  };
}

function getState(): PlatformState {
  if (!globalForStore.__notoriusStore) {
    globalForStore.__notoriusStore = seedState();
  }
  return globalForStore.__notoriusStore;
}

export function getSnapshot(): PlatformState {
  const state = getState();
  return {
    assets: [...state.assets],
    investors: [...state.investors],
    whitelist: [...state.whitelist],
    mints: [...state.mints],
    transfers: [...state.transfers],
  };
}

export function registerInvestor(input: {
  name: string;
  email: string;
  walletAddress: string;
}): Investor {
  const state = getState();
  const existing = state.investors.find(
    (i) =>
      i.email.toLowerCase() === input.email.toLowerCase() ||
      i.walletAddress.toLowerCase() === input.walletAddress.toLowerCase(),
  );
  if (existing) {
    throw new Error("Investor already registered with this email or wallet");
  }

  const investor: Investor = {
    id: createId("inv"),
    name: input.name,
    email: input.email.toLowerCase(),
    walletAddress: input.walletAddress.toLowerCase(),
    kycStatus: "pending",
    whitelisted: false,
    createdAt: new Date().toISOString(),
  };
  state.investors.unshift(investor);
  return investor;
}

export function addToWhitelist(input: {
  investorId: string;
  assetId: string;
  walletAddress?: string;
}): WhitelistEntry {
  const state = getState();
  const investor = state.investors.find((i) => i.id === input.investorId);
  if (!investor) throw new Error("Investor not found");
  if (investor.kycStatus !== "approved") {
    investor.kycStatus = "approved";
  }

  const asset = state.assets.find((a) => a.id === input.assetId);
  if (!asset) throw new Error("Asset not found");

  const wallet = (input.walletAddress ?? investor.walletAddress).toLowerCase();
  const duplicate = state.whitelist.find(
    (w) =>
      w.assetId === input.assetId &&
      w.walletAddress.toLowerCase() === wallet,
  );
  if (duplicate) return duplicate;

  const entry: WhitelistEntry = {
    id: createId("wl"),
    investorId: investor.id,
    assetId: asset.id,
    walletAddress: wallet,
    createdAt: new Date().toISOString(),
  };
  investor.whitelisted = true;
  state.whitelist.unshift(entry);
  return entry;
}

export function mintTokens(input: {
  assetId: string;
  toWallet: string;
  amount: number;
}): MintRecord {
  const state = getState();
  const asset = state.assets.find((a) => a.id === input.assetId);
  if (!asset) throw new Error("Asset not found");

  const wallet = input.toWallet.toLowerCase();
  const allowed = state.whitelist.some(
    (w) =>
      w.assetId === asset.id && w.walletAddress.toLowerCase() === wallet,
  );
  if (!allowed) {
    throw new Error("Wallet is not whitelisted for this asset");
  }

  if (asset.mintedSupply + input.amount > asset.totalSupply) {
    throw new Error("Mint would exceed total supply");
  }

  if (!asset.contractAddress) {
    asset.contractAddress = createContractAddress();
  }

  asset.mintedSupply += input.amount;
  const record: MintRecord = {
    id: createId("mint"),
    assetId: asset.id,
    toWallet: wallet,
    amount: input.amount,
    txHash: createTxHash(),
    createdAt: new Date().toISOString(),
  };
  state.mints.unshift(record);
  return record;
}

export function transferTokens(input: {
  assetId: string;
  fromWallet: string;
  toWallet: string;
  amount: number;
}): TransferRecord {
  const state = getState();
  const asset = state.assets.find((a) => a.id === input.assetId);
  if (!asset) throw new Error("Asset not found");

  const from = input.fromWallet.toLowerCase();
  const to = input.toWallet.toLowerCase();

  const fromAllowed = state.whitelist.some(
    (w) => w.assetId === asset.id && w.walletAddress.toLowerCase() === from,
  );
  const toAllowed = state.whitelist.some(
    (w) => w.assetId === asset.id && w.walletAddress.toLowerCase() === to,
  );
  if (!fromAllowed || !toAllowed) {
    throw new Error("Both wallets must be whitelisted for controlled transfers");
  }

  const fromBalance = balanceOf(asset.id, from);
  if (fromBalance < input.amount) {
    throw new Error("Insufficient token balance");
  }

  const record: TransferRecord = {
    id: createId("xfer"),
    assetId: asset.id,
    fromWallet: from,
    toWallet: to,
    amount: input.amount,
    txHash: createTxHash(),
    createdAt: new Date().toISOString(),
  };
  state.transfers.unshift(record);
  return record;
}

export function createAsset(input: {
  name: string;
  class: TokenizedAsset["class"];
  symbol: string;
  totalSupply: number;
  issuerId: string;
  chain: TokenizedAsset["chain"];
}): TokenizedAsset {
  const state = getState();
  if (state.assets.some((a) => a.symbol === input.symbol)) {
    throw new Error("Asset symbol already exists");
  }

  const asset: TokenizedAsset = {
    id: createId("asset"),
    name: input.name,
    class: input.class,
    symbol: input.symbol.toUpperCase(),
    totalSupply: input.totalSupply,
    mintedSupply: 0,
    issuerId: input.issuerId,
    chain: input.chain,
    contractAddress: null,
    createdAt: new Date().toISOString(),
  };
  state.assets.unshift(asset);
  return asset;
}

export function balanceOf(assetId: string, wallet: string): number {
  const state = getState();
  const normalized = wallet.toLowerCase();
  const minted = state.mints
    .filter((m) => m.assetId === assetId && m.toWallet === normalized)
    .reduce((sum, m) => sum + m.amount, 0);
  const received = state.transfers
    .filter((t) => t.assetId === assetId && t.toWallet === normalized)
    .reduce((sum, t) => sum + t.amount, 0);
  const sent = state.transfers
    .filter((t) => t.assetId === assetId && t.fromWallet === normalized)
    .reduce((sum, t) => sum + t.amount, 0);
  return minted + received - sent;
}
