import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  Investor,
  KycReview,
  LedgerStatus,
  MintRecord,
  PlatformState,
  TokenizedAsset,
  TransferRecord,
  WhitelistEntry,
  WhitelistStatus,
} from "@/lib/types";

type AssetRow = {
  id: string;
  name: string;
  class: TokenizedAsset["class"];
  symbol: string;
  total_supply: number | string;
  minted_supply: number | string;
  issuer_id: string;
  chain: TokenizedAsset["chain"];
  contract_address: string | null;
  identity_registry_address?: string | null;
  deploy_tx_hash?: string | null;
  chain_id?: number | null;
  status?: TokenizedAsset["status"];
  created_at: string;
};

type InvestorRow = {
  id: string;
  name: string;
  email: string;
  wallet_address: string;
  kyc_status: Investor["kycStatus"];
  whitelisted: boolean;
  country_code?: string | null;
  kyc_reviewed_at?: string | null;
  kyc_reviewed_by?: string | null;
  created_at: string;
};

type WhitelistRow = {
  id: string;
  investor_id: string;
  asset_id: string;
  wallet_address: string;
  onchain_tx_hash?: string | null;
  status?: WhitelistStatus;
  created_at: string;
};

type MintRow = {
  id: string;
  asset_id: string;
  to_wallet: string;
  amount: number | string;
  tx_hash: string;
  block_number?: number | string | null;
  status?: LedgerStatus;
  created_at: string;
};

type TransferRow = {
  id: string;
  asset_id: string;
  from_wallet: string;
  to_wallet: string;
  amount: number | string;
  tx_hash: string;
  block_number?: number | string | null;
  status?: LedgerStatus;
  created_at: string;
};

function num(value: number | string): number {
  return typeof value === "number" ? value : Number(value);
}

export async function loadPlatformState(
  client: SupabaseClient,
): Promise<PlatformState | null> {
  const [assetsRes, investorsRes, whitelistRes, mintsRes, transfersRes] =
    await Promise.all([
      client.from("notorius_assets").select("*").order("created_at", {
        ascending: false,
      }),
      client.from("notorius_investors").select("*").order("created_at", {
        ascending: false,
      }),
      client.from("notorius_whitelist").select("*").order("created_at", {
        ascending: false,
      }),
      client.from("notorius_mints").select("*").order("created_at", {
        ascending: false,
      }),
      client.from("notorius_transfers").select("*").order("created_at", {
        ascending: false,
      }),
    ]);

  if (assetsRes.error || investorsRes.error) {
    console.error(
      "[notorius] loadPlatformState",
      assetsRes.error ?? investorsRes.error,
    );
    return null;
  }

  const assets = ((assetsRes.data ?? []) as AssetRow[]).map(
    (row): TokenizedAsset => ({
      id: row.id,
      name: row.name,
      class: row.class,
      symbol: row.symbol,
      totalSupply: num(row.total_supply),
      mintedSupply: num(row.minted_supply),
      issuerId: row.issuer_id,
      chain: row.chain,
      contractAddress: row.contract_address,
      identityRegistryAddress: row.identity_registry_address ?? null,
      deployTxHash: row.deploy_tx_hash ?? null,
      chainId: row.chain_id ?? null,
      status: row.status ?? "draft",
      createdAt: row.created_at,
    }),
  );

  if (assets.length === 0) return null;

  const investors = ((investorsRes.data ?? []) as InvestorRow[]).map(
    (row): Investor => ({
      id: row.id,
      name: row.name,
      email: row.email,
      walletAddress: row.wallet_address,
      kycStatus: row.kyc_status,
      whitelisted: row.whitelisted,
      countryCode: row.country_code ?? null,
      kycReviewedAt: row.kyc_reviewed_at ?? null,
      kycReviewedBy: row.kyc_reviewed_by ?? null,
      createdAt: row.created_at,
    }),
  );

  const whitelist = ((whitelistRes.data ?? []) as WhitelistRow[]).map(
    (row): WhitelistEntry => ({
      id: row.id,
      investorId: row.investor_id,
      assetId: row.asset_id,
      walletAddress: row.wallet_address,
      onchainTxHash: row.onchain_tx_hash ?? null,
      status: row.status ?? "requested",
      createdAt: row.created_at,
    }),
  );

  const mints = ((mintsRes.data ?? []) as MintRow[]).map(
    (row): MintRecord => ({
      id: row.id,
      assetId: row.asset_id,
      toWallet: row.to_wallet,
      amount: num(row.amount),
      txHash: row.tx_hash,
      blockNumber:
        row.block_number === null || row.block_number === undefined
          ? null
          : num(row.block_number),
      status: row.status ?? "confirmed",
      createdAt: row.created_at,
    }),
  );

  const transfers = ((transfersRes.data ?? []) as TransferRow[]).map(
    (row): TransferRecord => ({
      id: row.id,
      assetId: row.asset_id,
      fromWallet: row.from_wallet,
      toWallet: row.to_wallet,
      amount: num(row.amount),
      txHash: row.tx_hash,
      blockNumber:
        row.block_number === null || row.block_number === undefined
          ? null
          : num(row.block_number),
      status: row.status ?? "confirmed",
      createdAt: row.created_at,
    }),
  );

  return { assets, investors, whitelist, mints, transfers };
}

