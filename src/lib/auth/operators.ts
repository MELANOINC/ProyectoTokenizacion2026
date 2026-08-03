import { createClient } from "@supabase/supabase-js";
import { isDemoLedgerMode, isProductionHardening } from "@/lib/ledger-mode";
import type { OperatorRole } from "@/lib/types";

export type OperatorContext = {
  userId: string;
  role: OperatorRole;
  via: "demo" | "operator_key" | "supabase";
};

function operatorKey(): string | undefined {
  return process.env.NOTORIUS_OPERATOR_KEY?.trim();
}

function supabaseUrl(): string | undefined {
  return (
    process.env.SUPABASE_URL?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
  );
}

function supabaseAnonKey(): string | undefined {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ||
    process.env.SUPABASE_ANON_KEY?.trim()
  );
}

function supabaseServiceKey(): string | undefined {
  return process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
}

/**
 * Authorize an operator for mutable API routes.
 * - Demo/memory mode: open (admin)
 * - x-notorius-operator-key / Bearer matching NOTORIUS_OPERATOR_KEY
 * - Supabase JWT of an active notorius_operators row
 */
export async function requireOperator(
  request: Request,
  roles?: OperatorRole[],
): Promise<OperatorContext> {
  if (isDemoLedgerMode()) {
    return { userId: "demo-operator", role: "admin", via: "demo" };
  }

  const key = operatorKey();
  const headerKey =
    request.headers.get("x-notorius-operator-key") ??
    request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");

  if (key && headerKey === key) {
    const role: OperatorRole = "admin";
    if (roles && !roles.includes(role)) {
      throw Object.assign(new Error("Forbidden for this role"), { status: 403 });
    }
    return { userId: "operator-key", role, via: "operator_key" };
  }

  const url = supabaseUrl();
  const anon = supabaseAnonKey();
  const service = supabaseServiceKey();
  const token = request.headers
    .get("authorization")
    ?.replace(/^Bearer\s+/i, "")
    ?.trim();

  if (url && anon && token && token !== key) {
    const authClient = createClient(url, anon, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { headers: { Authorization: `Bearer ${token}` } },
    });
    const { data: userData, error: userError } = await authClient.auth.getUser();
    if (userError || !userData.user) {
      throw Object.assign(new Error("Unauthorized"), { status: 401 });
    }

    const adminClient = createClient(url, service || anon, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data: op, error: opError } = await adminClient
      .from("notorius_operators")
      .select("user_id, role, active")
      .eq("user_id", userData.user.id)
      .maybeSingle();

    if (opError || !op || !op.active) {
      throw Object.assign(new Error("Operator not registered"), { status: 403 });
    }

    const role = op.role as OperatorRole;
    if (roles && !roles.includes(role)) {
      throw Object.assign(new Error("Forbidden for this role"), { status: 403 });
    }

    return { userId: userData.user.id, role, via: "supabase" };
  }

  // Local/dev without credentials: allow admin for dashboard demos.
  if (process.env.NODE_ENV !== "production" && !key) {
    return { userId: "dev-operator", role: "admin", via: "demo" };
  }

  if (isProductionHardening()) {
    throw Object.assign(new Error("Unauthorized"), { status: 401 });
  }

  // Non-production with key configured but missing/wrong header
  if (key) {
    throw Object.assign(new Error("Unauthorized"), { status: 401 });
  }

  throw Object.assign(
    new Error(
      "Operator auth required — set NOTORIUS_OPERATOR_KEY or Supabase operator JWT",
    ),
    { status: 401 },
  );
}

export function authErrorStatus(error: unknown): number {
  if (
    error &&
    typeof error === "object" &&
    "status" in error &&
    typeof (error as { status: unknown }).status === "number"
  ) {
    return (error as { status: number }).status;
  }
  if (error instanceof Error) {
    if (/forbidden/i.test(error.message)) return 403;
    if (/unauthorized|operator auth required|not registered/i.test(error.message)) {
      return 401;
    }
  }
  return 400;
}
