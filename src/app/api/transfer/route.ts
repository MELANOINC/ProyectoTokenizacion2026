import { requireAdminApi } from "@/lib/admin/require-admin";
import { jsonError, jsonOk } from "@/lib/api";
import { getSnapshot, transferTokens } from "@/lib/store";
import { transferSchema } from "@/lib/validation";

export async function GET() {
  const denied = await requireAdminApi();
  if (denied) return denied;
  const { transfers } = await getSnapshot();
  return jsonOk({ transfers });
}

export async function POST(request: Request) {
  const denied = await requireAdminApi();
  if (denied) return denied;
  try {
    const body = await request.json();
    const input = transferSchema.parse(body);
    const transfer = await transferTokens(input);
    return jsonOk({ transfer }, 201);
  } catch (error) {
    return jsonError(error);
  }
}