export async function upsertAsset(
  client: SupabaseClient,
  asset: TokenizedAsset,
): Promise<void> {
  const { error } = await client.from("notorius_assets").upsert({
    id: asset.id,
    name: asset.name,
    class: asset.class,
    symbol: asset.symbol,
    total_supply: asset.totalSupply,
    minted_supply: asset.mintedSupply,
    issuer_id: asset.issuerId,
    chain: asset.chain,
    contract_address: asset.contractAddress,
    identity_registry_address: asset.identityRegistryAddress ?? null,
    deploy_tx_hash: asset.deployTxHash ?? null,
    chain_id: asset.chainId ?? null,
    status: asset.status ?? "draft",
    created_at: asset.createdAt,
    updated_at: new Date().toISOString(),
  });
  if (error) throw new Error(`DB asset upsert: ${error.message}`);
}

export async function upsertInvestor(
  client: SupabaseClient,
  investor: Investor,
): Promise<void> {
  const { error } = await client.from("notorius_investors").upsert({
    id: investor.id,
    name: investor.name,
    email: investor.email,
    wallet_address: investor.walletAddress,
    kyc_status: investor.kycStatus,
    whitelisted: investor.whitelisted,
    country_code: investor.countryCode ?? null,
    kyc_reviewed_at: investor.kycReviewedAt ?? null,
    kyc_reviewed_by: investor.kycReviewedBy ?? null,
    created_at: investor.createdAt,
    updated_at: new Date().toISOString(),
  });
  if (error) throw new Error(`DB investor upsert: ${error.message}`);
}

export async function upsertWhitelist(
  client: SupabaseClient,
  entry: WhitelistEntry,
): Promise<void> {
  const { error } = await client.from("notorius_whitelist").upsert({
    id: entry.id,
    investor_id: entry.investorId,
    asset_id: entry.assetId,
    wallet_address: entry.walletAddress,
    onchain_tx_hash: entry.onchainTxHash ?? null,
    status: entry.status ?? "requested",
    created_at: entry.createdAt,
    updated_at: new Date().toISOString(),
  });
  if (error) throw new Error(`DB whitelist upsert: ${error.message}`);
}

export async function insertMint(
  client: SupabaseClient,
  mint: MintRecord,
): Promise<void> {
  const { error } = await client.from("notorius_mints").insert({
    id: mint.id,
    asset_id: mint.assetId,
    to_wallet: mint.toWallet,
    amount: mint.amount,
    tx_hash: mint.txHash,
    block_number: mint.blockNumber ?? null,
    status: mint.status ?? "confirmed",
    created_at: mint.createdAt,
  });
  if (error) throw new Error(`DB mint insert: ${error.message}`);
}

export async function insertTransfer(
  client: SupabaseClient,
  transfer: TransferRecord,
): Promise<void> {
  const { error } = await client.from("notorius_transfers").insert({
    id: transfer.id,
    asset_id: transfer.assetId,
    from_wallet: transfer.fromWallet,
    to_wallet: transfer.toWallet,
    amount: transfer.amount,
    tx_hash: transfer.txHash,
    block_number: transfer.blockNumber ?? null,
    status: transfer.status ?? "confirmed",
    created_at: transfer.createdAt,
  });
  if (error) throw new Error(`DB transfer insert: ${error.message}`);
}

