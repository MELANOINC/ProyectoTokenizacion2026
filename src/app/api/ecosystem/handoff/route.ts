import { jsonError, jsonOk } from "@/lib/api";
import { isProductionHardening } from "@/lib/ledger-mode";
import { processHandoff } from "@/lib/handoff";
import { handoffSchema } from "@/lib/validation";

function authorize(request: Request): boolean {
  const secret = process.env.ECOSYSTEM_HANDOFF_SECRET?.trim();
  if (!secret) {
    // Production must set ECOSYSTEM_HANDOFF_SECRET. Local/dev/demo may stay open.
    if (isProductionHardening() || process.env.NODE_ENV === "production") {
      return false;
    }
    return true;
  }
  const header =
    request.headers.get("x-melano-handoff-secret") ??
    request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  return header === secret;
}

export async function POST(request: Request) {
  if (!authorize(request)) {
    return jsonError(
      new Error(
        "Unauthorized handoff — set ECOSYSTEM_HANDOFF_SECRET and pass x-melano-handoff-secret",
      ),
      401,
    );
  }

  try {
    const body = await request.json();
    const input = handoffSchema.parse(body);
    const result = await processHandoff(input);
    return jsonOk(result, 201);
  } catch (error) {
    return jsonError(error);
  }
}
