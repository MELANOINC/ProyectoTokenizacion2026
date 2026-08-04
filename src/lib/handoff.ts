import { createId } from "@/lib/ids";
import {
  insertHandoff,
  listHandoffs,
  updateHandoff,
  type HandoffRecord,
} from "@/lib/store-db";
import {
  addToWhitelist,
  findInvestor,
  getSnapshot,
  registerInvestor,
  reviewKyc,
} from "@/lib/store";
import { isDemoLedgerMode } from "@/lib/ledger-mode";
import { getSupabase } from "@/lib/supabase";
import type { HandoffSource } from "@/lib/ecosystem";
import type { Investor } from "@/lib/types";

export type HandoffInput = {
  source: HandoffSource;
  externalId?: string;
  name: string;
  email: string;
  phone?: string;
  walletAddress?: string;
  assetId?: string;
  autoWhitelist?: boolean;
  payload?: Record<string, unknown>;
};

export type HandoffResult = {
  handoff: HandoffRecord;
  investor: Investor;
  whitelisted: boolean;
};

function placeholderWallet(email: string): string {
  // Deterministic demo wallet from email hash for leads without a wallet yet
  let hash = 0;
  for (let i = 0; i < email.length; i++) {
    hash = (hash * 31 + email.charCodeAt(i)) >>> 0;
  }
  const hex = hash.toString(16).padStart(8, "0").repeat(5).slice(0, 40);
  return `0x${hex}`;
}

export async function processHandoff(
  input: HandoffInput,
): Promise<HandoffResult> {
  const now = new Date().toISOString();
  const wallet = (
    input.walletAddress ?? placeholderWallet(input.email)
  ).toLowerCase();
  const autoWhitelist = input.autoWhitelist !== false;

  const handoff: HandoffRecord = {
    id: createId("hof"),
    source: input.source,
    externalId: input.externalId ?? null,
    leadName: input.name,
    leadEmail: input.email.toLowerCase(),
    leadPhone: input.phone ?? null,
    walletAddress: wallet,
    assetId: input.assetId ?? "asset_puerto_madero",
    payload: input.payload ?? {},
    status: "received",
    investorId: null,
    errorMessage: null,
    createdAt: now,
    updatedAt: now,
  };

  const client = getSupabase();
  if (client) {
    try {
      await insertHandoff(client, handoff);
    } catch (error) {
      console.error("[handoff] persist received", error);
    }
  }

  try {
    let investor =
      (await findInvestor({ email: input.email, walletAddress: wallet })) ??
      null;

    if (!investor) {
      investor = await registerInvestor({
        name: input.name,
        email: input.email,
        walletAddress: wallet,
      });
      handoff.status = "investor_created";
    } else {
      handoff.status = "investor_created";
    }
    handoff.investorId = investor.id;

    let whitelisted = false;
    const assetId = handoff.assetId ?? "asset_puerto_madero";
    const snap = await getSnapshot();
    const assetExists = snap.assets.some((a) => a.id === assetId);

    // Production: whitelist only if KYC already approved.
    // Demo/memory: optional autoWhitelist may approve KYC then whitelist for PoC tests.
    if (autoWhitelist && assetExists) {
      if (investor.kycStatus !== "approved" && isDemoLedgerMode()) {
        investor = await reviewKyc({
          investorId: investor.id,
          decision: "approved",
          notes: "demo autoWhitelist",
        });
      }
      if (investor.kycStatus === "approved") {
        await addToWhitelist({
          investorId: investor.id,
          assetId,
          walletAddress: wallet,
        });
        handoff.status = "whitelisted";
        whitelisted = true;
        investor = (await findInvestor({ email: input.email })) ?? investor;
      }
    }

    handoff.updatedAt = new Date().toISOString();
    if (client) {
      try {
        await updateHandoff(client, handoff.id, {
          status: handoff.status,
          investorId: handoff.investorId,
          updatedAt: handoff.updatedAt,
        });
      } catch (error) {
        console.error("[handoff] persist success update", error);
      }
    }

    return { handoff, investor, whitelisted };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Handoff failed";
    handoff.status = "error";
    handoff.errorMessage = message;
    handoff.updatedAt = new Date().toISOString();
    if (client) {
      try {
        await updateHandoff(client, handoff.id, {
          status: "error",
          errorMessage: message,
          updatedAt: handoff.updatedAt,
        });
      } catch (persistError) {
        console.error("[handoff] persist error update", persistError);
      }
    }
    throw error;
  }
}

export async function getEcosystemStatus() {
  const snap = await getSnapshot();
  const client = getSupabase();

  let handoffs: HandoffRecord[] = [];
  let alenyaLeads = 0;
  let luxiaLeads = 0;

  if (client) {
    try {
      handoffs = await listHandoffs(client, 50);
    } catch {
      handoffs = [];
    }

    try {
      const [alenya, luxia] = await Promise.all([
        client
          .from("alenya_leads")
          .select("id", { count: "exact", head: true }),
        client.from("leads").select("id", { count: "exact", head: true }),
      ]);
      alenyaLeads = alenya.count ?? 0;
      luxiaLeads = luxia.count ?? 0;
    } catch {
      // optional hub tables may be RLS-restricted
    }
  }

  return {
    pipeline: {
      alenyaLeads,
      luxiaLeads,
      notoriusInvestors: snap.investors.length,
      notoriusAssets: snap.assets.length,
      whitelist: snap.whitelist.length,
      mints: snap.mints.length,
      handoffs: handoffs.length,
    },
    persistence: client ? "supabase" : "memory",
    handoffs,
    assets: snap.assets,
    investors: snap.investors.slice(0, 20),
  };
}
