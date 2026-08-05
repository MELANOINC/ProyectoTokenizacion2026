import { getSnapshot, registerInvestor } from "@/lib/store";
import type { HandoffSource } from "@/lib/ecosystem";
import type { Investor } from "@/lib/types";

export type HandoffInput = {
  source: HandoffSource;
  externalId?: string;
  name: string;
  email: string;
  phone?: string;
  walletAddress: string;
  assetId?: string;
  payload?: Record<string, unknown>;
};

export type HandoffResult = {
  source: HandoffSource;
  externalId?: string;
  investor: Investor;
  /** Always false until compliance approves KYC and whitelists. */
  whitelisted: boolean;
  status: "investor_created" | "investor_existing";
};

/**
 * Ecosystem lead → Notorius investor (KYC pending).
 * Does not auto-whitelist; compliance must approve via admin KYC.
 */
export async function processHandoff(
  input: HandoffInput,
): Promise<HandoffResult> {
  const wallet = input.walletAddress.toLowerCase();
  const email = input.email.toLowerCase();
  const snap = await getSnapshot();
  const existing = snap.investors.find(
    (i) =>
      i.email.toLowerCase() === email ||
      i.walletAddress.toLowerCase() === wallet,
  );

  if (existing) {
    return {
      source: input.source,
      externalId: input.externalId,
      investor: existing,
      whitelisted: existing.whitelisted,
      status: "investor_existing",
    };
  }

  const investor = await registerInvestor({
    name: input.name,
    email,
    walletAddress: wallet,
  });

  return {
    source: input.source,
    externalId: input.externalId,
    investor,
    whitelisted: false,
    status: "investor_created",
  };
}

export async function getEcosystemStatus() {
  const snap = await getSnapshot();
  return {
    pipeline: {
      notoriusInvestors: snap.investors.length,
      notoriusAssets: snap.assets.length,
      whitelist: snap.whitelist.length,
      mints: snap.mints.length,
    },
    persistence: "memory_or_supabase",
    assets: snap.assets,
    investors: snap.investors.slice(0, 20),
  };
}
