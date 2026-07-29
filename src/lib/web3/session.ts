import type { Address, Hex } from "viem";
import type { SignedAgreement } from "@/lib/web3/agreement";

export type ContractSession = {
  chainId: number;
  assetName: string;
  symbol: string;
  totalSupplyHuman: string;
  investor: Address;
  countryCode: string;
  registryAddress?: Address;
  tokenAddress?: Address;
  agreement?: SignedAgreement;
  lastTxHash?: Hex;
  updatedAt: string;
};

const KEY = "notorius.contract.session.v1";

type Cache = { raw: string | null; value: ContractSession | null };
let cache: Cache = { raw: null, value: null };
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

export function subscribeContractSession(onStoreChange: () => void) {
  listeners.add(onStoreChange);
  return () => {
    listeners.delete(onStoreChange);
  };
}

export function loadContractSession(): ContractSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw === cache.raw) return cache.value;
    const value = raw ? (JSON.parse(raw) as ContractSession) : null;
    cache = { raw, value };
    return value;
  } catch {
    cache = { raw: null, value: null };
    return null;
  }
}

export function saveContractSession(session: ContractSession) {
  if (typeof window === "undefined") return;
  const raw = JSON.stringify(session);
  localStorage.setItem(KEY, raw);
  cache = { raw, value: session };
  emit();
}

export function clearContractSession() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(KEY);
  cache = { raw: null, value: null };
  emit();
}
