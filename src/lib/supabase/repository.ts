import type {
  AssetClass,
  ChainId,
  Investor,
  KycStatus,
  MintRecord,
  TokenizedAsset,
  TransferRecord,
  WhitelistEntry,
} from "@/lib/types";
import { getSupabaseConfig } from "./config";
import { sbFetch } from "./rest";

/** Ledger rows stored in existing public.audit_logs until native tables exist. */
const WL_ENTITY = "notorius_whitelist";
const XFER_ENTITY = "notorius_transfer";

type DbAsset = {
  id: string;
  company_id: string;
  name: string;
  asset_type: string;
  country: string | null;
  description: string | null;
  total_value_usd: number | string | null;
  expected_roi: number | string | null;
  status: string | null;
  created_at: string;
};

type DbTokenization = {
  id: string;
  asset_id: string;
  token_name: string;
  token_symbol: string;
  total_supply: number | string;
  price_per_token_usd: number | string | null;
  blockchain: string | null;
  contract_address: string | null;
  status: string | null;
  created_at: string;
};

type DbInvestor = {
  id: string;
  company_id: string;
  full_name: string;
  email: string;
  wallet_address: string | null;
  kyc_status: string | null;
  created_at: string;
};

type DbInvestment = {
  id: string;
  tokenization_id: string;
  investor_id: string;
  tokens_purchased: number | string;
  amount_usd: number | string | null;
  status: string | null;
  created_at: string;
};

function num(value: number | string | null | undefined): number {
  if (value == null) return 0;
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : 0;
}

function mapClass(value: string | null | undefined): AssetClass {
  const allowed: AssetClass[] = [
    "property",
    "development",
    "equity",
    "fund",
    "high_value",
  ];
  if (value && (allowed as string[]).includes(value)) {
    return value as AssetClass;
  }
  return "property";
}

function mapChain(value: string | null | undefined): ChainId {
  if (value?.toLowerCase() === "base") return "base";
  return "polygon";
}

function mapKyc(value: string | null | undefined): KycStatus {
  if (value === "approved" || value === "rejected" || value === "pending") {
    return value;
  }
  return "pending";
}

type DbAuditLog = {
  id: string;
  entity_type: string;
  entity_id: string | null;
  action: string;
  metadata: Record<string, unknown> | null;
  created_at: string;
};

export async function loadPlatformFromSupabase(): Promise<{
  assets: TokenizedAsset[];
  investors: Investor[];
  mints: MintRecord[];
  whitelist: WhitelistEntry[];
  transfers: TransferRecord[];
} | null> {
  const config = getSupabaseConfig();
  if (!config) return null;

  const companyFilter = `company_id=eq.${config.companyId}`;

  const [assets, tokenizations, investors, investments, ledger] =
    await Promise.all([
    sbFetch<DbAsset[]>(
      `/rest/v1/assets?${companyFilter}&select=*&order=created_at.desc`,
      { config },
    ),
    sbFetch<DbTokenization[]>(
      `/rest/v1/tokenizations?select=*&order=created_at.desc`,
      { config },
    ),
    sbFetch<DbInvestor[]>(
      `/rest/v1/investors?${companyFilter}&select=*&order=created_at.desc`,
      { config },
    ),
    sbFetch<DbInvestment[]>(
      `/rest/v1/investments?select=*&order=created_at.desc`,
      { config },
    ),
    sbFetch<DbAuditLog[]>(
      `/rest/v1/audit_logs?or=(entity_type.eq.${WL_ENTITY},entity_type.eq.${XFER_ENTITY})&select=*&order=created_at.desc&limit=2000`,
      { config },
    ),
  ]);

  const tokByAsset = new Map(tokenizations.map((t) => [t.asset_id, t]));
  const mintedByTok = new Map<string, number>();
  for (const inv of investments) {
    mintedByTok.set(
      inv.tokenization_id,
      (mintedByTok.get(inv.tokenization_id) ?? 0) + num(inv.tokens_purchased),
    );
  }

  const mappedAssets: TokenizedAsset[] = assets.map((a) => {
    const tok = tokByAsset.get(a.id);
    return {
      id: a.id,
      name: a.name,
      class: mapClass(a.asset_type),
      symbol: (tok?.token_symbol ?? a.name.slice(0, 4)).toUpperCase(),
      totalSupply: num(tok?.total_supply) || 1,
      mintedSupply: tok ? (mintedByTok.get(tok.id) ?? 0) : 0,
      issuerId: a.company_id,
      chain: mapChain(tok?.blockchain),
      contractAddress: tok?.contract_address ?? null,
      createdAt: a.created_at,
    };
  });

  const mappedInvestors: Investor[] = investors.map((i) => ({
    id: i.id,
    name: i.full_name,
    email: i.email,
    walletAddress: (i.wallet_address ?? "").toLowerCase(),
    kycStatus: mapKyc(i.kyc_status),
    whitelisted: mapKyc(i.kyc_status) === "approved",
    createdAt: i.created_at,
  }));

  const investorById = new Map(investors.map((i) => [i.id, i]));
  const tokById = new Map(tokenizations.map((t) => [t.id, t]));
  const mints: MintRecord[] = investments
    .filter((row) => num(row.tokens_purchased) > 0)
    .map((row) => {
      const tok = tokById.get(row.tokenization_id);
      const inv = investorById.get(row.investor_id);
      return {
        id: row.id,
        assetId: tok?.asset_id ?? row.tokenization_id,
        toWallet: (inv?.wallet_address ?? "").toLowerCase(),
        amount: num(row.tokens_purchased),
        txHash: `supabase:${row.id}`,
        ledgerSource: "demo" as const,
        createdAt: row.created_at,
      };
    });

  const whitelist: WhitelistEntry[] = ledger
    .filter((row) => row.entity_type === WL_ENTITY && row.metadata)
    .map((row) => {
      const m = row.metadata ?? {};
      return {
        id: String(m.id ?? row.id),
        investorId: String(m.investorId ?? ""),
        assetId: String(m.assetId ?? row.entity_id ?? ""),
        walletAddress: String(m.walletAddress ?? "").toLowerCase(),
        createdAt: String(m.createdAt ?? row.created_at),
      };
    })
    .filter((w) => w.investorId && w.assetId && w.walletAddress);

  const transfers: TransferRecord[] = ledger
    .filter((row) => row.entity_type === XFER_ENTITY && row.metadata)
    .map((row) => {
      const m = row.metadata ?? {};
      return {
        id: String(m.id ?? row.id),
        assetId: String(m.assetId ?? row.entity_id ?? ""),
        fromWallet: String(m.fromWallet ?? "").toLowerCase(),
        toWallet: String(m.toWallet ?? "").toLowerCase(),
        amount: num(m.amount as number | string | null | undefined),
        txHash: String(m.txHash ?? `supabase:${row.id}`),
        ledgerSource: (String(m.txHash ?? "").match(/^0x[a-fA-F0-9]{64}$/)
          ? "onchain"
          : "demo") as "onchain" | "demo",
        createdAt: String(m.createdAt ?? row.created_at),
      };
    })
    .filter((t) => t.assetId && t.fromWallet && t.toWallet && t.amount > 0);

  return {
    assets: mappedAssets,
    investors: mappedInvestors,
    mints,
    whitelist,
    transfers,
  };
}

