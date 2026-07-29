import { parseUnits } from "viem";

export function safeParseUnits(value: string, decimals = 18): bigint {
  try {
    return parseUnits(value || "0", decimals);
  } catch {
    return BigInt(0);
  }
}
