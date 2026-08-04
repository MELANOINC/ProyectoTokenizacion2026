import { jsonError, jsonOk } from "@/lib/api";
import { insertChainEvent } from "@/lib/store-db";
import {
  addToWhitelist,
  mintTokens,
  transferTokens,
} from "@/lib/store";
import { getSupabase } from "@/lib/supabase";
import { ledgerConfirmSchema } from "@/lib/validation";

/**
 * Confirm an on-chain action into the off-chain ledger.
 * Trusts a real txHash (format-validated). Full receipt verification can be
 * layered later with a public RPC; operators should prefer authenticated mint/transfer.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const input = ledgerConfirmSchema.parse(body);
    const client = getSupabase();

    if (input.type === "mint") {
      if (!input.toWallet || input.amount === undefined) {
        throw new Error("toWallet and amount are required for mint confirm");
      }
      const mint = await mintTokens({
        assetId: input.assetId,
        toWallet: input.toWallet,
        amount: input.amount,
        txHash: input.txHash,
        blockNumber: input.blockNumber,
      });
      if (client) {
        await insertChainEvent(client, {
          assetId: input.assetId,
          eventName: "Minted",
          txHash: input.txHash,
          blockNumber: input.blockNumber,
          payload: { toWallet: input.toWallet, amount: input.amount },
        });
      }
      return jsonOk({ mint }, 201);
    }

    if (input.type === "transfer") {
      if (!input.fromWallet || !input.toWallet || input.amount === undefined) {
        throw new Error(
          "fromWallet, toWallet and amount are required for transfer confirm",
        );
      }
      const transfer = await transferTokens({
        assetId: input.assetId,
        fromWallet: input.fromWallet,
        toWallet: input.toWallet,
        amount: input.amount,
        txHash: input.txHash,
        blockNumber: input.blockNumber,
      });
      if (client) {
        await insertChainEvent(client, {
          assetId: input.assetId,
          eventName: "Transfer",
          txHash: input.txHash,
          blockNumber: input.blockNumber,
          payload: {
            fromWallet: input.fromWallet,
            toWallet: input.toWallet,
            amount: input.amount,
          },
        });
      }
      return jsonOk({ transfer }, 201);
    }

    // whitelist
    if (!input.investorId) {
      throw new Error("investorId is required for whitelist confirm");
    }
    const entry = await addToWhitelist({
      investorId: input.investorId,
      assetId: input.assetId,
      walletAddress: input.walletAddress ?? input.toWallet,
      onchainTxHash: input.txHash,
    });
    if (client) {
      await insertChainEvent(client, {
        assetId: input.assetId,
        eventName: "Whitelisted",
        txHash: input.txHash,
        blockNumber: input.blockNumber,
        payload: { investorId: input.investorId, wallet: entry.walletAddress },
      });
    }
    return jsonOk({ entry }, 201);
  } catch (error) {
    return jsonError(error);
  }
}
