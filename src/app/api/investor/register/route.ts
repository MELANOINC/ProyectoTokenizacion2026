import { jsonError, jsonOk } from "@/lib/api";
import { getSnapshot, registerInvestor } from "@/lib/store";
import { registerInvestorSchema } from "@/lib/validation";

export async function GET() {
  const { investors } = await getSnapshot();
  return jsonOk({ investors });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const input = registerInvestorSchema.parse(body);
    const investor = await registerInvestor(input);
    return jsonOk({ investor }, 201);
  } catch (error) {
    return jsonError(error);
  }
}
