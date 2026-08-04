import { requireAdminApi } from "@/lib/admin/require-admin";
import { authErrorStatus, requireOperator } from "@/lib/auth/operators";
import { jsonError, jsonOk } from "@/lib/api";
import { getSnapshot, mintTokens } from "@/lib/store";
import { mintSchema } from "@/lib/validation";

export async function GET() {
  const denied = await requireAdminApi();
  if (denied) return denied;
  const { mints } = await getSnapshot();
  return jsonOk({ mints });
}

export async function POST(request: Request) {
  try {
    await requireOperator(request, ["admin", "issuer"]);
    const body = await request.json();
    const input = mintSchema.parse(body);
    const mint = await mintTokens(input);
    return jsonOk({ mint }, 201);
  } catch (error) {
    return jsonError(error, authErrorStatus(error));
  }
}
