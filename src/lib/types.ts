export type AssetClass =
  | "property"
  | "development"
  | "equity"
  | "fund"
  | "high_value";

export type KycStatus = "pending" | "approved" | "rejected";

export type ChainId = "polygon" | "base";

/** onchain = real Polygon tx; demo = simulated ledger (labeled in UI). */
export type LedgerSource = "onchain" | "demo";

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
  createdAt: string;
}

export interface Investor {
  id: string;
  name: string;
  email: string;
  walletAddress: string;
  kycStatus: KycStatus;
  whitelisted: boolean;
  createdAt: string;
}

export interface WhitelistEntry {
  id: string;
  investorId: string;
  assetId: string;
  walletAddress: string;
  createdAt: string;
}

export interface MintRecord {
  id: string;
  assetId: string;
  toWallet: string;
  amount: number;
  txHash: string;
  ledgerSource: LedgerSource;
  createdAt: string;
}

export interface TransferRecord {
  id: string;
  assetId: string;
  fromWallet: string;
  toWallet: string;
  amount: number;
  txHash: string;
  ledgerSource: LedgerSource;
  createdAt: string;
}

export interface PlatformState {
  assets: TokenizedAsset[];
  investors: Investor[];
  whitelist: WhitelistEntry[];
  mints: MintRecord[];
  transfers: TransferRecord[];
}
