/** Demo/memory ledger may synthesize tx hashes. Production requires real on-chain hashes. */
export function isDemoLedgerMode(): boolean {
  return (
    process.env.NODE_ENV === "test" ||
    process.env.NOTORIUS_FORCE_MEMORY === "1"
  );
}

export function isProductionHardening(): boolean {
  return process.env.NODE_ENV === "production" && !isDemoLedgerMode();
}

const TX_HASH_RE = /^0x[a-fA-F0-9]{64}$/;

export function assertTxHash(txHash: string | undefined, label = "txHash"): string {
  if (!txHash || !TX_HASH_RE.test(txHash)) {
    throw new Error(`${label} must be a real 0x-prefixed 32-byte transaction hash`);
  }
  return txHash.toLowerCase();
}
