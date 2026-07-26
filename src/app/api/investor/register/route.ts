import { jsonError, jsonOk } from "@/lib/api";
import { getSnapshot, registerInvestor } from "@/lib/store";
import { registerInvestorSchema } from "@/lib/validation";

export async function GET() {
  const { investors } = getSnapshot();
  return jsonOk({ investors });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const input = registerInvestorSchema.parse(body);
    const investor = registerInvestor(input);
    return jsonOk({ investor }, 201);
  } catch (error) {
    return jsonError(error);
  }
}
