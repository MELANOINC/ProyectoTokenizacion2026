import { requireAdminApi } from "@/lib/admin/require-admin";
import { jsonError, jsonOk } from "@/lib/api";
import { addToWhitelist, getSnapshot } from "@/lib/store";
import { whitelistSchema } from "@/lib/validation";

export async function GET() {
  const denied = await requireAdminApi();
  if (denied) return denied;
  const { whitelist } = await getSnapshot();
  return jsonOk({ whitelist });
}

export async function POST(request: Request) {
  const denied = await requireAdminApi();
  if (denied) return denied;
  try {
    const body = await request.json();
    const input = whitelistSchema.parse(body);
    const entry = await addToWhitelist(input);
    return jsonOk({ entry }, 201);
  } catch (error) {
    return jsonError(error);
  }
}