async function persistAuditLedger(
  entityType: string,
  entityId: string,
  action: string,
  metadata: Record<string, unknown>,
): Promise<string | null> {
  const config = getSupabaseConfig();
  if (!config) return null;

  const rows = await sbFetch<DbAuditLog[]>(`/rest/v1/audit_logs`, {
    config,
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify({
      entity_type: entityType,
      entity_id: entityId,
      action,
      metadata,
    }),
  });
  return rows[0]?.id ?? null;
}

export async function persistWhitelistEntry(
  entry: WhitelistEntry,
): Promise<void> {
  await persistAuditLedger(WL_ENTITY, entry.assetId, "whitelist", {
    id: entry.id,
    investorId: entry.investorId,
    assetId: entry.assetId,
    walletAddress: entry.walletAddress,
    createdAt: entry.createdAt,
  });
}

export async function persistTransfer(entry: TransferRecord): Promise<void> {
  await persistAuditLedger(XFER_ENTITY, entry.assetId, "transfer", {
    id: entry.id,
    assetId: entry.assetId,
    fromWallet: entry.fromWallet,
    toWallet: entry.toWallet,
    amount: entry.amount,
    txHash: entry.txHash,
    createdAt: entry.createdAt,
  });
}

export async function persistAsset(asset: TokenizedAsset): Promise<void> {
  const config = getSupabaseConfig();
  if (!config) return;

  await sbFetch(`/rest/v1/assets`, {
    config,
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates,return=minimal",
    },
    body: JSON.stringify({
      id: asset.id,
      company_id: config.companyId,
      name: asset.name,
      asset_type: asset.class,
      country: "Argentina",
      description: `NOTORIUS ${asset.symbol}`,
      status: "active",
      created_at: asset.createdAt,
    }),
  });

  await sbFetch(`/rest/v1/tokenizations`, {
    config,
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates,return=minimal",
    },
    body: JSON.stringify({
      asset_id: asset.id,
      token_name: asset.name,
      token_symbol: asset.symbol,
      total_supply: asset.totalSupply,
      blockchain: asset.chain,
      contract_address: asset.contractAddress,
      status: "active",
      created_at: asset.createdAt,
    }),
  });
}

export async function persistInvestor(investor: Investor): Promise<void> {
  const config = getSupabaseConfig();
  if (!config) return;

  await sbFetch(`/rest/v1/investors`, {
    config,
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates,return=minimal",
    },
    body: JSON.stringify({
      id: investor.id,
      company_id: config.companyId,
      full_name: investor.name,
      email: investor.email,
      wallet_address: investor.walletAddress,
      kyc_status: investor.kycStatus,
      created_at: investor.createdAt,
    }),
  });
}

export async function persistInvestorKyc(
  investorId: string,
  kycStatus: KycStatus,
): Promise<void> {
  const config = getSupabaseConfig();
  if (!config) return;

  await sbFetch(`/rest/v1/investors?id=eq.${investorId}`, {
    config,
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify({ kyc_status: kycStatus }),
  });
}

export async function persistMint(input: {
  assetId: string;
  investorId: string;
  amount: number;
  createdAt: string;
}): Promise<string | null> {
  const config = getSupabaseConfig();
  if (!config) return null;

  const toks = await sbFetch<DbTokenization[]>(
    `/rest/v1/tokenizations?asset_id=eq.${input.assetId}&select=id&limit=1`,
    { config },
  );
  const tokenizationId = toks[0]?.id;
  if (!tokenizationId) return null;

  const rows = await sbFetch<DbInvestment[]>(`/rest/v1/investments`, {
    config,
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify({
      tokenization_id: tokenizationId,
      investor_id: input.investorId,
      tokens_purchased: input.amount,
      amount_usd: 0,
      status: "minted",
      created_at: input.createdAt,
    }),
  });

  return rows[0]?.id ?? null;
}
