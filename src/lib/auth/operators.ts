import type { NextRequest } from "next/server";

export type OperatorRole = "admin" | "compliance" | "issuer";

export type OperatorContext = {
  userId: string;
  role: OperatorRole;
  active: boolean;
};

/**
 * Stub for Supabase Auth + `notorius_operators` RBAC.
 * Returns null until session wiring is completed; callers should 401.
 */
export async function requireOperator(
  request: Request | NextRequest,
  roles?: OperatorRole | OperatorRole[],
): Promise<OperatorContext | null> {
  void request;
  void roles;
  // TODO: read Supabase session (cookie/Bearer) and join notorius_operators.
  return null;
}

export function operatorUnauthorized() {
  return {
    ok: false as const,
    error: "Operator authentication required",
    code: "OPERATOR_AUTH_REQUIRED" as const,
  };
}
