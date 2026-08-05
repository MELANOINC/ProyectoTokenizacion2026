import { NextResponse } from "next/server";
import { jsonError, jsonOk } from "@/lib/api";
import { authorizeEcosystemHandoff } from "@/lib/ecosystem-handoff-auth";
import { processHandoff } from "@/lib/handoff";
import { handoffSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const auth = authorizeEcosystemHandoff(request);
  if (!auth.ok) {
    return NextResponse.json(
      { ok: false, error: auth.error },
      { status: auth.status },
    );
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
