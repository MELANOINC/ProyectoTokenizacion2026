import { jsonError, jsonOk } from "@/lib/api";
import { processHandoff } from "@/lib/handoff";
import { handoffSchema } from "@/lib/validation";

function authorize(request: Request): boolean {
  const secret = process.env.ECOSYSTEM_HANDOFF_SECRET?.trim();
  if (!secret) {
    // Open in demo / local when secret is not set
    return true;
  }
  const header =
    request.headers.get("x-melano-handoff-secret") ??
    request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  return header === secret;
}

export async function POST(request: Request) {
  if (!authorize(request)) {
    return jsonError(new Error("Unauthorized handoff"), 401);
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
