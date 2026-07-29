import { randomBytes } from "crypto";

export function createId(prefix: string): string {
  return `${prefix}_${randomBytes(8).toString("hex")}`;
}

export function createTxHash(): string {
  return `0x${randomBytes(32).toString("hex")}`;
}

export function createContractAddress(): string {
  return `0x${randomBytes(20).toString("hex")}`;
}
