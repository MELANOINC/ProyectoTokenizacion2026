import { createContractAddress, createId, createTxHash } from "@/lib/ids";
import { getSupabaseConfig } from "@/lib/supabase/config";
import {
  loadPlatformFromSupabase,
  persistAsset,
  persistInvestor,
  persistInvestorKyc,
  persistMint,
  persistTransfer,
  persistWhitelistEntry,
} from "@/lib/supabase/repository";
import type {
  Investor,
  MintRecord,
  PlatformState,
  TokenizedAsset,
  TransferRecord,
  WhitelistEntry,
} from "@/lib/types";
import { randomUUID } from "crypto";

/**
 * Platform store: in-memory with optional Supabase dual-write
 * (assets / investors / tokenizations / investments).
 * Whitelist + transfers stay in-memory until dedicated tables exist.
 */
const globalForStore = globalThis as typeof globalThis & {
  __notoriusStore?: PlatformState;
  __notoriusHydrate?: Promise<void>;
};

function entityId(prefix: string): string {
  if (getSupabaseConfig()) return randomUUID();
  return createId(prefix);
}

function seedState(): PlatformState {
  const useUuid = Boolean(getSupabaseConfig());
  const issuerId = useUuid
    ? (getSupabaseConfig()?.companyId ?? "issuer_demo")
    : "issuer_demo";

  const asset: TokenizedAsset = {
    id: useUuid
      ? "a1111111-1111-4111-8111-111111111111"
      : "asset_puerto_madero",
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
    id: useUuid
      ? "b2222222-2222-4222-8222-222222222222"
      : "inv_demo_ana",
    name: "Ana Ríos",
    email: "ana@example.com",
    walletAddress: "0x1111111111111111111111111111111111111111",
    kycStatus: "approved",
    whitelisted: true,
    createdAt: new Date("2026-06-02T12:00:00.000Z").toISOString(),
  };

  const whitelist: WhitelistEntry = {
    id: useUuid
      ? "c3333333-3333-4333-8333-333333333333"
      : "wl_demo_1",
    investorId: investor.id,
    assetId: asset.id,
    walletAddress: investor.walletAddress,
    createdAt: new Date("2026-06-03T12:00:00.000Z").toISOString(),
  };

  const mint: MintRecord = {
    id: useUuid
      ? "d4444444-4444-4444-8444-444444444444"
      : "mint_demo_1",
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

async function hydrateFromSupabase(state: PlatformState): Promise<void> {
  try {
    const remote = await loadPlatformFromSupabase();
    if (!remote) return;

    if (remote.assets.length > 0) {
      state.assets = remote.assets;
    } else if (state.assets[0]) {
      await persistAsset(state.assets[0]).catch(() => undefined);
    }

    if (remote.investors.length > 0) {
      state.investors = remote.investors;
    } else if (state.investors[0]) {
      await persistInvestor(state.investors[0]).catch(() => undefined);
    }

    if (remote.whitelist.length > 0) {
      state.whitelist = remote.whitelist;
    } else if (state.whitelist[0]) {
      await persistWhitelistEntry(state.whitelist[0]).catch(() => undefined);
    }

    if (remote.mints.length > 0) {
      state.mints = remote.mints;
    } else if (state.mints[0] && state.investors[0]) {
      await persistMint({
        assetId: state.mints[0].assetId,
        investorId: state.investors[0].id,
        amount: state.mints[0].amount,
        createdAt: state.mints[0].createdAt,
      }).catch(() => undefined);
    }

    if (remote.transfers.length > 0) {
      state.transfers = remote.transfers;
    }
  } catch {
    // Keep seed / memory state when remote is unreachable.
  }
}

function getState(): PlatformState {
  if (!globalForStore.__notoriusStore) {
    globalForStore.__notoriusStore = seedState();
  }
  return globalForStore.__notoriusStore;
}

async function ensureReady(): Promise<PlatformState> {
  const state = getState();
  if (!getSupabaseConfig()) return state;

  if (!globalForStore.__notoriusHydrate) {
    globalForStore.__notoriusHydrate = hydrateFromSupabase(state);
  }
  await globalForStore.__notoriusHydrate;
  return state;
}

function snapshotOf(state: PlatformState): PlatformState {
  return {
    assets: [...state.assets],
    investors: [...state.investors],
    whitelist: [...state.whitelist],
    mints: [...state.mints],
    transfers: [...state.transfers],
  };
}

export async function getSnapshot(): Promise<PlatformState> {
  const state = await ensureReady();
  return snapshotOf(state);
}

export function getPersistenceMode(): "supabase" | "memory" {
  return getSupabaseConfig() ? "supabase" : "memory";
}

export async function registerInvestor(input: {
  name: string;
  email: string;
  walletAddress: string;
}): Promise<Investor> {
  const state = await ensureReady();
  const existing = state.investors.find(
    (i) =>
      i.email.toLowerCase() === input.email.toLowerCase() ||
      i.walletAddress.toLowerCase() === input.walletAddress.toLowerCase(),
  );
  if (existing) {
    throw new Error("Investor already registered with this email or wallet");
  }

  const investor: Investor = {
    id: entityId("inv"),
    name: input.name,
    email: input.email.toLowerCase(),
    walletAddress: input.walletAddress.toLowerCase(),
    kycStatus: "pending",
    whitelisted: false,
    createdAt: new Date().toISOString(),
  };
  state.investors.unshift(investor);
  await persistInvestor(investor).catch(() => undefined);
  return investor;
}

export async function addToWhitelist(input: {
  investorId: string;
  assetId: string;
  walletAddress?: string;
}): Promise<WhitelistEntry> {
  const state = await ensureReady();
  const investor = state.investors.find((i) => i.id === input.investorId);
  if (!investor) throw new Error("Investor not found");
  if (investor.kycStatus !== "approved") {
    investor.kycStatus = "approved";
    await persistInvestorKyc(investor.id, "approved").catch(() => undefined);
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
    id: entityId("wl"),
    investorId: investor.id,
    assetId: asset.id,
    walletAddress: wallet,
    createdAt: new Date().toISOString(),
  };
  investor.whitelisted = true;
  state.whitelist.unshift(entry);
  await persistWhitelistEntry(entry).catch(() => undefined);
  return entry;
}

export async function mintTokens(input: {
  assetId: string;
  toWallet: string;
  amount: number;
}): Promise<MintRecord> {
  const state = await ensureReady();
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
    id: entityId("mint"),
    assetId: asset.id,
    toWallet: wallet,
    amount: input.amount,
    txHash: createTxHash(),
    createdAt: new Date().toISOString(),
  };
  state.mints.unshift(record);

  const investor = state.investors.find(
    (i) => i.walletAddress.toLowerCase() === wallet,
  );
  if (investor) {
    const remoteId = await persistMint({
      assetId: asset.id,
      investorId: investor.id,
      amount: input.amount,
      createdAt: record.createdAt,
    }).catch(() => null);
    if (remoteId) record.id = remoteId;
  }

  return record;
}

export async function transferTokens(input: {
  assetId: string;
  fromWallet: string;
  toWallet: string;
  amount: number;
}): Promise<TransferRecord> {
  const state = await ensureReady();
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

  const fromBalance = balanceOfSync(state, asset.id, from);
  if (fromBalance < input.amount) {
    throw new Error("Insufficient token balance");
  }

  const record: TransferRecord = {
    id: entityId("xfer"),
    assetId: asset.id,
    fromWallet: from,
    toWallet: to,
    amount: input.amount,
    txHash: createTxHash(),
    createdAt: new Date().toISOString(),
  };
  state.transfers.unshift(record);
  await persistTransfer(record).catch(() => undefined);
  return record;
}

export async function createAsset(input: {
  name: string;
  class: TokenizedAsset["class"];
  symbol: string;
  totalSupply: number;
  issuerId: string;
  chain: TokenizedAsset["chain"];
}): Promise<TokenizedAsset> {
  const state = await ensureReady();
  if (state.assets.some((a) => a.symbol === input.symbol)) {
    throw new Error("Asset symbol already exists");
  }

  const config = getSupabaseConfig();
  const asset: TokenizedAsset = {
    id: entityId("asset"),
    name: input.name,
    class: input.class,
    symbol: input.symbol.toUpperCase(),
    totalSupply: input.totalSupply,
    mintedSupply: 0,
    issuerId: config?.companyId ?? input.issuerId,
    chain: input.chain,
    contractAddress: null,
    createdAt: new Date().toISOString(),
  };
  state.assets.unshift(asset);
  await persistAsset(asset).catch(() => undefined);
  return asset;
}

function balanceOfSync(
  state: PlatformState,
  assetId: string,
  wallet: string,
): number {
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

export async function balanceOf(
  assetId: string,
  wallet: string,
): Promise<number> {
  const state = await ensureReady();
  return balanceOfSync(state, assetId, wallet);
}
