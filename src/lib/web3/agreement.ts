import type { Address, Hex } from "viem";

export const tokenizationAgreementTypes = {
  TokenizationAgreement: [
    { name: "assetName", type: "string" },
    { name: "symbol", type: "string" },
    { name: "totalSupply", type: "uint256" },
    { name: "issuer", type: "address" },
    { name: "investor", type: "address" },
    { name: "chainId", type: "uint256" },
    { name: "timestamp", type: "uint256" },
  ],
} as const;

export function buildAgreementDomain(chainId: number) {
  return {
    name: "NOTORIUS",
    version: "1",
    chainId,
  } as const;
}

export function buildAgreementMessage(input: {
  assetName: string;
  symbol: string;
  totalSupply: bigint;
  issuer: Address;
  investor: Address;
  chainId: number;
  timestamp: bigint;
}) {
  return {
    assetName: input.assetName,
    symbol: input.symbol,
    totalSupply: input.totalSupply,
    issuer: input.issuer,
    investor: input.investor,
    chainId: BigInt(input.chainId),
    timestamp: input.timestamp,
  };
}

export type SignedAgreement = {
  signature: Hex;
  message: ReturnType<typeof buildAgreementMessage>;
  domain: ReturnType<typeof buildAgreementDomain>;
  signedAt: string;
};
