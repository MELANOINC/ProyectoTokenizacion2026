import { jsonError, jsonOk } from "@/lib/api";
import { getSnapshot, setKycStatus } from "@/lib/store";
import { kycDecisionSchema } from "@/lib/validation";

export async function GET() {
  const { investors } = await getSnapshot();
  return jsonOk({
    investors: investors.map((i) => ({
      id: i.id,
      name: i.name,
      email: i.email,
      walletAddress: i.walletAddress,
      kycStatus: i.kycStatus,
      whitelisted: i.whitelisted,
    })),
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const input = kycDecisionSchema.parse(body);
    const investor = await setKycStatus(input.investorId, input.status);
    return jsonOk({ investor });
  } catch (error) {
    return jsonError(error);
  }
}
