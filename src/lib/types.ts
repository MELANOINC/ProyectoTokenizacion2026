export type AssetClass =
  | "property"
  | "development"
  | "equity"
  | "fund"
  | "high_value";

export type KycStatus = "pending" | "approved" | "rejected";

export type ChainId = "polygon" | "base";

export type AssetStatus = "draft" | "deployed" | "paused";

export type LedgerStatus = "pending" | "confirmed" | "failed";

export type WhitelistStatus = "requested" | "onchain" | "revoked";

export type OperatorRole = "admin" | "compliance" | "issuer";

export interface TokenizedAsset {
  id: string;
  name: string;
  class: AssetClass;
  symbol: string;
  totalSupply: number;
  mintedSupply: number;
  issuerId: string;
  chain: ChainId;
  contractAddress: string | null;
  identityRegistryAddress?: string | null;
  deployTxHash?: string | null;
  chainId?: number | null;
  status?: AssetStatus;
  createdAt: string;
}

export interface Investor {
  id: string;
  name: string;
  email: string;
  walletAddress: string;
  kycStatus: KycStatus;
  whitelisted: boolean;
  countryCode?: string | null;
  kycReviewedAt?: string | null;
  kycReviewedBy?: string | null;
  createdAt: string;
}

export interface WhitelistEntry {
  id: string;
  investorId: string;
  assetId: string;
  walletAddress: string;
  onchainTxHash?: string | null;
  status?: WhitelistStatus;
  createdAt: string;
}

export interface MintRecord {
  id: string;
  assetId: string;
  toWallet: string;
  amount: number;
  txHash: string;
  blockNumber?: number | null;
  status?: LedgerStatus;
  createdAt: string;
}

export interface TransferRecord {
  id: string;
  assetId: string;
  fromWallet: string;
  toWallet: string;
  amount: number;
  txHash: string;
  blockNumber?: number | null;
  status?: LedgerStatus;
  createdAt: string;
}

export interface PlatformState {
  assets: TokenizedAsset[];
  investors: Investor[];
  whitelist: WhitelistEntry[];
  mints: MintRecord[];
  transfers: TransferRecord[];
}

export interface KycReview {
  id: string;
  investorId: string;
  decision: "approved" | "rejected";
  reviewerId?: string | null;
  notes?: string | null;
  createdAt: string;
}
