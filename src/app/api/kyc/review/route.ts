import { authErrorStatus, requireOperator } from "@/lib/auth/operators";
import { jsonError, jsonOk } from "@/lib/api";
import { reviewKyc } from "@/lib/store";
import { kycReviewSchema } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    const op = await requireOperator(request, ["admin", "compliance"]);
    const body = await request.json();
    const input = kycReviewSchema.parse(body);
    const investor = await reviewKyc({
      ...input,
      reviewerId: op.userId === "demo-operator" || op.userId === "operator-key"
        ? null
        : op.userId,
    });
    return jsonOk({ investor });
  } catch (error) {
    return jsonError(error, authErrorStatus(error));
  }
}
