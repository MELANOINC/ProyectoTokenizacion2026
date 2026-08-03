import { createAsset, getSnapshot } from "@/lib/store";
import { jsonError, jsonOk } from "@/lib/api";
import { createAssetSchema } from "@/lib/validation";

export async function GET() {
  const { assets } = await getSnapshot();
  return jsonOk({ assets });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const input = createAssetSchema.parse(body);
    const asset = await createAsset(input);
    return jsonOk({ asset }, 201);
  } catch (error) {
    return jsonError(error);
  }
}
