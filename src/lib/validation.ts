import { z } from "zod";

const ethAddress = z
  .string()
  .regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address");

const txHash = z
  .string()
  .regex(/^0x[a-fA-F0-9]{64}$/, "Invalid transaction hash");

export const registerInvestorSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email(),
  walletAddress: ethAddress,
});

export const whitelistSchema = z.object({
  investorId: z.string().min(1),
  assetId: z.string().min(1),
  walletAddress: ethAddress.optional(),
  onchainTxHash: txHash.optional(),
});

export const mintSchema = z.object({
  assetId: z.string().min(1),
  toWallet: ethAddress,
  amount: z.number().positive().finite(),
  txHash: txHash.optional(),
  blockNumber: z.number().int().nonnegative().optional(),
});

export const transferSchema = z.object({
  assetId: z.string().min(1),
  fromWallet: ethAddress,
  toWallet: ethAddress,
  amount: z.number().positive().finite(),
  txHash: txHash.optional(),
  blockNumber: z.number().int().nonnegative().optional(),
});

export const createAssetSchema = z.object({
  name: z.string().min(2).max(160),
  class: z.enum(["property", "development", "equity", "fund", "high_value"]),
  symbol: z
    .string()
    .min(2)
    .max(12)
    .regex(/^[A-Z0-9]+$/, "Symbol must be uppercase alphanumeric"),
  totalSupply: z.number().positive().finite(),
  issuerId: z.string().min(1),
  chain: z.enum(["polygon", "base"]).default("polygon"),
});

export const handoffSchema = z.object({
  source: z.enum(["alenya", "luxia", "brunomelano", "manual"]),
  externalId: z.string().min(1).max(120).optional(),
  name: z.string().min(2).max(120),
  email: z.string().email(),
  phone: z.string().min(6).max(40).optional(),
  walletAddress: ethAddress.optional(),
  assetId: z.string().min(1).optional(),
  autoWhitelist: z.boolean().optional(),
  payload: z.record(z.string(), z.unknown()).optional(),
});

export const kycReviewSchema = z.object({
  investorId: z.string().min(1),
  decision: z.enum(["approved", "rejected"]),
  notes: z.string().max(500).optional(),
});

export const ledgerConfirmSchema = z.object({
  type: z.enum(["mint", "transfer", "whitelist"]),
  assetId: z.string().min(1),
  txHash: txHash,
  blockNumber: z.number().int().nonnegative().optional(),
  toWallet: ethAddress.optional(),
  fromWallet: ethAddress.optional(),
  amount: z.number().positive().finite().optional(),
  investorId: z.string().min(1).optional(),
  walletAddress: ethAddress.optional(),
});
