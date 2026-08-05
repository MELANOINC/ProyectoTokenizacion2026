import { z } from "zod";

const ethAddress = z
  .string()
  .regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address");

export const registerInvestorSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email(),
  walletAddress: ethAddress,
});

export const whitelistSchema = z.object({
  investorId: z.string().min(1),
  assetId: z.string().min(1),
  walletAddress: ethAddress.optional(),
});

const txHash = z
  .string()
  .regex(/^0x[a-fA-F0-9]{64}$/, "Invalid tx hash")
  .optional();

export const mintSchema = z.object({
  assetId: z.string().min(1),
  toWallet: ethAddress,
  amount: z.number().positive().finite(),
  /** Real on-chain hash. Omit to record a labeled demo mint. */
  txHash,
});

export const transferSchema = z.object({
  assetId: z.string().min(1),
  fromWallet: ethAddress,
  toWallet: ethAddress,
  amount: z.number().positive().finite(),
  txHash,
});

export const kycDecisionSchema = z.object({
  investorId: z.string().min(1),
  status: z.enum(["approved", "rejected"]),
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
  walletAddress: ethAddress,
  assetId: z.string().min(1).optional(),
  payload: z.record(z.string(), z.unknown()).optional(),
});
