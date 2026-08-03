import { requireAdminApi } from "@/lib/admin/require-admin";
import { createAsset, getSnapshot } from "@/lib/store";
import { jsonError, jsonOk } from "@/lib/api";
import { createAssetSchema } from "@/lib/validation";

export async function GET() {
  const denied = await requireAdminApi();
  if (denied) return denied;
  const { assets } = await getSnapshot();
  return jsonOk({ assets });
}

export async function POST(request: Request) {
  const denied = await requireAdminApi();
  if (denied) return denied;
  try {
    const body = await request.json();
    const input = createAssetSchema.parse(body);
    const asset = await createAsset(input);
    return jsonOk({ asset }, 201);
  } catch (error) {
    return jsonError(error);
  }
}