export async function insertKycReview(
  client: SupabaseClient,
  review: KycReview,
): Promise<void> {
  const { error } = await client.from("notorius_kyc_reviews").insert({
    id: review.id,
    investor_id: review.investorId,
    decision: review.decision,
    reviewer_id: review.reviewerId ?? null,
    notes: review.notes ?? null,
    created_at: review.createdAt,
  });
  if (error) throw new Error(`DB kyc review insert: ${error.message}`);
}

export async function insertChainEvent(
  client: SupabaseClient,
  event: {
    assetId?: string | null;
    eventName: string;
    txHash: string;
    blockNumber?: number | null;
    logIndex?: number | null;
    payload?: Record<string, unknown>;
  },
): Promise<void> {
  const { error } = await client.from("notorius_chain_events").upsert(
    {
      asset_id: event.assetId ?? null,
      event_name: event.eventName,
      tx_hash: event.txHash,
      block_number: event.blockNumber ?? null,
      log_index: event.logIndex ?? null,
      payload: event.payload ?? {},
    },
    { onConflict: "tx_hash,log_index" },
  );
  if (error) throw new Error(`DB chain event insert: ${error.message}`);
}

export type HandoffRecord = {
  id: string;
  source: "alenya" | "luxia" | "brunomelano" | "manual";
  externalId?: string | null;
  leadName?: string | null;
  leadEmail?: string | null;
  leadPhone?: string | null;
  walletAddress?: string | null;
  assetId?: string | null;
  payload: Record<string, unknown>;
  status:
    | "received"
    | "investor_created"
    | "whitelisted"
    | "minted"
    | "rejected"
    | "error";
  investorId?: string | null;
  errorMessage?: string | null;
  createdAt: string;
  updatedAt: string;
};

export async function insertHandoff(
  client: SupabaseClient,
  handoff: HandoffRecord,
): Promise<void> {
  const { error } = await client.from("notorius_handoffs").insert({
    id: handoff.id,
    source: handoff.source,
    external_id: handoff.externalId ?? null,
    lead_name: handoff.leadName ?? null,
    lead_email: handoff.leadEmail ?? null,
    lead_phone: handoff.leadPhone ?? null,
    wallet_address: handoff.walletAddress ?? null,
    asset_id: handoff.assetId ?? null,
    payload: handoff.payload,
    status: handoff.status,
    investor_id: handoff.investorId ?? null,
    error_message: handoff.errorMessage ?? null,
    created_at: handoff.createdAt,
    updated_at: handoff.updatedAt,
  });
  if (error) throw new Error(`DB handoff insert: ${error.message}`);
}

export async function updateHandoff(
  client: SupabaseClient,
  id: string,
  patch: Partial<
    Pick<HandoffRecord, "status" | "investorId" | "errorMessage" | "updatedAt">
  >,
): Promise<void> {
  const { error } = await client
    .from("notorius_handoffs")
    .update({
      status: patch.status,
      investor_id: patch.investorId,
      error_message: patch.errorMessage,
      updated_at: patch.updatedAt ?? new Date().toISOString(),
    })
    .eq("id", id);
  if (error) throw new Error(`DB handoff update: ${error.message}`);
}

export async function listHandoffs(
  client: SupabaseClient,
  limit = 40,
): Promise<HandoffRecord[]> {
  const { data, error } = await client
    .from("notorius_handoffs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw new Error(`DB handoff list: ${error.message}`);

  return (data ?? []).map((row) => ({
    id: row.id as string,
    source: row.source as HandoffRecord["source"],
    externalId: row.external_id as string | null,
    leadName: row.lead_name as string | null,
    leadEmail: row.lead_email as string | null,
    leadPhone: row.lead_phone as string | null,
    walletAddress: row.wallet_address as string | null,
    assetId: row.asset_id as string | null,
    payload: (row.payload ?? {}) as Record<string, unknown>,
    status: row.status as HandoffRecord["status"],
    investorId: row.investor_id as string | null,
    errorMessage: row.error_message as string | null,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  }));
}
