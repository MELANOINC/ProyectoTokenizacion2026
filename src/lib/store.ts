import { createContractAddress, createId, createTxHash } from "@/lib/ids";
import { assertTxHash, isDemoLedgerMode } from "@/lib/ledger-mode";
import {
  insertMint,
  insertTransfer,
  loadPlatformState,
  upsertAsset,
  upsertInvestor,
  upsertWhitelist,
  insertKycReview,
} from "@/lib/store-db";
import { getSupabase } from "@/lib/supabase";
import type {
  Investor,
  KycStatus,
  LedgerStatus,
  MintRecord,
  PlatformState,
  TokenizedAsset,
  TransferRecord,
  WhitelistEntry,
  WhitelistStatus,
} from "@/lib/types";

/**
 * In-memory cache hydrated from Supabase when configured.
 * Without Supabase env, operates as the original ephemeral demo store.
 */
const globalForStore = globalThis as typeof globalThis & {
  __notoriusStore?: PlatformState;
  __notoriusHydrated?: boolean;
  __notoriusHydratePromise?: Promise<void>;
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
    status: "draft",
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
    status: "onchain",
    createdAt: new Date("2026-06-03T12:00:00.000Z").toISOString(),
  };

  const mint: MintRecord = {
    id: "mint_demo_1",
    assetId: asset.id,
    toWallet: investor.walletAddress,
    amount: 125_000,
    txHash: "0xabc123def456abc123def456abc123def456abc123def456abc123def456abcd",
    status: "confirmed",
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

async function hydrate(): Promise<void> {
  if (globalForStore.__notoriusHydrated) return;
  if (globalForStore.__notoriusHydratePromise) {
    await globalForStore.__notoriusHydratePromise;
    return;
  }

  globalForStore.__notoriusHydratePromise = (async () => {
    const client = getSupabase();
    if (client) {
      const remote = await loadPlatformState(client);
      if (remote) {
        globalForStore.__notoriusStore = remote;
      } else if (!globalForStore.__notoriusStore) {
        globalForStore.__notoriusStore = seedState();
      }
    } else if (!globalForStore.__notoriusStore) {
      globalForStore.__notoriusStore = seedState();
    }
    globalForStore.__notoriusHydrated = true;
  })();

  try {
    await globalForStore.__notoriusHydratePromise;
  } finally {
    globalForStore.__notoriusHydratePromise = undefined;
  }
}

function getState(): PlatformState {
  if (!globalForStore.__notoriusStore) {
    globalForStore.__notoriusStore = seedState();
  }
  return globalForStore.__notoriusStore;
}

function resolveTxHash(input?: string): { txHash: string; status: LedgerStatus } {
  if (input) {
    return { txHash: assertTxHash(input), status: "confirmed" };
  }
  if (isDemoLedgerMode()) {
    return { txHash: createTxHash(), status: "confirmed" };
  }
  throw new Error(
    "txHash is required — confirm the on-chain transaction before recording the ledger entry",
  );
}

export async function getSnapshot(): Promise<PlatformState> {
  await hydrate();
  const state = getState();
  return {
    assets: [...state.assets],
    investors: [...state.investors],
    whitelist: [...state.whitelist],
    mints: [...state.mints],
    transfers: [...state.transfers],
  };
}

export async function registerInvestor(input: {
  name: string;
  email: string;
  walletAddress: string;
}): Promise<Investor> {
  await hydrate();
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

  const client = getSupabase();
  if (client) await upsertInvestor(client, investor);

  return investor;
}

export async function reviewKyc(input: {
  investorId: string;
  decision: Extract<KycStatus, "approved" | "rejected">;
  reviewerId?: string | null;
  notes?: string | null;
}): Promise<Investor> {
  await hydrate();
  const state = getState();
  const investor = state.investors.find((i) => i.id === input.investorId);
  if (!investor) throw new Error("Investor not found");

  investor.kycStatus = input.decision;
  investor.kycReviewedAt = new Date().toISOString();
  investor.kycReviewedBy = input.reviewerId ?? null;
  if (input.decision === "rejected") {
    investor.whitelisted = false;
  }

  const client = getSupabase();
  if (client) {
    await upsertInvestor(client, investor);
    await insertKycReview(client, {
      id: createId("kyc"),
      investorId: investor.id,
      decision: input.decision,
      reviewerId: input.reviewerId ?? null,
      notes: input.notes ?? null,
      createdAt: investor.kycReviewedAt,
    });
  }

  return investor;
}

export async function addToWhitelist(input: {
  investorId: string;
  assetId: string;
  walletAddress?: string;
  onchainTxHash?: string;
}): Promise<WhitelistEntry> {
  await hydrate();
  const state = getState();
  const investor = state.investors.find((i) => i.id === input.investorId);
  if (!investor) throw new Error("Investor not found");
  if (investor.kycStatus !== "approved") {
    throw new Error("Investor KYC must be approved before whitelist");
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

  let status: WhitelistStatus = "requested";
  let onchainTxHash: string | null = null;
  if (input.onchainTxHash) {
    onchainTxHash = assertTxHash(input.onchainTxHash, "onchainTxHash");
    status = "onchain";
  } else if (isDemoLedgerMode()) {
    status = "onchain";
  }

  const entry: WhitelistEntry = {
    id: createId("wl"),
    investorId: investor.id,
    assetId: asset.id,
    walletAddress: wallet,
    onchainTxHash,
    status,
    createdAt: new Date().toISOString(),
  };
  investor.whitelisted = true;
  state.whitelist.unshift(entry);

  const client = getSupabase();
  if (client) {
    await upsertInvestor(client, investor);
    await upsertWhitelist(client, entry);
  }

  return entry;
}

export async function mintTokens(input: {
  assetId: string;
  toWallet: string;
  amount: number;
  txHash?: string;
  blockNumber?: number | null;
}): Promise<MintRecord> {
  await hydrate();
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

  if (!asset.contractAddress && isDemoLedgerMode()) {
    asset.contractAddress = createContractAddress();
  }

  const { txHash, status } = resolveTxHash(input.txHash);
  if (state.mints.some((m) => m.txHash === txHash)) {
    throw new Error("Mint with this txHash already recorded");
  }

  asset.mintedSupply += input.amount;
  const record: MintRecord = {
    id: createId("mint"),
    assetId: asset.id,
    toWallet: wallet,
    amount: input.amount,
    txHash,
    blockNumber: input.blockNumber ?? null,
    status,
    createdAt: new Date().toISOString(),
  };
  state.mints.unshift(record);

  const client = getSupabase();
  if (client) {
    await upsertAsset(client, asset);
    await insertMint(client, record);
  }

  return record;
}

export async function transferTokens(input: {
  assetId: string;
  fromWallet: string;
  toWallet: string;
  amount: number;
  txHash?: string;
  blockNumber?: number | null;
}): Promise<TransferRecord> {
  await hydrate();
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

  const fromBalance = await balanceOf(asset.id, from);
  if (fromBalance < input.amount) {
    throw new Error("Insufficient token balance");
  }

  const { txHash, status } = resolveTxHash(input.txHash);
  if (state.transfers.some((t) => t.txHash === txHash)) {
    throw new Error("Transfer with this txHash already recorded");
  }

  const record: TransferRecord = {
    id: createId("xfer"),
    assetId: asset.id,
    fromWallet: from,
    toWallet: to,
    amount: input.amount,
    txHash,
    blockNumber: input.blockNumber ?? null,
    status,
    createdAt: new Date().toISOString(),
  };
  state.transfers.unshift(record);

  const client = getSupabase();
  if (client) await insertTransfer(client, record);

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
  await hydrate();
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
    status: "draft",
    createdAt: new Date().toISOString(),
  };
  state.assets.unshift(asset);

  const client = getSupabase();
  if (client) await upsertAsset(client, asset);

  return asset;
}

export async function balanceOf(
  assetId: string,
  wallet: string,
): Promise<number> {
  await hydrate();
  const state = getState();
  const normalized = wallet.toLowerCase();
  const minted = state.mints
    .filter(
      (m) =>
        m.assetId === assetId &&
        m.toWallet === normalized &&
        m.status !== "failed",
    )
    .reduce((sum, m) => sum + m.amount, 0);
  const received = state.transfers
    .filter(
      (t) =>
        t.assetId === assetId &&
        t.toWallet === normalized &&
        t.status !== "failed",
    )
    .reduce((sum, t) => sum + t.amount, 0);
  const sent = state.transfers
    .filter(
      (t) =>
        t.assetId === assetId &&
        t.fromWallet === normalized &&
        t.status !== "failed",
    )
    .reduce((sum, t) => sum + t.amount, 0);
  return minted + received - sent;
}

/** Find investor by email or wallet (case-insensitive). */
export async function findInvestor(input: {
  email?: string;
  walletAddress?: string;
}): Promise<Investor | undefined> {
  await hydrate();
  const state = getState();
  return state.investors.find((i) => {
    if (
      input.email &&
      i.email.toLowerCase() === input.email.toLowerCase()
    ) {
      return true;
    }
    if (
      input.walletAddress &&
      i.walletAddress.toLowerCase() === input.walletAddress.toLowerCase()
    ) {
      return true;
    }
    return false;
  });
}
